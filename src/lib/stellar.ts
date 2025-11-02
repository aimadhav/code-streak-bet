/**
 * Stellar Blockchain Integration for XLM Staking
 * 
 * This module handles all Stellar blockchain interactions including:
 * - Smart contract operations for staking XLM
 * - Challenge creation and tracking
 * - Reward/punishment logic
 * - Account management
 * - Integration with LeetCode API for verification
 */

import { 
  Asset, 
  Keypair, 
  TransactionBuilder, 
  Networks, 
  Operation,
  BASE_FEE,
  Memo,
  Transaction,
  Horizon
} from 'stellar-sdk';
import freighterApi from '@stellar/freighter-api';
import { verifyChallengeCompletion } from './leetcode-api';
import { config } from './config';

// Stellar network configuration
const STELLAR_NETWORKS = {
  TESTNET: {
    url: 'https://horizon-testnet.stellar.org',
    networkPassphrase: Networks.TESTNET,
  },
  MAINNET: {
    url: 'https://horizon.stellar.org',
    networkPassphrase: Networks.PUBLIC,
  },
};

// Use config to determine network
const NETWORK_CONFIG = config.stellar.network === 'mainnet'
  ? STELLAR_NETWORKS.MAINNET 
  : STELLAR_NETWORKS.TESTNET;

export const server = new Horizon.Server(config.stellar.horizonUrl);

/**
 * Challenge smart contract address
 * Deployed on Stellar Testnet
 */
export const CHALLENGE_CONTRACT_ADDRESS = config.stellar.contractAddress || 
  'CC5WC6EUFXOGSI52OXTYVY5U6YYVYR7IVH6NQ2NM25EZHBY6OQVXGSVO';

/**
 * Platform fee address (where lost stakes go)
 * Contract deployer address on testnet
 */
export const PLATFORM_FEE_ADDRESS = config.stellar.platformFeeAddress || 
  'GCB2Z3XA2OB4HFCZFUSZPXBT3PFCBT6NV5UTELE2DKCNOSV7K4VTIKVM';

/**
 * XLM Asset (native Stellar asset)
 */
export const XLM_ASSET = Asset.native();

/**
 * Convert XLM amount to stroops (1 XLM = 10,000,000 stroops)
 */
export function xlmToStroops(xlm: string): bigint {
  return BigInt(Math.floor(parseFloat(xlm) * 10000000));
}

/**
 * Convert stroops to XLM
 */
export function stroopsToXlm(stroops: string | number | bigint): string {
  return (Number(stroops) / 10000000).toFixed(7);
}

/**
 * Get user's Stellar account balance
 */
export async function getUserBalance(publicKey: string): Promise<number> {
  try {
    const account = await server.loadAccount(publicKey);
    const xlmBalance = account.balances.find(b => b.asset_type === 'native');
    if (!xlmBalance) return 0;
    return parseFloat(xlmBalance.balance);
  } catch (error) {
    console.error('Error fetching balance:', error);
    throw new Error('Failed to fetch account balance');
  }
}

/**
 * Create a challenge smart contract transaction
 * This locks the staked XLM until challenge completion
 */
export async function createChallengeTransaction(
  publicKey: string,
  stakeAmount: string,
  challengeId: string,
  challengeData: {
    targetCount: number;
    endDate: string;
    goalType: string;
  }
): Promise<string> {
  try {
    // Get the account
    const account = await server.loadAccount(publicKey);
    
    // Convert XLM to stroops
    const amountInStroops = xlmToStroops(stakeAmount);
    
    // Build transaction to lock funds in smart contract
    // In a real implementation, this would interact with a deployed Stellar smart contract
    // For now, we'll create a payment to the contract address with a memo
    
    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_CONFIG.networkPassphrase,
    })
      .addMemo(Memo.text(`CHALLENGE:${challengeId}`))
      .addOperation(
        Operation.payment({
          destination: CHALLENGE_CONTRACT_ADDRESS,
          asset: XLM_ASSET,
          amount: stakeAmount, // Use string amount directly
        })
      )
      .setTimeout(180) // 3 minutes timeout
      .build();
    
    // Get the base64 XDR for signing with Freighter
    return transaction.toXDR();
  } catch (error) {
    console.error('Error creating challenge transaction:', error);
    throw new Error('Failed to create challenge transaction');
  }
}

