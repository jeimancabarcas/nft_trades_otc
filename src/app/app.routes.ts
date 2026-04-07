import { Routes } from '@angular/router';
import { TradeList } from './shared/components/trade-list/trade-list';

export const routes: Routes = [
  { path: '', redirectTo: '/inventory', pathMatch: 'full' },
  { 
    path: 'inventory', 
    loadComponent: () => import('./shared/components/nft-inventory/nft-inventory').then(m => m.NftInventory) 
  },
  { 
    path: 'trades', 
    component: TradeList 
  }
];
