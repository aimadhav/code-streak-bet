# Progress Monitoring System

## Overview
The Code Streak Bet app includes an **automatic progress monitoring system** that regularly checks LeetCode submissions and updates challenge progress in real-time.

## Features

### ✅ Automatic Username Verification
- Verifies LeetCode usernames before challenge creation
- Checks if profile is public and accessible
- Validates user has submission history
- Uses API client with caching and error handling

### 📊 Real-Time Progress Tracking
- Checks progress every 5 minutes (configurable)
- Tracks unique problems solved (not just submissions)
- Calculates cumulative progress over time
- Filters accepted submissions only
- Groups by date for daily/weekly analysis

### 🔄 Smart Contract Updates
- Automatically updates challenge status
- Detects when challenges expire
- Verifies goal completion
- Updates local storage with latest progress
- Stops monitoring completed/failed challenges

### 🚀 Auto-Start on Wallet Connect
- Automatically starts monitoring all active challenges when user connects wallet
- Stops monitoring when user disconnects
- Individual challenge monitoring can be controlled programmatically

## Architecture

```
┌─────────────────────────────────────────────┐
│           User Connects Wallet              │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│   Load Active Challenges from Storage       │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  Start Monitoring (Every 5 minutes)         │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
┌───────────────┐     ┌──────────────────┐
│ Fetch Latest  │     │  Check if        │
│ Submissions   │     │  Expired         │
│ from LeetCode │     │                  │
└───────┬───────┘     └────────┬─────────┘
        │                      │
        ▼                      ▼
┌────────────────┐     ┌──────────────────┐
│ Calculate      │     │ If Expired:      │
│ Current        │────►│ Verify Goal      │
│ Progress       │     │ Completion       │
└────────┬───────┘     └────────┬─────────┘
         │                      │
         ▼                      ▼
┌────────────────┐     ┌──────────────────┐
│ Update Local   │     │ Update Status:   │
│ Storage        │     │ completed/failed │
└────────┬───────┘     └────────┬─────────┘
         │                      │
         └──────────┬───────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │ Notify UI Components │
         │ (via callbacks)      │
         └──────────────────────┘
```

## Usage

### Basic Usage

```typescript
import { progressMonitor, startMonitoringAllChallenges } from '@/lib/progress-monitor';

// Start monitoring all active challenges for a user
startMonitoringAllChallenges(publicKey);

// Stop all monitoring
progressMonitor.stopAll();
```

### Monitor Specific Challenge

```typescript
import { progressMonitor } from '@/lib/progress-monitor';

// Start monitoring with callback
progressMonitor.startMonitoring(challenge, (update) => {
  console.log('Progress update:', update);
  // update contains:
  // - challengeId
  // - currentProgress
  // - targetProgress
  // - progressPercentage
  // - lastChecked
  // - isCompleted
  // - isExpired
});

// Stop monitoring
progressMonitor.stopMonitoring(challengeId);
```

### React Hook

```typescript
import { useChallengeProgressMonitor } from '@/lib/progress-monitor';

function ChallengeCard({ challenge }) {
  const progressUpdate = useChallengeProgressMonitor(challenge);
  
  if (!progressUpdate) {
    return <div>Checking progress...</div>;
  }
  
  return (
    <div>
      <p>Progress: {progressUpdate.currentProgress}/{progressUpdate.targetProgress}</p>
      <p>Percentage: {progressUpdate.progressPercentage.toFixed(1)}%</p>
      {progressUpdate.isExpired && (
        <p>Status: {progressUpdate.isCompleted ? 'Completed ✅' : 'Failed ❌'}</p>
      )}
    </div>
  );
}
```

## Configuration

### Environment Variables

```bash
# Enable/disable progress monitoring
VITE_ENABLE_PROGRESS_MONITORING=true

# Check interval in milliseconds (default: 5 minutes)
VITE_PROGRESS_CHECK_INTERVAL=300000

# Auto-start monitoring on wallet connect
VITE_AUTO_START_MONITORING=true
```

### Programmatic Configuration

```typescript
import { config } from '@/lib/config';

// Check if monitoring is enabled
if (config.features.progressMonitoring) {
  startMonitoringAllChallenges(publicKey);
}

// Get check interval
const interval = config.monitoring.checkInterval;
```

## API Integration

### LeetCode API Client

The system uses a unified API client with:
- **Caching**: Reduces API calls
- **Rate Limiting**: Prevents hitting API limits (20 req/min)
- **Request Deduplication**: Prevents duplicate concurrent requests
- **Error Handling**: Graceful fallbacks and retry logic
- **Timeout Management**: 30-second timeout on all requests

```typescript
import { apiClient } from '@/lib/api-client';

// All LeetCode API calls go through this client
const profile = await apiClient.getUserProfile(username);
const submissions = await apiClient.getUserSubmissions(username, 100);
```

### Progress Tracking Logic

```typescript
// Daily Goal Check
- Fetch all submissions since challenge start
- Filter accepted submissions only
- Group by date and count unique problems
- Check if each day meets the daily target
- Return: currentStreak, totalDays, goalMet

// Weekly Goal Check
- Fetch submissions for entire challenge period
- Group into weekly buckets
- Count unique problems per week
- Check if each week meets the weekly target
- Return: completedWeeks, totalWeeks, goalMet

// Custom Goal Check
- Fetch all submissions in date range
- Count total unique problems solved
- Compare against target count
- Return: currentProgress, targetProgress, goalMet
```

## Data Flow

### Challenge Creation Flow

