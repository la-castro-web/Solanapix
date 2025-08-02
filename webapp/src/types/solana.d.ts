import { Transaction } from '@solana/web3.js';

interface SolanaWallet {
  isConnected: boolean;
  publicKey: {
    toBytes(): Uint8Array;
    toString(): string;
  };
  signAndSendTransaction(transaction: Transaction): Promise<{ signature: string }>;
  signTransaction(transaction: Transaction): Promise<Transaction>;
  signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}

declare global {
  interface Window {
    solana?: SolanaWallet;
  }
}

export {}; 