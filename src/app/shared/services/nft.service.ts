import { Injectable, signal } from '@angular/core';
import { Alchemy, Network } from 'alchemy-sdk';
import { environment } from '../../../environments/environment';

export interface NftItem {
  tokenId: string;
  contractAddress: string;
  name: string;
  image: string;
  type: string; // 'Avatar' or 'Room'
}

@Injectable({
  providedIn: 'root'
})
export class NftService {
  private alchemy: Alchemy;

  // Shared search state
  searchTerm = signal<string>('');

  // Trading selection state (Set of tokenId)
  selectedNftIds = signal<Set<string>>(new Set());

  toggleSelection(tokenId: string) {
    const current = new Set(this.selectedNftIds());
    if (current.has(tokenId)) {
      current.delete(tokenId);
    } else {
      current.add(tokenId);
    }
    this.selectedNftIds.set(current);
  }

  clearSelection() {
    this.selectedNftIds.set(new Set());
  }

  /**
   * Complete session reset for security and state consistency:
   * Clears selection and search term.
   */
  resetSession() {
    this.clearSelection();
    this.searchTerm.set('');
  }

  // Contracts required by specification
  private readonly requiredContracts: Record<string, string> = {};

  constructor() {
    // Basic settings using demo open-tier via Alchemy for testing,
    // Note: The apiKey should be replaced with environment variables for production.
    const settings = {
      apiKey: environment.alchemyApiKey,
      network: Network.ETH_MAINNET,
    };
    this.alchemy = new Alchemy(settings);
  }

  async getNftsForOwner(address: string): Promise<NftItem[]> {
    try {
      const response = await this.alchemy.nft.getNftsForOwner(address);

      return response.ownedNfts.map(nft => {
        // Standardize the response based on the defined interface
        const contractLower = nft.contract.address.toLowerCase();

        // Find matching type strictly from the required list (Habbo/Priority)
        // or fall back to the contract name provided by Alchemy
        const typeMatch = Object.entries(this.requiredContracts).find(
          ([k]) => k.toLowerCase() === contractLower
        );
        const type = typeMatch ? typeMatch[1] : (nft.contract.name || 'Unknown Collection');

        // Safely extract canonical image urls preventing protocol blockers
        let imageUrl = '';
        if (nft.image?.originalUrl) {
          imageUrl = nft.image.originalUrl;
        } else if (nft.image?.cachedUrl) {
          imageUrl = nft.image.cachedUrl;
        } else if (nft.raw?.metadata?.['image']) {
          imageUrl = nft.raw.metadata['image'].replace('ipfs://', 'https://ipfs.io/ipfs/');
        }

        // Final IPFS safety check for original/cached if they were raw IPFS strings
        if (imageUrl.startsWith('ipfs://')) {
          imageUrl = imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
        }

        return {
          tokenId: nft.tokenId,
          contractAddress: nft.contract.address,
          name: nft.name || nft.raw?.metadata?.['name'] || `${type} #${nft.tokenId}`,
          image: imageUrl,
          type
        } as NftItem;
      });
    } catch (e) {
      console.error("Error fetching Alchemy NFTs for owner:", e);
      return [];
    }
  }
}
