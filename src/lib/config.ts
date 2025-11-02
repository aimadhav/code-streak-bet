/**
 * Application Configuration
 * Centralized configuration management for environment variables
 * Compatible with fe.md specifications
 */

export const config = {
  // Stellar Network Configuration
  stellar: {
    network: (import.meta.env.VITE_STELLAR_NETWORK || 'testnet') as 'testnet' | 'mainnet',
    contractAddress: import.meta.env.VITE_CHALLENGE_CONTRACT_ADDRESS,
    platformFeeAddress: import.meta.env.VITE_PLATFORM_FEE_ADDRESS,
    horizonUrl: import.meta.env.VITE_STELLAR_NETWORK === 'mainnet'
      ? 'https://horizon.stellar.org'
      : 'https://horizon-testnet.stellar.org',
  },

  // API Configuration
  api: {
    leetcode: import.meta.env.VITE_LEETCODE_API_URL || 'https://leetcode-api-pied.vercel.app',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
    retryAttempts: parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS || '3'),
  },

  // Feature Flags
  features: {
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    notifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true',
    progressMonitoring: import.meta.env.VITE_ENABLE_PROGRESS_MONITORING !== 'false', // Default true
  },

  // Progress Monitoring Configuration
  monitoring: {
    checkInterval: parseInt(import.meta.env.VITE_PROGRESS_CHECK_INTERVAL || '300000'), // 5 minutes default
    enableAutoStart: import.meta.env.VITE_AUTO_START_MONITORING !== 'false', // Default true
  },

  // Cache Configuration
  cache: {
    userProfileTTL: 5 * 60 * 1000, // 5 minutes
    dailyChallengeTTL: 60 * 60 * 1000, // 1 hour
    problemsTTL: 24 * 60 * 60 * 1000, // 24 hours
  },

  // Rate Limiting
  rateLimit: {
    maxRequests: parseInt(import.meta.env.VITE_RATE_LIMIT_MAX_REQUESTS || '20'),
    windowMs: parseInt(import.meta.env.VITE_RATE_LIMIT_WINDOW_MS || '60000'), // 1 minute
  },
};

/**
 * Validate required configuration
 */
export function validateConfig() {
  const errors: string[] = [];

  // Check required Stellar config for production
  if (config.stellar.network === 'mainnet') {
    if (!config.stellar.contractAddress) {
      errors.push('VITE_CHALLENGE_CONTRACT_ADDRESS is required for mainnet');
    }
    if (!config.stellar.platformFeeAddress) {
      errors.push('VITE_PLATFORM_FEE_ADDRESS is required for mainnet');
    }
  }

  // Log warnings for missing optional config
  if (!config.stellar.contractAddress) {
    console.warn('⚠️ VITE_CHALLENGE_CONTRACT_ADDRESS not set - using default testnet address');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration errors:\n${errors.join('\n')}`);
  }

  return true;
}

/**
 * Get network info
 */
export function getNetworkInfo() {
  return {
    name: config.stellar.network,
    horizonUrl: config.stellar.horizonUrl,
    isTestnet: config.stellar.network === 'testnet',
    isMainnet: config.stellar.network === 'mainnet',
  };
}

/**
 * Check if features are enabled
 */
export function isFeatureEnabled(feature: keyof typeof config.features): boolean {
  return config.features[feature];
}

// Validate config on load
try {
  validateConfig();
  console.log('✅ Configuration validated successfully');
  console.log('📡 Network:', config.stellar.network);
  console.log('🔗 API:', config.api.leetcode);
} catch (error) {
  console.error('❌ Configuration validation failed:', error);
}

export default config;
