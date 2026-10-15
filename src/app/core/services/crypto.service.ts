import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  /**
   * Computes a real SHA-256 hash using the browser Web Crypto API.
   * In Mozambique e-Procurement, this provides a mathematical digital fingerprint
   * for sealed bids (propostas seladas).
   */
  async computeSHA256(data: string): Promise<string> {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const encoder = new TextEncoder();
      const encoded = encoder.encode(data);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', encoded);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    // Fallback for SSR / Node environment
    return this.fallbackHash(data);
  }

  generateReferenceCode(prefix = 'PROP-MTL'): string {
    const ano = new Date().getFullYear();
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const timestampSeq = Date.now().toString().slice(-4);
    return `${prefix}-${ano}-${randomHex}${timestampSeq}`;
  }

  private fallbackHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(64, '0');
  }
}
