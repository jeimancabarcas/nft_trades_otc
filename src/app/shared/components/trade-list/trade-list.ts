import { Component, inject, computed, signal, effect } from '@angular/core';
import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { RouterModule } from '@angular/router';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

// Services
import { Web3Service } from '../../services/web3.service';
import { TradeService, TradeRequest } from '../../services/trade.service';
import { SeaportService } from '../../services/seaport.service';
import { environment } from '../../../../environments/environment';

// PrimeNG
import { TabsModule } from 'primeng/tabs';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { NftItem as NftServiceItem, NftService } from '../../services/nft.service';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ScrollPanelModule } from 'primeng/scrollpanel';

@Component({
  selector: 'app-trade-list',
  standalone: true,
  imports: [
    CommonModule, 
    TabsModule, 
    ButtonModule, 
    BadgeModule, 
    TooltipModule, 
    TagModule, 
    MessageModule,
    CardModule,
    RouterModule,
    NgTemplateOutlet,
    DialogModule,
    ToastModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    ScrollPanelModule
  ],
  providers: [MessageService],
  templateUrl: './trade-list.html',
  styles: `
    :host ::ng-deep .p-tabview-nav {
      background: transparent !important;
      border: none !important;
    }
  `,
})
export class TradeList {
  public web3Service = inject(Web3Service);
  private tradeService = inject(TradeService);
  private nftService = inject(NftService);
  private seaportService = inject(SeaportService);
  private messageService = inject(MessageService);

  // Modal and Selection State
  isReviewVisible = signal(false);
  isSubmitting = signal(false);
  activeTradeId = signal<string | null>(null);
  receiverInventory = signal<NftServiceItem[]>([]);
  selectedReceiverIds = signal<Set<string>>(new Set());
  currentStatus = signal<string | null>(null);
  isRevoking = signal(false);
  receiverSearch = signal('');
  counterpartSearch = signal('');
  enableHardRevoke = (environment as any).enableHardRevoke;
  isBusy = computed(() => {
    const trade = this.liveTrade();
    return this.isSubmitting() || this.isRevoking() || (!!trade && !!trade.busyAddress);
  });
  isReadOnly = computed(() => {
    const status = this.liveTrade()?.status;
    return status === 'completed' || status === 'rejected';
  });
  isMeBusy = computed(() => {
    const busy = this.liveTrade()?.busyAddress;
    const me = this.web3Service.currentAccount()?.toLowerCase();
    return busy && me && busy.toLowerCase() === me;
  });

  // We reactively fetch trades whenever the currentAccount changes
  trades = toSignal(
    toObservable(this.web3Service.currentAccount).pipe(
      switchMap(account => {
        if (!account) return of([] as TradeRequest[]);
        return this.tradeService.getTradesForUser(account);
      })
    ),
    { initialValue: [] as TradeRequest[] }
  );

  // Real-time synchronization: Find the active trade in the live trades pool
  liveTrade = computed(() => this.trades().find(t => t.id === this.activeTradeId()));
  
  // Track presence when modal is open
  presenceEffect = effect(() => {
    const isVisible = this.isReviewVisible();
    const tradeId = this.activeTradeId();
    const account = this.web3Service.currentAccount();
    
    if (account && tradeId) {
      this.tradeService.setPresence(tradeId, account, isVisible);
    }
  });

  // Auto-close modal when trade is completed (for both parties)
  autoCloseEffect = effect(() => {
    const status = this.liveTrade()?.status;
    const isVisible = this.isReviewVisible();
    
    if (status === 'completed' && isVisible) {
      // Delay slightly to ensure user sees the success state if they are the payer
      setTimeout(() => {
        this.isReviewVisible.set(false);
        this.activeTradeId.set(null);
      }, 2000);
    }
  });

  // Get list of currently present addresses
  presentUsers = computed(() => {
    const presence = this.liveTrade()?.presence || {};
    return Object.keys(presence).filter(addr => presence[addr] === true);
  });

