import { Injectable, signal } from '@angular/core';
import { BrowserProvider } from 'ethers';

// Declare ethereum for typescript
declare global {
  interface Window {
    ethereum?: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class Web3Service {
  currentAccount = signal<string | null>(null);
  provider: BrowserProvider | null = null;

  constructor() {
    this.setupProvider();
  }

  private setupProvider() {
    // Only access window on client
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new BrowserProvider(window.ethereum);
      this.setupListeners();
      this.checkConnection();
    } else {
      console.warn('MetaMask not installed');
    }
  }

  private setupListeners() {
    if (!window.ethereum) return;
    
    window.ethereum.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length > 0) {
        this.currentAccount.set(accounts[0]);
      } else {
        this.currentAccount.set(null);
      }
    });

    window.ethereum.on('chainChanged', () => {
      // Refresh the page on chain change as recommended by MetaMask
      window.location.reload();
    });
  }

  async checkConnection() {
    if (!this.provider || !window.ethereum) return;
    try {
      const accounts = await this.provider.send('eth_accounts', []);
      if (accounts && accounts.length > 0) {
        await this.checkAndSwitchNetwork();
        this.currentAccount.set(accounts[0]);
      }
    } catch (error) {
      console.error('Error checking connection', error);
    }
  }

  async connectWallet() {
    if (!this.provider || !window.ethereum) {
      alert('Please install MetaMask to interact with this application!');
      return;
    }
    
    try {
      await this.checkAndSwitchNetwork();
      const accounts = await this.provider.send('eth_requestAccounts', []);
      if (accounts && accounts.length > 0) {
        this.currentAccount.set(accounts[0]);
      }
    } catch (error) {
      console.error('Error connecting wallet', error);
    }
  }

  private async checkAndSwitchNetwork() {
    if (!window.ethereum) return;
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      // Chain ID '0x1' is strictly Mainnet Ethereum
      if (chainId !== '0x1') {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x1' }],
        });
      }
    } catch (error) {
      console.error('Failed to switch network or user rejected', error);
      throw error;
    }
  }
}
