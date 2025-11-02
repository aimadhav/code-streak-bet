/**
 * LeetCode API Integration
 * 
 * This module integrates with the LeetCode API to:
 * - Fetch user profile and stats
 * - Track submission history
 * - Monitor challenge progress
 * - Verify question completions
 * 
 * Compatible with fe.md API specifications
 */

import { apiClient, APIError } from './api-client';

const LEETCODE_API_BASE_URL = import.meta.env.VITE_LEETCODE_API_URL || 'https://leetcode-api-pied.vercel.app';

export interface LeetCodeProblem {
  questionId: string;
  questionFrontendId: string;
  title: string;
  titleSlug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  isPaidOnly: boolean;
  acRate: number;
  topicTags: string[];
}

export interface LeetCodeUserProfile {
  username: string;
  name: string;
  avatar: string;
  ranking: number;
  reputation: number;
  gitHub: string;
  twitter: string;
  linkedIN: string;
  profile: {
    realName: string;
    aboutMe: string;
    userAvatar: string;
    reputation: number;
    ranking: number;
  };
  submitStats: {
    acSubmissionNum: Array<{
      difficulty: string;
      count: number;
      submissions: number;
    }>;
    totalSubmissionNum: Array<{
      difficulty: string;
      count: number;
      submissions: number;
    }>;
  };
}

export interface LeetCodeSubmission {
  title: string;
  titleSlug: string;
  timestamp: string;
  statusDisplay: string;
  lang: string;
}

export interface LeetCodeContest {
  title: string;
  startTime: number;
  ranking: number;
  problemsSolved: number;
}

export interface UserProgressSnapshot {
  date: string;
  questionsSolved: number;
  submissionCount: number;
  lastSubmissionTime?: string;
}

/**
 * Fetch user profile from LeetCode
 * Uses API client with caching and error handling
 */
export async function getLeetCodeProfile(username: string): Promise<LeetCodeUserProfile> {
  try {
    return await apiClient.getUserProfile(username);
  } catch (error) {
    if (error instanceof APIError) {
      if (error.statusCode === 404) {
        throw new Error('User not found. Please check the username.');
      }
      if (error.statusCode === 429) {
        throw new Error('Too many requests. Please try again later.');
      }
    }
    console.error('Error fetching LeetCode profile:', error);
    throw new Error('Failed to fetch LeetCode profile. Please check the username.');
  }
}

/**
 * Get user's recent submissions
 * No caching for real-time progress tracking
 */
export async function getUserSubmissions(
  username: string,
  limit: number = 100
): Promise<LeetCodeSubmission[]> {
  try {
    return await apiClient.getUserSubmissions(username, limit);
  } catch (error) {
    if (error instanceof APIError) {
      if (error.statusCode === 404) {
        throw new Error('User not found or has no submissions.');
      }
    }
    console.error('Error fetching submissions:', error);
    throw new Error('Failed to fetch LeetCode submissions.');
  }
}

/**
 * Get user's recent contest participation
 */
