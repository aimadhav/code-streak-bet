import { useState, useEffect, useCallback } from 'react';
import freighterApi from '@stellar/freighter-api';
import { getUserBalance, signAndSubmitTransaction } from '@/lib/stellar';

interface UseFreighterWalletReturn {
  isConnected: boolean;
  publicKey: string | null;
  isLoading: boolean;
  error: string | null;
  balance: number | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  refreshBalance: () => Promise<void>;
  signTransaction: (xdr: string) => Promise<string>;
}

export const useFreighterWallet = (): UseFreighterWalletReturn => {
  const [walletPublicKey, setWalletPublicKey] = useState<string | null>(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);

  // Check if Freighter is installed and connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const result = await freighterApi.isConnected();
        const connected = result && !result.error;
        setIsWalletConnected(connected);
        
        if (connected) {
          const addressResult = await freighterApi.getAddress();
          if (!addressResult.error) {
            setWalletPublicKey(addressResult.address);
          }
        }
      } catch (err) {
        console.error('Error checking Freighter connection:', err);
        setError('Failed to check wallet connection');
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();
  }, []);

  const connectWallet = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if Freighter is installed
      const isInstalled = await freighterApi.isConnected();
      
      if (!isInstalled) {
        throw new Error('Freighter wallet is not installed. Please install it from freighter.app');
      }

      // Request access to Freighter (this will open the popup)
      const addressResult = await freighterApi.getAddress();
      
      if (addressResult.error) {
        throw new Error(addressResult.error);
      }
      
      if (!addressResult.address) {
        throw new Error('Failed to get address from Freighter');
      }
      
      setWalletPublicKey(addressResult.address);
      setIsWalletConnected(true);
      console.log('Wallet connected:', addressResult.address);
    } catch (err: any) {
      console.error('Error connecting wallet:', err);
      setError(err.message || 'Failed to connect wallet. Please make sure Freighter is installed.');
      setIsWalletConnected(false);
      setWalletPublicKey(null);
      throw err; // Re-throw to let the caller handle it
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setWalletPublicKey(null);
    setIsWalletConnected(false);
    setError(null);
    setBalance(null);
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!walletPublicKey) {
      setBalance(null);
      return;
    }
    
    try {
      const accountBalance = await getUserBalance(walletPublicKey);
      setBalance(accountBalance);
    } catch (err: any) {
      console.error('Error fetching balance:', err);
      setError('Failed to fetch balance');
    }
  }, [walletPublicKey]);

  const signTransaction = useCallback(async (xdr: string): Promise<string> => {
    try {
      const txHash = await signAndSubmitTransaction(xdr);
      return txHash;
    } catch (err: any) {
      console.error('Error signing transaction:', err);
      setError(err.message || 'Failed to sign transaction');
      throw err;
    }
  }, []);

  // Refresh balance when wallet is connected
  useEffect(() => {
    if (walletPublicKey) {
      refreshBalance();
    }
  }, [walletPublicKey, refreshBalance]);

  return {
    isConnected: isWalletConnected,
    publicKey: walletPublicKey,
    isLoading,
    error,
    balance,
    connectWallet,
    disconnectWallet,
    refreshBalance,
    signTransaction,
  };
};
