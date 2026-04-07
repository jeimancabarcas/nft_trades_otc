import { Injectable, inject } from '@angular/core';
import { Database, ref, push, set, serverTimestamp, query, orderByChild, equalTo, onValue, update, onDisconnect, remove } from 'firebase/database';
import { NftItem } from './nft.service';
import { Observable } from 'rxjs';

export interface TradeRequest {
  id?: string;
  sender: string;
  receiver: string;
  items?: NftItem[];
  receiverItems?: NftItem[];
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
  createdAt: any;
  // Mutual agreement flags
  senderAccepted?: boolean;
  receiverAccepted?: boolean;
  gasPayer?: 'sender' | 'receiver' | null;
  lockedByNonPayer?: boolean;
  seaportOrder?: any; // The signed Seaport order payload
  orderHash?: string; // On-chain identifier
  busyAddress?: string | null; // Wallet address of the party currently signing
  presence?: Record<string, boolean>; // Map of wallet addresses currently viewing the trade
}

@Injectable({
  providedIn: 'root'
})
export class TradeService {
  private db = inject<Database>('FIREBASE_DB' as any);

  /**
   * Creates a new trade request in the Firebase Realtime Database.
   * Path: /trades
   */
  async createTrade(sender: string, receiver: string, items: NftItem[]): Promise<string> {
    const tradesRef = ref(this.db, 'trades');
    const newTradeRef = push(tradesRef);

    const tradeData: TradeRequest = {
      sender: sender.toLowerCase(),
      receiver: receiver.toLowerCase(),
      items,
      status: 'pending',
      createdAt: serverTimestamp(),
      senderAccepted: true, // Initial creator accepts by default
      receiverAccepted: false,
      lockedByNonPayer: false
    };

    await set(newTradeRef, tradeData);
    return newTradeRef.key || '';
  }

  /**
   * Real-time update for items or receiverItems.
   * Automatically resets acceptance for both parties if the deal changes.
   */
  async updateTradeItems(tradeId: string, items: NftItem[], role: 'sender' | 'receiver'): Promise<void> {
    const tradeRef = ref(this.db, `trades/${tradeId}`);
    const key = role === 'sender' ? 'items' : 'receiverItems';

    await update(tradeRef, {
      [key]: items,
      senderAccepted: false,
      receiverAccepted: false,
      lockedByNonPayer: false,
      seaportOrder: null, // Clear stale signature
      orderHash: null
    });
  }

  /**
   * Toggles the mutual acceptance flag for a party.
   */
  async setAcceptance(tradeId: string, role: 'sender' | 'receiver', accepted: boolean): Promise<void> {
    const tradeRef = ref(this.db, `trades/${tradeId}`);
    const key = role === 'sender' ? 'senderAccepted' : 'receiverAccepted';

    await update(tradeRef, {
      [key]: accepted,
      lockedByNonPayer: false, // Reset locking if agreement changes
      seaportOrder: null,      // Force re-sign on agreement change
      orderHash: null
    });
  }

  /**
   * Uniquely sets the gas payer for the trade.
   */
  async setGasPayer(tradeId: string, role: 'sender' | 'receiver' | null): Promise<void> {
    const tradeRef = ref(this.db, `trades/${tradeId}`);
    await update(tradeRef, {
      gasPayer: role,
      senderAccepted: false,
      receiverAccepted: false,
      lockedByNonPayer: false, // Reset locking sequence
      seaportOrder: null,      // Gas payer change invalidates signature
      orderHash: null
    });
  }

  /**
   * Step 1 of Finalization: Non-gas payer locks terms.
   */
  async lockTrade(tradeId: string, seaportOrder?: any): Promise<void> {
    const tradeRef = ref(this.db, `trades/${tradeId}`);
    await update(tradeRef, {
      lockedByNonPayer: true,
      seaportOrder: seaportOrder || null
    });
  }

  /**
   * Fetch trades where the user is either the sender or the receiver.
   * Returns an Observable of the combined and sorted list.
   */
  getTradesForUser(walletAddress: string): Observable<TradeRequest[]> {
    const address = walletAddress.toLowerCase();
    const tradesRef = ref(this.db, 'trades');

    return new Observable<TradeRequest[]>(subscriber => {
      // We'll store results from both queries and merge them
      let sentTrades: TradeRequest[] = [];
      let receivedTrades: TradeRequest[] = [];

      const updateResult = () => {
        // Merge, filter duplicates (if any), and sort by timestamp desc
        const combined = [...sentTrades, ...receivedTrades]
          .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        subscriber.next(combined);
      };

      // Query 1: As Sender
      const sentQuery = query(tradesRef, orderByChild('sender'), equalTo(address));
      const unsubSent = onValue(sentQuery, (snapshot) => {
        sentTrades = [];
        snapshot.forEach(child => {
          sentTrades.push({ id: child.key, ...child.val() } as TradeRequest);
        });
        updateResult();
      });

      // Query 2: As Receiver
      const receivedQuery = query(tradesRef, orderByChild('receiver'), equalTo(address));
      const unsubReceived = onValue(receivedQuery, (snapshot) => {
        receivedTrades = [];
        snapshot.forEach(child => {
          receivedTrades.push({ id: child.key, ...child.val() } as TradeRequest);
        });
        updateResult();
      });

      // Return cleanup
      return () => {
        unsubSent();
        unsubReceived();
      };
    });
  }

  /**
   * Accepts a trade request by adding the receiver's items and updating status.
   */
  async acceptTrade(tradeId: string, receiverItems: NftItem[]): Promise<void> {
    const tradeRef = ref(this.db, `trades/${tradeId}`);
    await update(tradeRef, {
      status: 'completed',
      receiverItems
    });
  }

  /**
   * Rejects a trade request.
   */
  async rejectTrade(tradeId: string): Promise<void> {
    const tradeRef = ref(this.db, `trades/${tradeId}`);
    await update(tradeRef, {
      status: 'rejected',
      seaportOrder: null,
      orderHash: null
    });
  }

  /**
   * Identifies which party is currently busy with a wallet action.
   */
  async setBusyAddress(tradeId: string, address: string | null): Promise<void> {
    const tradeRef = ref(this.db, `trades/${tradeId}`);
    await update(tradeRef, {
      busyAddress: address
    });
  }

  /**
   * Updates the real-time presence of a user in a trade.
   */
  async setPresence(tradeId: string, address: string, isPresent: boolean): Promise<void> {
    const presenceRef = ref(this.db, `trades/${tradeId}/presence/${address.toLowerCase()}`);
    
    if (isPresent) {
      await set(presenceRef, true);
      // Ensure cleanup if the connection is lost
      onDisconnect(presenceRef).remove();
    } else {
      await remove(presenceRef);
    }
  }
}
