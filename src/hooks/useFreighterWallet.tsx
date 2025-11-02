import { useState, useEffect } from 'react';
import freighterApi from '@stellar/freighter-api';

export const useFreighterWallet = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const connected = await freighterApi.isConnected();
      if (connected) {
        const result = await freighterApi.getAddress();
        if (result.error) {
          throw new Error(result.error);
        }
        setPublicKey(result.address);
        setIsWalletConnected(true);
      }
    } catch (err) {
      console.error('Error checking wallet connection:', err);
    }
  };

  const connectWallet = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await freighterApi.getAddress();
      if (result.error) {
        throw new Error(result.error);
      }
      setPublicKey(result.address);
      setIsWalletConnected(true);
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      console.error('Error connecting wallet:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setPublicKey(null);
    setIsWalletConnected(false);
  };

  return {
    isWalletConnected,
    publicKey,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
  };
};
