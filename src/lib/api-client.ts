/**
 * Unified API Client with Caching, Rate Limiting, and Error Handling
 * Compatible with fe.md specifications
 */

import { 
  LeetCodeUserProfile, 
  LeetCodeSubmission, 
  UserProgressSnapshot 
} from './leetcode-api';

// Configuration
const LEETCODE_API_BASE_URL = import.meta.env.VITE_LEETCODE_API_URL || 'https://leetcode-api-pied.vercel.app';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000');

// API Error Class
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Simple Cache with TTL
class APICache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any, ttl?: number) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get(key: string, ttl?: number): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    const maxAge = ttl || this.defaultTTL;
    
    if (age > maxAge) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear() {
    this.cache.clear();
  }
}

// Rate Limiter
class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 20, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async throttle(): Promise<void> {
    const now = Date.now();

    // Remove old requests outside window
    this.requests = this.requests.filter(
      time => now - time < this.windowMs
    );

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.windowMs - (now - oldestRequest);

      console.log(`Rate limit reached. Waiting ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));

      return this.throttle();
    }

    this.requests.push(now);
  }
}

// Request Deduplicator
class RequestDeduplicator {
  private pending = new Map<string, Promise<any>>();

  async dedupe<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
    // Return existing promise if pending
    if (this.pending.has(key)) {
      return this.pending.get(key)!;
    }

    // Create new promise
    const promise = fetchFn().finally(() => {
      this.pending.delete(key);
    });

    this.pending.set(key, promise);
    return promise;
  }
}

// Main API Client
export class APIClient {
  private baseURL: string;
  private timeout: number;
  private cache: APICache;
  private rateLimiter: RateLimiter;
  private deduplicator: RequestDeduplicator;

  constructor() {
    this.baseURL = LEETCODE_API_BASE_URL;
    this.timeout = API_TIMEOUT;
    this.cache = new APICache();
    this.rateLimiter = new RateLimiter(20, 60000); // 20 req/min
    this.deduplicator = new RequestDeduplicator();
  }

  /**
   * Generic GET request with caching, rate limiting, and error handling
   */
  async get<T>(endpoint: string, options?: {
    cache?: boolean;
    cacheTTL?: number;
  }): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const cacheKey = `GET:${endpoint}`;

    // Check cache
    if (options?.cache) {
      const cached = this.cache.get(cacheKey, options.cacheTTL);
      if (cached) {
        console.log(`Cache hit: ${cacheKey}`);
        return cached;
      }
    }

    // Deduplicate concurrent requests
    return this.deduplicator.dedupe(cacheKey, async () => {
      // Rate limit
      await this.rateLimiter.throttle();

      // Fetch with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      try {
        const response = await fetch(url, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            // Response not JSON
          }

          throw new APIError(errorMessage, response.status, response);
        }

        const data = await response.json();

        // Cache if requested
        if (options?.cache) {
          this.cache.set(cacheKey, data, options.cacheTTL);
        }

        return data;
      } catch (error) {
        clearTimeout(timeoutId);
        
        if (error instanceof APIError) {
          throw error;
        }

        // Network error or timeout
        throw new APIError(
          'Network error: Unable to reach the server',
          0,
          error
        );
      }
    });
  }

  /**
   * Get user profile with caching
   */
  async getUserProfile(username: string): Promise<LeetCodeUserProfile> {
    return this.get<LeetCodeUserProfile>(`/user/${username}`, {
      cache: true,
      cacheTTL: 5 * 60 * 1000, // 5 minutes
    });
  }

  /**
   * Get user submissions (no cache for real-time tracking)
   */
  async getUserSubmissions(username: string, limit: number = 100): Promise<LeetCodeSubmission[]> {
    return this.get<LeetCodeSubmission[]>(
      `/user/${username}/submissions?limit=${limit}`
    );
  }

  /**
   * Get daily challenge (cached for 1 hour)
   */
  async getDailyChallenge() {
    return this.get('/daily', {
      cache: true,
      cacheTTL: 60 * 60 * 1000, // 1 hour
    });
  }

  /**
   * Search problems
   */
  async searchProblems(query: string) {
    return this.get(`/search?query=${encodeURIComponent(query)}`);
  }

  /**
   * Get problem details (cached for 24 hours)
   */
  async getProblemDetails(idOrSlug: string) {
    return this.get(`/problem/${idOrSlug}`, {
      cache: true,
      cacheTTL: 24 * 60 * 60 * 1000, // 24 hours
    });
  }

  /**
   * Get all problems (cached for 24 hours)
   */
  async getAllProblems() {
    return this.get('/problems', {
      cache: true,
      cacheTTL: 24 * 60 * 60 * 1000, // 24 hours
    });
  }

  /**
   * Get random problem
   */
  async getRandomProblem() {
    return this.get('/random');
  }

  /**
   * Health check
   */
  async healthCheck() {
    return this.get('/health');
  }

  /**
   * Clear all cache
   */
  clearCache() {
    this.cache.clear();
  }
}

// Export singleton instance
export const apiClient = new APIClient();