/**
 * Sign and submit a transaction using Freighter
 */
export async function signAndSubmitTransaction(xdr: string): Promise<string> {
  try {
    // Sign with Freighter
    const signedResult = await freighterApi.signTransaction(xdr, {
      networkPassphrase: NETWORK_CONFIG.networkPassphrase,
    });
    
    if (signedResult.error) {
      throw new Error(signedResult.error);
    }
    
    // Parse the signed transaction
    const signedTransaction = TransactionBuilder.fromXDR(
      signedResult.signedTxXdr,
      NETWORK_CONFIG.networkPassphrase
    );
    
    // Submit to network
    const result = await server.submitTransaction(signedTransaction);
    return result.hash;
  } catch (error: any) {
    console.error('Error signing/submitting transaction:', error);
    throw new Error(error.message || 'Failed to submit transaction');
  }
}

/**
 * Get challenge status from blockchain
 */
export async function getChallengeStatus(challengeId: string): Promise<{
  status: 'active' | 'completed' | 'failed';
  stakeAmount: string;
  startDate: string;
  endDate: string;
}> {
  try {
    // In a real implementation, this would query the smart contract
    // For now, we'll query transactions with the challenge memo
    
    const transactions = await server
      .transactions()
      .forAccount(CHALLENGE_CONTRACT_ADDRESS)
      .call();
    
    // Find transaction with our challenge ID
    const challengeTx = transactions.records.find(tx => 
      tx.memo && (tx.memo as any).match(new RegExp(`CHALLENGE:${challengeId}`))
    );
    
    if (!challengeTx) {
      throw new Error('Challenge not found');
    }
    
    // Extract challenge data from memo/effects
    // This is simplified - in production, query the smart contract state
    
    return {
      status: 'active',
      stakeAmount: '10.0000000',
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
  } catch (error) {
    console.error('Error fetching challenge status:', error);
    throw new Error('Failed to fetch challenge status');
  }
}

/**
 * Complete a challenge - release funds back to user
 */
export async function completeChallenge(
  challengeId: string,
  userPublicKey: string
): Promise<string> {
  try {
    // Get the user's account
    const account = await server.loadAccount(userPublicKey);
    
    // In a real smart contract, this would be a contract invocation
    // For now, we'll create a transaction that the contract would process
    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_CONFIG.networkPassphrase,
    })
      .addMemo(Memo.text(`COMPLETE:${challengeId}`))
      .setTimeout(180) // 3 minutes timeout
      .build();
    
    return transaction.toXDR();
  } catch (error) {
    console.error('Error completing challenge:', error);
    throw new Error('Failed to complete challenge');
  }
}

/**
 * Fail a challenge - forfeit stake to platform
 */
export async function failChallenge(
  challengeId: string,
  userPublicKey: string
): Promise<string> {
  try {
    // In a real smart contract, this would automatically happen
    // The contract would transfer funds to platform fee address
    // For now, we'll create a placeholder transaction
    
    const account = await server.loadAccount(userPublicKey);
    
    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_CONFIG.networkPassphrase,
    })
      .addMemo(Memo.text(`FAIL:${challengeId}`))
      .setTimeout(180) // 3 minutes timeout
      .build();
    
    return transaction.toXDR();
  } catch (error) {
    console.error('Error failing challenge:', error);
    throw new Error('Failed to process challenge failure');
  }
}

/**
 * Check if Freighter is installed and available
 */
export async function isFreighterAvailable(): Promise<boolean> {
  try {
    const result = await freighterApi.isConnected();
    return result && !result.error;
  } catch {
    return false;
  }
}

/**
 * Get the current network (testnet or mainnet)
 */