  // Identify the current user's role in the active trade
  userRole = computed(() => {
    const trade = this.liveTrade();
    const account = this.web3Service.currentAccount()?.toLowerCase();
    if (!trade || !account) return null;
    return trade.sender.toLowerCase() === account ? 'sender' : 'receiver';
  });

  // Sequential finalization helpers
  isGasPayer = computed(() => {
    const trade = this.liveTrade();
    const role = this.userRole();
    if (!trade || !role || !trade.gasPayer) return false;
    return trade.gasPayer === role;
  });

  isLockedByPeer = computed(() => {
    const trade = this.liveTrade();
    return trade?.lockedByNonPayer === true;
  });

  // Acceptance status helpers for UI highlighting
  isMyAcceptanceComplete = computed(() => {
    const trade = this.liveTrade();
    const role = this.userRole();
    if (!trade || !role) return false;
    return role === 'sender' ? (trade.senderAccepted || false) : (trade.receiverAccepted || false);
  });

  isPeerAcceptanceComplete = computed(() => {
    const trade = this.liveTrade();
    const role = this.userRole();
    if (!trade || !role) return false;
    return role === 'sender' ? (trade.receiverAccepted || false) : (trade.senderAccepted || false);
  });

  // Items currently selected by the user to give
  selectedItemsList = computed(() => {
    const ids = this.selectedReceiverIds();
    const inventory = this.receiverInventory();
    return inventory.filter(item => ids.has(item.tokenId));
  });

  filteredReceiverInventory = computed(() => {
    const search = this.receiverSearch().toLowerCase();
    const trade = this.liveTrade();
    
    // If read-only, show historical items from the trade record (unified view)
    if (this.isReadOnly() && trade) {
      const items = this.userRole() === 'sender' ? (trade.items || []) : (trade.receiverItems || []);
      if (!search) return items;
      return items.filter(item => 
        item.name.toLowerCase().includes(search) || 
        item.contractAddress.toLowerCase().includes(search)
      );
    }

    // Otherwise show live available inventory (excluding staged items)
    const selectedIds = this.selectedReceiverIds();
    const items = this.receiverInventory().filter(item => !selectedIds.has(item.tokenId));
    
    if (!search) return items;
    return items.filter(item => 
      item.name.toLowerCase().includes(search) || 
      item.contractAddress.toLowerCase().includes(search)
    );
  });

  filteredCounterpartItems = computed(() => {
    const search = this.counterpartSearch().toLowerCase();
    const trade = this.liveTrade();
    if (!trade) return [];
    
    const items = this.userRole() === 'sender' ? (trade.receiverItems || []) : (trade.items || []);
    if (!search) return items;
    return items.filter(item => 
      item.name.toLowerCase().includes(search) || 
      item.contractAddress.toLowerCase().includes(search)
    );
  });

  private hasCleanedUp = false;
  private cleanupEffect = toObservable(this.trades).subscribe(trades => {
    if (this.hasCleanedUp || trades.length === 0) return;
    
    const account = this.web3Service.currentAccount()?.toLowerCase();
    if (!account) return;

    this.hasCleanedUp = true;
    for (const trade of trades) {
      if (trade.busyAddress?.toLowerCase() === account && trade.id) {
        console.warn(`Cleaning up stale wallet lock for trade: ${trade.id}`);
        this.tradeService.setBusyAddress(trade.id, null);
      }
    }
  });

  // Derived signals for separation
  sentTrades = computed(() => {
    const account = this.web3Service.currentAccount()?.toLowerCase();
    if (!account) return [] as TradeRequest[];
    return this.trades().filter((t: TradeRequest) => t.sender.toLowerCase() === account);
  });

  receivedTrades = computed(() => {
    const account = this.web3Service.currentAccount()?.toLowerCase();
    if (!account) return [] as TradeRequest[];
    return this.trades().filter((t: TradeRequest) => t.receiver.toLowerCase() === account);
  });

  getStatusSeverity(status: string) {
    switch (status) {
      case 'pending': return 'warn';
      case 'accepted': return 'info';
      case 'completed': return 'success';
      case 'rejected': return 'danger';
      case 'cancelled': return 'secondary';
      default: return 'info';
    }
  }

  formatAddress(address: string) {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }

