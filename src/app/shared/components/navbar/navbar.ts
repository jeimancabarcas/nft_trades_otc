import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Local Services
import { Web3Service } from '../../services/web3.service';
import { NftService } from '../../services/nft.service';
import { NotificationService } from '../../services/notification.service';
import { ThemeService } from '../../services/theme.service';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  standalone: true,
  imports: [
    CommonModule, 
    ButtonModule, 
    MenubarModule,
    InputTextModule, 
    IconFieldModule, 
    InputIconModule,
    RippleModule,
    RouterModule,
    TooltipModule
  ]
})
export class Navbar {
  web3Service = inject(Web3Service);
  themeService = inject(ThemeService);
  protected nftService = inject(NftService);
  private notificationService = inject(NotificationService);

  // Use a computed signal to build the menu items reactively, including badges
  items = computed<MenuItem[]>(() => {
    const count = this.notificationService.pendingCount();
    
    return [
      {
        label: 'Inventory',
        icon: 'pi pi-th-large',
        routerLink: '/inventory'
      },
      {
        label: 'My Trades',
        icon: 'pi pi-arrow-right-arrow-left',
        routerLink: '/trades',
        // Show badge only when there are pending trades
        badge: count > 0 ? count.toString() : undefined,
        badgeStyleClass: 'p-badge-success'
      }
    ];
  });

  connectWallet() {
    this.web3Service.connectWallet();
  }
}