export async function getUserContests(username: string): Promise<LeetCodeContest[]> {
  try {
    const response = await fetch(`${LEETCODE_API_BASE_URL}/user/${username}/contests`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch contests: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching contests:', error);
    throw new Error('Failed to fetch LeetCode contests.');
  }
}

/**
 * Get daily coding challenge
 * Cached for 1 hour
 */
export async function getDailyChallenge(): Promise<any> {
  try {
    return await apiClient.getDailyChallenge();
  } catch (error) {
    console.error('Error fetching daily challenge:', error);
    throw new Error('Failed to fetch daily challenge.');
  }
}

/**
 * Search for problems
 */
export async function searchProblems(query: string): Promise<any[]> {
  try {
    return await apiClient.searchProblems(query);
  } catch (error) {
    console.error('Error searching problems:', error);
    throw new Error('Failed to search problems.');
  }
}

/**
 * Get all problems
 * Cached for 24 hours
 */
export async function getAllProblems(): Promise<any[]> {
  try {
    return await apiClient.getAllProblems();
  } catch (error) {
    console.error('Error fetching all problems:', error);
    throw new Error('Failed to fetch problems list.');
  }
}

/**
 * Get problem details
 * Cached for 24 hours
 */
export async function getProblemDetails(idOrSlug: string): Promise<any> {
  try {
    return await apiClient.getProblemDetails(idOrSlug);
  } catch (error) {
    console.error('Error fetching problem details:', error);
    throw new Error('Failed to fetch problem details.');
  }
}

/**
 * Track user progress over a date range
 * This calculates how many questions were solved between start and end dates
 */
export async function trackUserProgress(
  username: string,
  startDate: Date,
  endDate: Date = new Date()
): Promise<UserProgressSnapshot[]> {
  try {
    const submissions = await getUserSubmissions(username, 100);
    
    // Filter accepted submissions within date range
    const acceptedSubmissions = submissions.filter(sub => {
      const subDate = new Date(parseInt(sub.timestamp) * 1000);
      return (
        sub.statusDisplay === 'Accepted' &&
        subDate >= startDate &&
        subDate <= endDate
      );
    });

    // Group by date and count unique problems
    const progressMap = new Map<string, Set<string>>();
    
    acceptedSubmissions.forEach(sub => {
      const subDate = new Date(parseInt(sub.timestamp) * 1000);
      const dateKey = subDate.toISOString().split('T')[0];
      
      if (!progressMap.has(dateKey)) {
        progressMap.set(dateKey, new Set());
      }
      
      progressMap.get(dateKey)?.add(sub.titleSlug);
    });

    // Convert to snapshots with cumulative count
    const snapshots: UserProgressSnapshot[] = [];
    let cumulativeCount = 0;
    
    // Generate daily snapshots from start to end date
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const dailyCount = progressMap.get(dateKey)?.size || 0;
      cumulativeCount += dailyCount;
      
      snapshots.push({
        date: dateKey,
        questionsSolved: cumulativeCount,
        submissionCount: dailyCount,
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return snapshots;
  } catch (error) {
    console.error('Error tracking user progress:', error);
    throw new Error('Failed to track user progress.');
  }
}

/**
 * Check if user met their daily goal
 */
export async function checkDailyGoal(
  username: string,
  questionsPerDay: number,
  startDate: Date
): Promise<{
  currentStreak: number;
  totalDays: number;
  goalMet: boolean;
  progress: UserProgressSnapshot[];
}> {
  try {
    const progress = await trackUserProgress(username, startDate);
    
    let currentStreak = 0;
    let goalMet = true;
    
    for (let i = 0; i < progress.length; i++) {
      const expectedCount = (i + 1) * questionsPerDay;
      
      if (progress[i].questionsSolved >= expectedCount) {
        currentStreak++;
      } else {
        goalMet = false;
        break;
      }
    }
    
    return {
      currentStreak,
      totalDays: progress.length,
      goalMet,
      progress,
    };
  } catch (error) {
    console.error('Error checking daily goal:', error);
    throw new Error('Failed to check daily goal.');
  }
}

/**
 * Check if user met their weekly goal
 */
export async function checkWeeklyGoal(
  username: string,
  questionsPerWeek: number,
  startDate: Date,
  weeks: number
): Promise<{
  completedWeeks: number;
  totalWeeks: number;
  goalMet: boolean;
  progress: UserProgressSnapshot[];
}> {
  try {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (weeks * 7));
    
    const progress = await trackUserProgress(username, startDate, endDate);
    
    let completedWeeks = 0;
    
    for (let week = 0; week < weeks; week++) {
      const weekStart = week * 7;
      const weekEnd = Math.min((week + 1) * 7, progress.length);
      
      if (weekEnd > weekStart) {
        const weekProgress = progress[weekEnd - 1].questionsSolved - 
          (weekStart > 0 ? progress[weekStart - 1].questionsSolved : 0);
        
        if (weekProgress >= questionsPerWeek) {
          completedWeeks++;
        }
      }
    }
    
    const goalMet = completedWeeks === weeks;
    
    return {
      completedWeeks,
      totalWeeks: weeks,
      goalMet,
      progress,
    };
  } catch (error) {
    console.error('Error checking weekly goal:', error);
    throw new Error('Failed to check weekly goal.');
  }
}

/**
 * Verify challenge completion
 * This is the main function that will be called by the smart contract
 */
export async function verifyChallengeCompletion(
  username: string,
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
  success: boolean;
  completed: boolean;
  currentProgress: number;
  targetProgress: number;
  progressSnapshots: UserProgressSnapshot[];
}> {
  try {
    const startDate = new Date(challengeData.startDate);
    const endDate = new Date(challengeData.endDate);
    const now = new Date();
    
    // Check if challenge period has ended
    if (now < endDate) {
      // Challenge is still ongoing, get current progress
      const progress = await trackUserProgress(username, startDate, now);
      const currentProgress = progress.length > 0 
        ? progress[progress.length - 1].questionsSolved 
        : 0;
      
      return {
        success: true,
        completed: false,
        currentProgress,
        targetProgress: challengeData.targetCount,
        progressSnapshots: progress,
      };
    }
    
    // Challenge period has ended, verify completion
    let result;
    
    if (challengeData.goalType === 'daily' && challengeData.dailyQuestions) {
      result = await checkDailyGoal(
        username,
        challengeData.dailyQuestions,
        startDate
      );
      
      return {
        success: true,
        completed: result.goalMet,
        currentProgress: result.progress.length > 0 
          ? result.progress[result.progress.length - 1].questionsSolved 
          : 0,
        targetProgress: challengeData.targetCount,
        progressSnapshots: result.progress,
      };
    } else if (challengeData.goalType === 'weekly' && challengeData.weeklyQuestions && challengeData.weeks) {
      result = await checkWeeklyGoal(
        username,
        challengeData.weeklyQuestions,
        startDate,
        challengeData.weeks
      );
      
      return {
        success: true,
        completed: result.goalMet,
        currentProgress: result.progress.length > 0 
          ? result.progress[result.progress.length - 1].questionsSolved 
          : 0,
        targetProgress: challengeData.targetCount,
        progressSnapshots: result.progress,
      };
    } else {
      // Custom goal - just check total count
      const progress = await trackUserProgress(username, startDate, endDate);
      const totalSolved = progress.length > 0 
        ? progress[progress.length - 1].questionsSolved 
        : 0;
      
      return {
        success: true,
        completed: totalSolved >= challengeData.targetCount,
        currentProgress: totalSolved,
        targetProgress: challengeData.targetCount,
        progressSnapshots: progress,
      };
    }
  } catch (error) {
    console.error('Error verifying challenge:', error);
    throw new Error('Failed to verify challenge completion.');
  }
}