```
1. User enters LeetCode username
2. Click "Verify" button
3. API client fetches profile (with caching)
4. Display verification status
5. User fills challenge details
6. User stakes XLM and signs transaction
7. Challenge saved to local storage
8. Progress monitoring automatically starts
```

### Progress Check Flow

```
1. Timer triggers (every 5 minutes)
2. Fetch latest submissions from LeetCode API
3. Filter accepted submissions in date range
4. Count unique problems solved
5. Calculate cumulative progress
6. Update local storage
7. Check if challenge expired:
   - If yes: Verify completion and update status
   - If no: Update current progress only
8. Notify UI components via callbacks
9. Stop monitoring if challenge ended
```

## Error Handling

### API Errors

```typescript
try {
  const profile = await apiClient.getUserProfile(username);
} catch (error) {
  if (error instanceof APIError) {
    switch (error.statusCode) {
      case 404:
        // User not found
        break;
      case 429:
        // Rate limited
        break;
      case 500:
        // Server error
        break;
    }
  }
}
```

### Network Errors

- Automatic retries with exponential backoff
- Graceful fallbacks to cached data
- User-friendly error messages
- Logs for debugging

### Edge Cases

- **No submissions**: Returns 0 progress
- **Private profile**: Error during verification
- **API down**: Uses cached data, shows warning
- **Rate limited**: Waits and retries automatically
- **Invalid dates**: Validates and corrects date ranges

## Performance Optimization

### Caching Strategy

```typescript
// User profiles: 5 minutes
// Daily challenges: 1 hour
// Problem lists: 24 hours
// Submissions: No cache (real-time)
```

### Rate Limiting

```typescript
// Max 20 requests per minute
// Automatic throttling
// Request queuing
// Burst protection
```

### Request Deduplication

```typescript
// Prevents duplicate concurrent requests
// Returns same promise for identical requests
// Cleans up after completion
```

## Monitoring & Debugging

### Console Logs

```javascript
// Challenge monitoring started
"Starting progress monitoring for challenge challenge_123..."

// Progress check
"Checking progress for challenge challenge_123..."

// Progress update
"Progress update: { challengeId, currentProgress, ... }"

// Challenge ended
"Challenge challenge_123 ended: completed (14/14)"

// Monitoring stopped
"Stopped monitoring challenge challenge_123"
```

### Debug Mode

```typescript
// Enable verbose logging
localStorage.setItem('debug_progress_monitor', 'true');

// Check monitoring status
progressMonitor.getMonitoringStatus(challengeId); // true/false

// Get all monitored challenges
progressMonitor.getMonitoredChallenges(); // ['challenge_1', 'challenge_2']
```

## Integration with Components

### Index.tsx

```typescript
// Auto-start on wallet connect
const handleLogin = async () => {
  await connectWallet();
  const challenges = getUserChallenges(publicKey);
  startMonitoringAllChallenges(publicKey);
};

// Stop on disconnect
const handleLogout = () => {
  progressMonitor.stopAll();
  disconnectWallet();
};
```

### ChallengeForm.tsx

```typescript
// Verify username before challenge creation
const handleVerify = async () => {
  const profile = await apiClient.getUserProfile(username);
  setVerified(true);
};

// Start monitoring after challenge creation
const handleSubmit = async () => {
  const challenge = await createChallenge(formData);
  progressMonitor.startMonitoring(challenge);
};
```

### ChallengeSidebar.tsx

```typescript
// Use hook for real-time updates
const ChallengeCard = ({ challenge }) => {
  const progressUpdate = useChallengeProgressMonitor(challenge);
  
  return (
    <Card>
      <Progress value={progressUpdate?.progressPercentage} />
      <p>{progressUpdate?.currentProgress}/{progressUpdate?.targetProgress}</p>
    </Card>
  );
};
```

## Testing

### Manual Testing

```bash
# 1. Connect wallet
# 2. Create a test challenge (1 question in 7 days)
# 3. Go solve a LeetCode problem
# 4. Wait 5 minutes or manually trigger check
# 5. Verify progress updates in UI
# 6. Check console logs for monitoring activity
```

### Unit Testing

```typescript
// Mock API responses
// Test progress calculation
// Test goal verification
// Test error handling
// Test caching behavior
```

## Future Enhancements

### Planned Features

- [ ] WebSocket for real-time updates (no polling)
- [ ] Push notifications when progress updates
- [ ] Email alerts for challenge milestones
- [ ] Discord/Telegram bot integration
- [ ] Historical analytics and trends
- [ ] Leaderboard based on completion rates
- [ ] Achievement badges for streaks

### Backend Oracle Service

For production, consider a backend oracle service:

```typescript
// cron job runs every hour
cron.schedule('0 * * * *', async () => {
  const activeChallenges = await db.getActiveChallenges();
  
  for (const challenge of activeChallenges) {
    const progress = await leetCodeAPI.getProgress(challenge);
    await smartContract.updateProgress(challenge.id, progress);
    
    if (isExpired(challenge)) {
      const verified = await verifyCompletion(challenge);
      await smartContract.completeChallenge(challenge.id, verified);
    }
  }
});
```

## Summary

The progress monitoring system provides:

✅ **Automatic username verification** before challenge creation
✅ **Real-time progress tracking** every 5 minutes
✅ **Smart contract updates** for on-chain state
✅ **Automatic completion verification** when challenges expire
✅ **Efficient API usage** with caching and rate limiting
✅ **Graceful error handling** with retries and fallbacks
✅ **Auto-start/stop** based on wallet connection
✅ **React hooks** for easy component integration
✅ **Configurable intervals** via environment variables

This ensures users get accurate, up-to-date progress information while maintaining efficient API usage and providing a seamless user experience! 🚀