export function getCurrentNetwork(): 'testnet' | 'mainnet' {
  return import.meta.env.MODE === 'production' ? 'mainnet' : 'testnet';
}

/**
 * Get network display information
 */
export function getNetworkInfo() {
  return {
    name: getCurrentNetwork(),
    ...NETWORK_CONFIG,
  };
}

/**
 * Verify challenge completion using LeetCode API
 * This function checks if the user met their challenge goals
 */
export async function verifyAndCompleteChallenge(
  challengeId: string,
  leetcodeUsername: string,
  challengeData: {
    goalType: 'daily' | 'weekly' | 'custom';
    targetCount: number;
    startDate: string;
    endDate: string;
    dailyQuestions?: number;
    weeklyQuestions?: number;
    weeks?: number;
  }
): Promise<{
  verified: boolean;
  completed: boolean;
  currentProgress: number;
  targetProgress: number;
}> {
  try {
    // Verify using LeetCode API
    const verificationResult = await verifyChallengeCompletion(
      leetcodeUsername,
      challengeData
    );
    
    if (!verificationResult.success) {
      throw new Error('Failed to verify challenge completion');
    }
    
    return {
      verified: true,
      completed: verificationResult.completed,
      currentProgress: verificationResult.currentProgress,
      targetProgress: verificationResult.targetProgress,
    };
  } catch (error) {
    console.error('Error verifying challenge:', error);
    throw new Error('Failed to verify challenge completion');
  }
}

/**
 * Get challenge progress from LeetCode API
 * This can be called during an active challenge to check progress
 */
export async function getChallengeProgress(
  leetcodeUsername: string,
  startDate: string
): Promise<number> {
  try {
    const { verifyChallengeCompletion } = await import('./leetcode-api');
    
    const result = await verifyChallengeCompletion(leetcodeUsername, {
      goalType: 'custom',
      targetCount: 1,
      startDate,
      endDate: new Date().toISOString(),
    });
    
    return result.currentProgress;
  } catch (error) {
    console.error('Error getting challenge progress:', error);
    return 0;
  }
}

/**
 * Helper function to create challenge data for storage
 */
export interface ChallengeData {
  id: string;
  userId: string;
  leetcodeUsername: string;
  publicKey: string;
  goalType: 'daily' | 'weekly' | 'custom';
  targetCount: number;
  dailyQuestions?: number;
  weeklyQuestions?: number;
  weeks?: number;
  stakeAmount: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'failed' | 'cancelled';
  transactionHash?: string;
  currentProgress: number;
  createdAt: string;
}

/**
 * Save challenge to local storage (in production, this would be in a database)
 */
export function saveChallengeToStorage(challenge: ChallengeData): void {
  try {
    const challenges = getChallengesFromStorage();
    challenges.push(challenge);
    localStorage.setItem('leetcode_challenges', JSON.stringify(challenges));
  } catch (error) {
    console.error('Error saving challenge:', error);
  }
}

/**
 * Get all challenges from local storage
 */
export function getChallengesFromStorage(): ChallengeData[] {
  try {
    const stored = localStorage.getItem('leetcode_challenges');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading challenges:', error);
    return [];
  }
}

/**
 * Get challenges for a specific user
 */
export function getUserChallenges(publicKey: string): ChallengeData[] {
  const allChallenges = getChallengesFromStorage();
  return allChallenges.filter(c => c.publicKey === publicKey);
}

/**
 * Update challenge status
 */
export function updateChallengeStatus(
  challengeId: string,
  status: 'active' | 'completed' | 'failed' | 'cancelled',
  currentProgress?: number
): void {
  try {
    const challenges = getChallengesFromStorage();
    const challengeIndex = challenges.findIndex(c => c.id === challengeId);
    
    if (challengeIndex !== -1) {
      challenges[challengeIndex].status = status;
      if (currentProgress !== undefined) {
        challenges[challengeIndex].currentProgress = currentProgress;
      }
      localStorage.setItem('leetcode_challenges', JSON.stringify(challenges));
    }
  } catch (error) {
    console.error('Error updating challenge status:', error);
  }
}

