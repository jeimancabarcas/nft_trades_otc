import { Injectable, inject, effect, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';
import { switchMap, tap, filter } from 'rxjs/operators';
import { of } from 'rxjs';

// Local Services
import { Web3Service } from './web3.service';
import { TradeService, TradeRequest } from './trade.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private web3Service = inject(Web3Service);
  private tradeService = inject(TradeService);
  private messageService = inject(MessageService);

  // States for external components
  public pendingCount = signal(0);

  // Set to track already-notified trades during this session
  private notifiedTradeIds = new Set<string>();
  private isFirstLoad = true;

  constructor() {
    this.setupMonitoring();
  }

  private setupMonitoring() {
    // Monitor trades for the current user reactively
    toObservable(this.web3Service.currentAccount).pipe(
      switchMap(account => {
        if (!account) {
          this.notifiedTradeIds.clear();
          this.isFirstLoad = true;
          return of([]);
        }
        return this.tradeService.getTradesForUser(account);
      }),
      tap((trades: TradeRequest[]) => {
        const currentAccount = this.web3Service.currentAccount()?.toLowerCase();
        if (!currentAccount) return;

        // Find new pending trades where the user is the receiver
        const incomingPending = trades.filter(t => 
           t.receiver.toLowerCase() === currentAccount && 
           t.status === 'pending'
        );

        // Update public count for badge
        this.pendingCount.set(incomingPending.length);

        if (this.isFirstLoad) {
          // On first load, mark existing pending trades as "notified" to avoid spamming
          incomingPending.forEach(t => t.id && this.notifiedTradeIds.add(t.id));
          this.isFirstLoad = false;
          return;
        }

        // Notify for trades not previously seen in this session
        incomingPending.forEach(trade => {
          if (trade.id && !this.notifiedTradeIds.has(trade.id)) {
            this.notifiedTradeIds.add(trade.id);
            this.showTradeNotification(trade);
          }
        });
      })
    ).subscribe();
  }

  private showTradeNotification(trade: TradeRequest) {
    this.messageService.add({
      severity: 'info',
      summary: 'New Trade Request',
      detail: `Proposal received from ${this.formatAddress(trade.sender)}. Check "My Trades" to review.`,
      life: 8000,
      sticky: true,
      data: { tradeId: trade.id }
    });
    
    // Aesthetic sound effect could be triggered here
  }

  private formatAddress(address: string) {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }
}