  async reviewOffer(trade: TradeRequest) {
    if (!trade.id) return;
    
    this.activeTradeId.set(trade.id);
    this.isReviewVisible.set(true);
    
    const account = this.web3Service.currentAccount()?.toLowerCase();
    if (!account) return;

    // Load items based on role
    const isSender = trade.sender.toLowerCase() === account;
    const currentItems = isSender ? (trade.items || []) : (trade.receiverItems || []);
    
    // Seed selection with current state using safe null check
    this.selectedReceiverIds.set(new Set(currentItems.map(i => i.tokenId)));

    // For finalized trades, we skip loading live inventory as assets may have moved or it's a historical view
    if (trade.status === 'completed' || trade.status === 'rejected') {
      this.receiverInventory.set([]);
      return;
    }

    // Load live inventory for active trades to allow editing
    const items = await this.nftService.getNftsForOwner(account);
    this.receiverInventory.set(items);
  }

  async toggleLocalAcceptance() {
    const trade = this.liveTrade();
    const role = this.userRole();
    if (this.isReadOnly() || !trade || !trade.id || !role || this.isBusy()) return;

    const currentAcceptance = role === 'sender' ? trade.senderAccepted : trade.receiverAccepted;
    
    // Prevent acceptance if either side is empty
    if (!currentAcceptance && ((trade.items?.length || 0) === 0 || (trade.receiverItems?.length || 0) === 0)) {
      this.messageService.add({ 
        severity: 'warn', 
        summary: 'Action Blocked', 
        detail: 'Both parties must select at least one asset before accepting terms.' 
      });
      return;
    }

    await this.tradeService.setAcceptance(trade.id, role, !currentAcceptance);
  }

  async toggleGasPayer() {
    const trade = this.liveTrade();
    const role = this.userRole();
    if (this.isReadOnly() || !trade || !trade.id || !role || this.isBusy()) return;

    // Only allow claiming if unclaimed, or untoggling if we are the current payer
    if (trade.gasPayer && trade.gasPayer !== role) return;

    const newPayer = trade.gasPayer === role ? null : role;
    await this.tradeService.setGasPayer(trade.id, newPayer);
  }

  toggleReceiverSelection(tokenId: string) {
    if (this.isReadOnly() || this.isBusy()) return;
    const current = new Set(this.selectedReceiverIds());
    if (current.has(tokenId)) {
      current.delete(tokenId);
    } else {
      current.add(tokenId);
    }
    this.selectedReceiverIds.set(current);
    
    // Instantly sync selection to the trade record (handshake)
    this.syncItemsToTrade();
  }

  private async syncItemsToTrade() {
    const tradeId = this.activeTradeId();
    const role = this.userRole();
    if (!tradeId || !role) return;

    const selectedItems = this.receiverInventory().filter(i => 
      this.selectedReceiverIds().has(i.tokenId)
    );

    // This resets both acceptance flags to ensure mutual re-review
    await this.tradeService.updateTradeItems(tradeId, selectedItems, role);
  }

