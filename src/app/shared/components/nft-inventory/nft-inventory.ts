import { Component, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MessageModule } from 'primeng/message';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';

// Services
import { Web3Service } from '../../services/web3.service';
import { NftService, NftItem } from '../../services/nft.service';
import { TradeService } from '../../services/trade.service';
import { ClassNamesModule } from 'primeng/classnames';

@Component({
  selector: 'app-nft-inventory',
  templateUrl: './nft-inventory.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    SkeletonModule,
    ButtonModule,
    TooltipModule,
    MessageModule,
    DialogModule,
    InputTextModule,
    ToastModule,
    ClassNamesModule
  ],
  providers: [MessageService]
})
export class NftInventory {
  web3Service = inject(Web3Service);
  protected nftService = inject(NftService);
  private tradeService = inject(TradeService);
  private messageService = inject(MessageService);

  inventoryItems = signal<NftItem[]>([]);
  isLoading = signal<boolean>(false);

  // Trade Modal State
  isTradeModalVisible = signal<boolean>(false);
  receiverWallet = signal<string>('');
  isSubmitting = signal<boolean>(false);

  // Computed
  totalCount = computed(() => this.inventoryItems().length);
  selectedCount = computed(() => this.nftService.selectedNftIds().size);

  // Get full NFT objects for the selected IDs to show images in the dialog
  selectedItems = computed(() => {
    const selectedIds = this.nftService.selectedNftIds();
    return this.inventoryItems().filter(item => selectedIds.has(item.tokenId));
  });

  isValidReceiver = computed(() => {
    const val = this.receiverWallet().trim();
    return /^0x[a-fA-F0-9]{40}$/.test(val);
  });

  /**
   * Correct search implementation:
   * We derive a new signal representing only matching items.
   * This updates automatically when either the inventory or the search signal changes.
   */
  filteredItems = computed(() => {
    const term = this.nftService.searchTerm().toLowerCase().trim();
    if (!term) return this.inventoryItems();

    return this.inventoryItems().filter(item =>
      item.name.toLowerCase().includes(term) ||
      item.tokenId.toLowerCase().includes(term)
    );
  });

  constructor() {
    // We use an effect here responding to currentAccount changes to asynchronously trigger data fetching.
    // Notice that tracking the account happens synchronously, and the writes happen in decoupled async methods.
    effect(() => {
      const account = this.web3Service.currentAccount();

      if (account) {
        this.loadInventory(account);
      } else {
        // Essential session cleanup:
        // 1. Clears local component memory (inventoryItems)
        // 2. Clears shared global state (selections, search term)
        this.inventoryItems.set([]);
        this.nftService.resetSession();
      }
    });
  }

  refresh() {
    const account = this.web3Service.currentAccount();
    if (account) {
      this.loadInventory(account);
    }
  }

  private async loadInventory(address: string) {
    this.isLoading.set(true);
    try {
      const result = await this.nftService.getNftsForOwner(address);
      this.inventoryItems.set(result);
    } catch (e) {
      console.error('Failed to load inventory', e);
      this.inventoryItems.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  openTradeModal() {
    this.receiverWallet.set('');
    this.isTradeModalVisible.set(true);
  }

  async confirmTradeRequest() {
    const sender = this.web3Service.currentAccount();
    const receiver = this.receiverWallet().trim();
    const selectedIds = this.nftService.selectedNftIds();

    if (!sender || !receiver || selectedIds.size === 0) return;

    this.isSubmitting.set(true);
    try {
      // Get full NFT objects for the trade record
      const selectedItems = this.inventoryItems().filter(item => selectedIds.has(item.tokenId));

      await this.tradeService.createTrade(sender, receiver, selectedItems);

      this.messageService.add({
        severity: 'success',
        summary: 'Trade Request Sent',
        detail: `Proposal sent to ${receiver.substring(0, 6)}...${receiver.substring(38)}`,
        life: 5000
      });

      this.isTradeModalVisible.set(false);
      this.nftService.clearSelection();
    } catch (error) {
      console.error('Trade creation failed:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Submission Failed',
        detail: 'Could not create trade request in Firebase.',
        life: 5000
      });
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
