/**
 * Challenge Progress Monitor
 * 
 * This service regularly checks challenge progress and updates smart contracts
 * Runs in the browser for each active challenge
 */

import { ChallengeData, getUserChallenges, updateChallengeStatus } from './stellar';
import { trackUserProgress, verifyChallengeCompletion } from './leetcode-api';
import { apiClient } from './api-client';

export interface ProgressUpdate {
  challengeId: string;
  currentProgress: number;
  targetProgress: number;
  progressPercentage: number;
  lastChecked: string;
  isCompleted: boolean;
  isExpired: boolean;
}

class ChallengeProgressMonitor {
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private updateCallbacks: Map<string, (update: ProgressUpdate) => void> = new Map();
  private readonly CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes

  /**
   * Start monitoring a specific challenge
   */
  startMonitoring(
    challenge: ChallengeData,
    onUpdate?: (update: ProgressUpdate) => void
  ) {
    // Don't monitor if already monitoring
    if (this.intervals.has(challenge.id)) {
      console.log(`Already monitoring challenge ${challenge.id}`);
      return;
    }

    console.log(`Starting progress monitoring for challenge ${challenge.id}`);

    // Store callback
    if (onUpdate) {
      this.updateCallbacks.set(challenge.id, onUpdate);
    }

    // Check immediately
    this.checkProgress(challenge);

    // Then check periodically
    const interval = setInterval(() => {
      this.checkProgress(challenge);
    }, this.CHECK_INTERVAL);

    this.intervals.set(challenge.id, interval);
  }

  /**
   * Stop monitoring a specific challenge
   */
  stopMonitoring(challengeId: string) {
    const interval = this.intervals.get(challengeId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(challengeId);
      this.updateCallbacks.delete(challengeId);
      console.log(`Stopped monitoring challenge ${challengeId}`);
    }
  }

  /**
   * Stop all monitoring
   */
  stopAll() {
    this.intervals.forEach((interval, challengeId) => {
      clearInterval(interval);
      console.log(`Stopped monitoring challenge ${challengeId}`);
    });
    this.intervals.clear();
    this.updateCallbacks.clear();
  }

  /**
   * Check progress for a challenge
   */
  private async checkProgress(challenge: ChallengeData) {
    try {
      console.log(`Checking progress for challenge ${challenge.id}...`);

      // Skip if already completed or failed
      if (challenge.status !== 'active') {
        this.stopMonitoring(challenge.id);
        return;
      }

      const now = new Date();
      const endDate = new Date(challenge.endDate);
      const isExpired = now > endDate;

      // Get current progress
      const progress = await trackUserProgress(
        challenge.leetcodeUsername,
        new Date(challenge.startDate),
        isExpired ? endDate : now
      );

      const currentProgress = progress.length > 0
        ? progress[progress.length - 1].questionsSolved
        : 0;

      const progressPercentage = (currentProgress / challenge.targetCount) * 100;

      // Create update object
      const update: ProgressUpdate = {
        challengeId: challenge.id,
        currentProgress,
        targetProgress: challenge.targetCount,
        progressPercentage,
        lastChecked: now.toISOString(),
        isCompleted: false,
        isExpired,
      };

      // If challenge has expired, verify completion
      if (isExpired) {
        const verification = await verifyChallengeCompletion(
          challenge.leetcodeUsername,
          {
            goalType: challenge.goalType,
            targetCount: challenge.targetCount,
            startDate: challenge.startDate,
            endDate: challenge.endDate,
            dailyQuestions: challenge.dailyQuestions,
            weeklyQuestions: challenge.weeklyQuestions,
            weeks: challenge.weeks,
          }
        );

        update.isCompleted = verification.completed;

        // Update status in storage
        const newStatus = verification.completed ? 'completed' : 'failed';
        updateChallengeStatus(challenge.id, newStatus, currentProgress);

        console.log(
          `Challenge ${challenge.id} ended: ${newStatus} (${currentProgress}/${challenge.targetCount})`
        );

        // Stop monitoring completed/failed challenge
        this.stopMonitoring(challenge.id);
      } else {
        // Update current progress in storage
        updateChallengeStatus(challenge.id, 'active', currentProgress);
      }

      // Call callback if registered
      const callback = this.updateCallbacks.get(challenge.id);
      if (callback) {
        callback(update);
      }

      console.log(`Progress update:`, update);
    } catch (error) {
      console.error(`Error checking progress for challenge ${challenge.id}:`, error);
    }
  }

  /**
   * Get monitoring status
   */
  getMonitoringStatus(challengeId: string): boolean {
    return this.intervals.has(challengeId);
  }

  /**
   * Get all monitored challenges
   */
  getMonitoredChallenges(): string[] {
    return Array.from(this.intervals.keys());
  }
}

// Export singleton instance
export const progressMonitor = new ChallengeProgressMonitor();

/**
 * Auto-start monitoring for all active challenges
 */
export function startMonitoringAllChallenges(publicKey: string) {
  const challenges = getUserChallenges(publicKey);
  const activeChallenges = challenges.filter(c => c.status === 'active');

  console.log(`Starting monitoring for ${activeChallenges.length} active challenges`);

  activeChallenges.forEach(challenge => {
    progressMonitor.startMonitoring(challenge);
  });
}

/**
 * React Hook for challenge progress monitoring
 */
export function useChallengeProgressMonitor(challenge: ChallengeData | null) {
  const [progressUpdate, setProgressUpdate] = React.useState<ProgressUpdate | null>(null);

  React.useEffect(() => {
    if (!challenge || challenge.status !== 'active') {
      return;
    }

    // Start monitoring with callback
    progressMonitor.startMonitoring(challenge, (update) => {
      setProgressUpdate(update);
    });

    // Cleanup
    return () => {
      progressMonitor.stopMonitoring(challenge.id);
    };
  }, [challenge?.id]);

  return progressUpdate;
}

// Add React import at the top for the hook
import React from 'react';