  async confirmAcceptance() {
    const trade = this.liveTrade();
    const role = this.userRole();
    if (!trade || !trade.id || !role) return;

    this.isSubmitting.set(true);
    await this.tradeService.setBusyAddress(trade.id, this.web3Service.currentAccount());
    
    try {
      // Safety Step: Ensure both sides have items
      if ((trade.items?.length || 0) === 0 || (trade.receiverItems?.length || 0) === 0) {
        throw new Error('Both parties must have at least one asset before finalization.');
      }

      // Step 0: Ensure mutual agreement
      if (!trade.senderAccepted || !trade.receiverAccepted || !trade.gasPayer) {
        throw new Error('Mutual acceptance and gas payer required.');
      }

      const isPayer = trade.gasPayer === role;

      if (!isPayer) {
        // Step 1: Non-payer signs the Seaport order
        this.messageService.add({ severity: 'info', summary: 'Signing', detail: 'Please sign the trade order in your wallet...' });
        
        // Define what we give vs what we want
        const offerItems = role === 'sender' ? (trade.items || []) : (trade.receiverItems || []);
        const considerationItems = role === 'sender' ? (trade.receiverItems || []) : (trade.items || []);
        
        const seaportOrder = await this.seaportService.createTradeOrder(
          this.web3Service.currentAccount()!,
          offerItems,
          considerationItems,
          (msg) => this.currentStatus.set(msg)
        );

        // Lock terms in Firebase with the signed order payload
        await this.tradeService.lockTrade(trade.id, seaportOrder);
        
        this.messageService.add({ 
            severity: 'success', 
            summary: 'Order Signed', 
            detail: 'Terms locked and signed. Waiting for peer to finalize on-chain.' 
        });
      } else {
        // Step 2: Payer finalizes on-chain (only if peer has locked/signed)
        if (!trade.lockedByNonPayer || !trade.seaportOrder) {
            throw new Error('Waiting for peer to sign and lock terms locally.');
        }

        this.messageService.add({ severity: 'info', summary: 'Settling', detail: 'Executing the decentralized swap on Ethereum...' });

        // Fulfill the Seaport order on-chain
        await this.seaportService.fulfillTradeOrder(
          trade.seaportOrder, 
          this.web3Service.currentAccount()!,
          (msg) => this.currentStatus.set(msg)
        );

        // Update Firebase status
        await this.tradeService.acceptTrade(trade.id, trade.receiverItems || []);
        
        this.messageService.add({ 
            severity: 'success', 
            summary: 'Trade Settled', 
            detail: 'The decentralized exchange was successful. NFTs are being transferred.' 
        });
        
        this.isReviewVisible.set(false);
        this.activeTradeId.set(null);
      }
    } catch (error: any) {
      console.error('Trade action failed:', error);
      
      const isRejected = error.code === 4001 || 
                        error.message?.toLowerCase().includes('user rejected') ||
                        error.info?.error?.code === 4001;

      if (isRejected) {
        // Automatically remove the confirmation for BOTH SIDES in Firebase as requested
        await this.tradeService.resetTradeAcceptance(trade.id);

        this.messageService.add({ 
          severity: 'warn', 
          summary: 'Transaction Cancelled', 
          detail: 'The action was rejected by your wallet. Acceptance has been reset for both parties.' 
        });
      } else {
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Action Failed', 
          detail: error.message || 'Could not process the blockchain request.' 
        });
      }
    } finally {
      this.isSubmitting.set(false);
      await this.tradeService.setBusyAddress(trade.id, null);
      this.currentStatus.set(null);
    }
  }

  async hardRevoke(trade: TradeRequest) {
    if (!trade.id || !trade.seaportOrder || !this.web3Service.currentAccount()) return;
    
    this.isRevoking.set(true);
    await this.tradeService.setBusyAddress(trade.id, this.web3Service.currentAccount());
    this.currentStatus.set("Hard Revoking on-chain (costs gas)...");
    
    try {
      await this.seaportService.cancelTradeOrder(
        trade.seaportOrder,
        this.web3Service.currentAccount()!
      );
      
      // After on-chain cancel, clear off-chain
      const role = this.userRole();
      if (role) {
        await this.tradeService.setAcceptance(trade.id!, role, false);
      }
      
      this.messageService.add({ 
        severity: 'success', 
        summary: 'Revoked', 
        detail: 'Order permanently invalidated on-chain.' 
      });
    } catch (error: any) {
      console.error('Revocation failed:', error);
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Revoke Failed', 
        detail: error.message || 'Signature could not be invalidated on-chain.' 
      });
    } finally {
      this.isRevoking.set(false);
      if (trade.id) await this.tradeService.setBusyAddress(trade.id, null);
      this.currentStatus.set(null);
    }
  }

  async rejectOffer(trade: TradeRequest) {
    if (!trade.id) return;
    
    try {
      await this.tradeService.rejectTrade(trade.id);
      this.messageService.add({ 
        severity: 'info', 
        summary: 'Trade Rejected', 
        detail: 'You have declined the trade proposal.' 
      });
      this.isReviewVisible.set(false);
    } catch (error) {
       this.messageService.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Failed to reject trade.' 
      });
    }
  }
}
