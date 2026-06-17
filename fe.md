# Frontend API Integration Guide
## LeetCode Challenge Betting App - Complete API Documentation

---

## Quick Reference

### Base URLs
```
LeetCode API: https://leetcode-api-pied.vercel.app
Local Dev:    http://localhost:8000
Stellar:      https://horizon-testnet.stellar.org (testnet)
              https://horizon.stellar.org (mainnet)
```

### Authentication
```
LeetCode API:  No authentication required
Stellar:       Freighter Wallet (user signs transactions)
```

---

## 🔌 LeetCode API Endpoints

### 1. Get User Profile
**Purpose**: Verify LeetCode username and fetch user statistics

**Endpoint**: `GET /user/{username}`

**Request**:
```typescript
const response = await fetch(
  'https://leetcode-api-pied.vercel.app/user/john_codes'
);
const profile = await response.json();
```

**Response**:
```json
{
  "username": "john_codes",
  "githubUrl": "https://github.com/john",
  "twitterUrl": null,
  "linkedinUrl": null,
  "profile": {
    "userAvatar": "https://...",
    "realName": "John Doe",
    "aboutMe": "Software Engineer",
    "countryName": "United States",
    "company": "Tech Corp",
    "school": "MIT",
    "ranking": 12345,
    "reputation": 150
  },
  "submitStats": {
    "acSubmissionNum": [
      {
        "difficulty": "All",
        "count": 250,
        "submissions": 450
      },
      {
        "difficulty": "Easy",
        "count": 150,
        "submissions": 200
      },
      {
        "difficulty": "Medium",
        "count": 80,
        "submissions": 180
      },
      {
        "difficulty": "Hard",
        "count": 20,
        "submissions": 70
      }
    ]
  }
}
```

**Frontend Usage**:
```typescript
// lib/leetcode-api.ts
export async function getLeetCodeProfile(username: string) {
  const response = await fetch(`${LEETCODE_API_BASE_URL}/user/${username}`);
  if (!response.ok) {
    throw new Error('User not found');
  }
  return await response.json();
}

// Component usage
const verifyUsername = async () => {
  try {
    const profile = await getLeetCodeProfile(username);
    setUsernameVerified(true);
    toast.success(`Verified: ${profile.username}`);
  } catch (error) {
    toast.error('Username not found');
  }
};
```

**Error Cases**:
- 404: User not found
- 500: Server error
- Network timeout

---

### 2. Get User Submissions
**Purpose**: Track user's problem-solving history for progress verification

**Endpoint**: `GET /user/{username}/submissions?limit={number}`

**Parameters**:
- `limit` (optional): Number of submissions to return (default: 20, max: 100)

**Request**:
```typescript
const response = await fetch(
  'https://leetcode-api-pied.vercel.app/user/john_codes/submissions?limit=100'
);
const submissions = await response.json();
```

**Response**:
```json
[
  {
    "id": "123456",
    "title": "Two Sum",
    "titleSlug": "two-sum",
    "timestamp": "1704067200",
    "status": 10,
    "statusDisplay": "Accepted",
    "lang": "python3",
    "langName": "Python3",
    "runtime": "52 ms",
    "url": "https://leetcode.com/submissions/detail/123456/",
    "isPending": false,
    "memory": "14.2 MB",
    "frontendId": "1"
  },
  {
    "id": "123457",
    "title": "Add Two Numbers",
    "titleSlug": "add-two-numbers",
    "timestamp": "1704070800",
    "statusDisplay": "Wrong Answer",
    "lang": "javascript"
  }
]
```

**Frontend Usage**:
```typescript
export async function getUserSubmissions(username: string, limit: number = 20) {
  const response = await fetch(
    `${LEETCODE_API_BASE_URL}/user/${username}/submissions?limit=${limit}`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch submissions');
  }
  const data = await response.json();
  return data;
}

// Filter accepted submissions
const acceptedSubmissions = submissions.filter(
  sub => sub.statusDisplay === 'Accepted'
);

// Get unique problems solved
const uniqueProblems = new Set(
  acceptedSubmissions.map(sub => sub.titleSlug)
);
const totalSolved = uniqueProblems.size;
```

**Timestamp Conversion**:
```typescript
// Convert timestamp to Date
const submissionDate = new Date(parseInt(timestamp) * 1000);

// Check if submission is within challenge period
const isInChallenge = 
  submissionDate >= startDate && 
  submissionDate <= endDate;
```

---

### 3. Get Daily Challenge
**Purpose**: Fetch today's LeetCode daily challenge

**Endpoint**: `GET /daily`

**Request**:
```typescript
const response = await fetch(
  'https://leetcode-api-pied.vercel.app/daily'
);
const dailyChallenge = await response.json();
```

**Response**:
```json
{
  "date": "2025-11-02",
  "link": "/problems/two-sum/",
  "question": {
    "questionId": "1",
    "questionFrontendId": "1",
    "title": "Two Sum",
    "titleSlug": "two-sum",
    "translatedTitle": null,
    "difficulty": "Easy",
    "acRate": 49.5,
    "topicTags": [
      {
        "name": "Array",
        "slug": "array",
        "nameTranslated": null
      },
      {
        "name": "Hash Table",
        "slug": "hash-table"
      }
    ],
    "content": "<p>Given an array of integers...</p>"
  }
}
```

**Frontend Usage**:
```typescript
export async function getDailyChallenge() {
  const response = await fetch(`${LEETCODE_API_BASE_URL}/daily`);
  if (!response.ok) {
    throw new Error('Failed to fetch daily challenge');
  }
  return await response.json();
}

// Display in UI
const { data: daily } = useQuery({
  queryKey: ['daily-challenge'],
  queryFn: getDailyChallenge,
  staleTime: 1000 * 60 * 60, // 1 hour
});
```

---

### 4. Search Problems
**Purpose**: Search for specific LeetCode problems

**Endpoint**: `GET /search?query={searchTerm}`

**Request**:
```typescript
const response = await fetch(
  'https://leetcode-api-pied.vercel.app/search?query=array'
);
const results = await response.json();
```

**Response**:
```json
[
  {
    "id": "1",
    "frontend_id": "1",
    "title": "Two Sum",
    "title_slug": "two-sum",
    "url": "https://leetcode.com/problems/two-sum/"
  },
  {
    "id": "26",
    "frontend_id": "26",
    "title": "Remove Duplicates from Sorted Array",
    "title_slug": "remove-duplicates-from-sorted-array",
    "url": "https://leetcode.com/problems/remove-duplicates-from-sorted-array/"
  }
]
```

**Frontend Usage**:
```typescript
export async function searchProblems(query: string) {
  const response = await fetch(
    `${LEETCODE_API_BASE_URL}/search?query=${encodeURIComponent(query)}`
  );
  return await response.json();
}

// Debounced search
const debouncedSearch = useMemo(
  () => debounce((value: string) => {
    if (value.length >= 2) {
      searchProblems(value).then(setResults);
    }
  }, 300),
  []
);
```

---

### 5. Get All Problems
**Purpose**: Fetch complete list of LeetCode problems

**Endpoint**: `GET /problems`

**Request**:
```typescript
const response = await fetch(
  'https://leetcode-api-pied.vercel.app/problems'
);
const problems = await response.json();
```

**Response**:
```json
[
  {
    "id": "1",
    "frontend_id": "1",
    "title": "Two Sum",
    "title_slug": "two-sum",
    "url": "https://leetcode.com/problems/two-sum/",
    "difficulty": "Easy",
    "paid_only": false,
    "has_solution": true,
    "has_video_solution": false
  }
  // ... ~3000 problems
]
```

**Frontend Usage**:
```typescript
// Cache this data - it rarely changes
export async function getAllProblems() {
  const cached = localStorage.getItem('leetcode_problems');
  const cacheTime = localStorage.getItem('leetcode_problems_time');
  
  // Use cache if less than 24 hours old
  if (cached && cacheTime) {
    const age = Date.now() - parseInt(cacheTime);
    if (age < 24 * 60 * 60 * 1000) {
      return JSON.parse(cached);
    }
  }
  
  const response = await fetch(`${LEETCODE_API_BASE_URL}/problems`);
  const problems = await response.json();
  
  localStorage.setItem('leetcode_problems', JSON.stringify(problems));
  localStorage.setItem('leetcode_problems_time', Date.now().toString());
  
  return problems;
}

// Filter by difficulty
const easyProblems = problems.filter(p => p.difficulty === 'Easy');
const mediumProblems = problems.filter(p => p.difficulty === 'Medium');
const hardProblems = problems.filter(p => p.difficulty === 'Hard');
```

---

### 6. Get Problem Details
**Purpose**: Fetch detailed information about a specific problem

**Endpoint**: `GET /problem/{id_or_slug}`

**Parameters**:
- Can use either `questionId` (e.g., "1") or `titleSlug` (e.g., "two-sum")

**Request**:
```typescript
// By ID
const response = await fetch(
  'https://leetcode-api-pied.vercel.app/problem/1'
);

// By slug
const response = await fetch(
  'https://leetcode-api-pied.vercel.app/problem/two-sum'
);

const problem = await response.json();
```

**Response**:
```json
{
  "questionId": "1",
  "questionFrontendId": "1",
  "title": "Two Sum",
  "content": "<p>Given an array of integers <code>nums</code>...</p>",
  "difficulty": "Easy",
  "isPaidOnly": false,
  "likes": 45000,
  "dislikes": 1500,
  "stats": "{\"totalAccepted\":\"12.5M\",\"totalSubmission\":\"25.2M\"}",
  "hints": [
    "A really brute force way...",
    "So, if we fix one number..."
  ],
  "topicTags": [
    { "name": "Array" },
    { "name": "Hash Table" }
  ],
  "companyTags": [
    { "name": "Amazon" },
    { "name": "Google" }
  ],
  "solution": {
    "canSeeDetail": true,
    "content": "<p>Official solution content...</p>"
  },
  "hasSolution": true,
  "hasVideoSolution": false,
  "categoryTitle": "Algorithms",
  "url": "https://leetcode.com/problems/two-sum/"
}
```

**Frontend Usage**:
```typescript
export async function getProblemDetails(idOrSlug: string) {
  const response = await fetch(
    `${LEETCODE_API_BASE_URL}/problem/${idOrSlug}`
  );
  if (!response.ok) {
    throw new Error('Problem not found');
  }
  return await response.json();
}

// Display in modal or separate page
const ProblemDetails = ({ slug }: { slug: string }) => {
  const { data: problem, isLoading } = useQuery({
    queryKey: ['problem', slug],
    queryFn: () => getProblemDetails(slug),
  });
  
  return (
    <div>
      <h1>{problem.title}</h1>
      <Badge>{problem.difficulty}</Badge>
      <div dangerouslySetInnerHTML={{ __html: problem.content }} />
    </div>
  );
};
```

---

### 7. Get User Contest History
**Purpose**: Fetch user's contest participation data

**Endpoint**: `GET /user/{username}/contests`

**Request**:
```typescript
const response = await fetch(
  'https://leetcode-api-pied.vercel.app/user/john_codes/contests'
);
const contests = await response.json();
```

**Response**:
```json
{
  "userContestRanking": {
    "attendedContestsCount": 25,
    "rating": 1850.5,
    "globalRanking": 5432,
    "totalParticipants": 150000,
    "topPercentage": 3.62,
    "badge": {
      "name": "Knight"
    }
  },
  "userContestRankingHistory": [
    {
      "attended": true,
      "trendDirection": "UP",
      "problemsSolved": 3,
      "totalProblems": 4,
      "finishTimeInSeconds": 5400,
      "rating": 1850.5,
      "ranking": 234,
      "contest": {
        "title": "Weekly Contest 365",
        "startTime": 1698451200
      }
    }
  ]
}
```

---

### 8. Get Random Problem
**Purpose**: Get a random LeetCode problem

**Endpoint**: `GET /random`

**Request**:
```typescript
const response = await fetch(
  'https://leetcode-api-pied.vercel.app/random'
);
const randomProblem = await response.json();
```

**Response**:
```json
{
  "id": "146",
  "frontend_id": "146",
  "title": "LRU Cache",
  "title_slug": "lru-cache",
  "url": "https://leetcode.com/problems/lru-cache/"
}
```

---

### 9. Health Check
**Purpose**: Check if API is running

**Endpoint**: `GET /health`

**Request**:
```typescript
const response = await fetch(
  'https://leetcode-api-pied.vercel.app/health'
);
const health = await response.json();
```

**Response**:
```json
{
  "status": "ok",
  "timestamp": 1730505600.123
}
```

---

## 🔗 Stellar/Blockchain APIs

### 1. Freighter Wallet API

**Installation Check**:
```typescript
import freighterApi from '@stellar/freighter-api';

const checkFreighter = async () => {
  const isInstalled = await freighterApi.isConnected();
  if (!isInstalled) {
    alert('Please install Freighter wallet');
    window.open('https://freighter.app/', '_blank');
  }
  return isInstalled;
};
```

**Get Wallet Address**:
```typescript
const getAddress = async () => {
  const result = await freighterApi.getAddress();
  if (result.error) {
    throw new Error(result.error);
  }
  return result.address;
};

// Example: GCDKZMXVQB7BZS7PZBEGGV3BVVVGLU5UKLVVNFS4KFVD7V3L7YDHNH66
```

**Get Network**:
```typescript
const network = await freighterApi.getNetwork();
// Returns: "TESTNET" or "PUBLIC"
```

**Sign Transaction**:
```typescript
const signTransaction = async (xdr: string) => {
  const result = await freighterApi.signTransaction(xdr, {
    networkPassphrase: Networks.TESTNET,
  });
  
  if (result.error) {
    throw new Error(result.error);
  }
  
  return result.signedTxXdr;
};
```

**Request Access** (First Time):
```typescript
const requestAccess = async () => {
  const result = await freighterApi.requestAccess();
  if (result.error) {
    throw new Error('User denied access');
  }
  return true;
};
```

---

### 2. Stellar Horizon API

**Base URLs**:
```
Testnet: https://horizon-testnet.stellar.org
Mainnet: https://horizon.stellar.org
```

**Get Account Balance**:
```typescript
import { Horizon } from 'stellar-sdk';

const server = new Horizon.Server('https://horizon-testnet.stellar.org');

const getBalance = async (publicKey: string) => {
  const account = await server.loadAccount(publicKey);
  const xlmBalance = account.balances.find(
    b => b.asset_type === 'native'
  );
  return parseFloat(xlmBalance.balance);
};
```

**Submit Transaction**:
```typescript
import { TransactionBuilder } from 'stellar-sdk';

const submitTransaction = async (signedXdr: string) => {
  const transaction = TransactionBuilder.fromXDR(
    signedXdr,
    Networks.TESTNET
  );
  
  const result = await server.submitTransaction(transaction);
  return result.hash; // Transaction hash
};
```

**Get Transaction Details**:
```typescript
const getTransaction = async (txHash: string) => {
  const tx = await server.transactions()
    .transaction(txHash)
    .call();
  
  return {
    hash: tx.hash,
    ledger: tx.ledger,
    created_at: tx.created_at,
    source_account: tx.source_account,
    fee_charged: tx.fee_charged,
  };
};
```

**Stream Account Payments**:
```typescript
const streamPayments = (publicKey: string, callback: Function) => {
  const stream = server.payments()
    .forAccount(publicKey)
    .cursor('now')
    .stream({
      onmessage: (payment) => {
        callback(payment);
      },
      onerror: (error) => {
        console.error('Stream error:', error);
      }
    });
  
  return stream; // Call stream() to close
};
```

---

## 📊 Data Models & Interfaces

### TypeScript Interfaces

```typescript
// LeetCode User Profile
interface LeetCodeUserProfile {
  username: string;
  githubUrl: string | null;
  twitterUrl: string | null;
  linkedinUrl: string | null;
  profile: {
    userAvatar: string;
    realName: string;
    aboutMe: string;
    countryName: string;
    company: string;
    school: string;
    ranking: number;
    reputation: number;
  };
  submitStats: {
    acSubmissionNum: Array<{
      difficulty: string;
      count: number;
      submissions: number;
    }>;
  };
}

// LeetCode Submission
interface LeetCodeSubmission {
  id: string;
  title: string;
  titleSlug: string;
  timestamp: string; // Unix timestamp as string
  statusDisplay: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | string;
  lang: string;
  langName?: string;
  runtime?: string;
  memory?: string;
  url: string;
  isPending: boolean;
}

// LeetCode Problem
interface LeetCodeProblem {
  questionId: string;
  questionFrontendId: string;
  title: string;
  titleSlug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  isPaidOnly: boolean;
  content?: string;
  hints?: string[];
  topicTags?: Array<{ name: string; slug: string }>;
  companyTags?: Array<{ name: string }>;
  solution?: {
    canSeeDetail: boolean;
    content: string;
  };
  url: string;
}

// Daily Challenge
interface DailyChallenge {
  date: string;
  link: string;
  question: LeetCodeProblem;
}

// Challenge Data
interface ChallengeData {
  id: string;
  userId: string;
  leetcodeUsername: string;
  publicKey: string;
  goalType: 'daily' | 'weekly' | 'custom';
  targetCount: number;
  dailyQuestions?: number;
  weeklyQuestions?: number;
  weeks?: number;
  stakeAmount: string; // XLM amount
  startDate: string; // ISO date
  endDate: string; // ISO date
  status: 'active' | 'completed' | 'failed' | 'cancelled';
  currentProgress: number;
  transactionHash?: string;
  createdAt: string;
}

// Progress Snapshot
interface UserProgressSnapshot {
  date: string; // YYYY-MM-DD
  questionsSolved: number; // Cumulative count
  submissionCount: number; // Daily count
  lastSubmissionTime?: string;
}

// Wallet State
interface WalletState {
  isConnected: boolean;
  publicKey: string | null;
  balance: number | null;
  network: 'TESTNET' | 'PUBLIC';
}
```

---

## 💻 API Integration Examples

### Complete Challenge Creation Flow

```typescript
// 1. Verify LeetCode username
const handleVerifyUsername = async (username: string) => {
  setIsVerifying(true);
  try {
    const profile = await getLeetCodeProfile(username);
    setUsernameVerified(true);
    setUserProfile(profile);
    toast.success(`Verified: ${profile.username}`);
    return profile;
  } catch (error) {
    toast.error('Username not found');
    throw error;
  } finally {
    setIsVerifying(false);
  }
};

// 2. Create challenge transaction
const handleCreateChallenge = async (formData: ChallengeFormData) => {
  if (!publicKey || !signTransaction) {
    throw new Error('Wallet not connected');
  }
  
  if (!usernameVerified) {
    throw new Error('Please verify your LeetCode username');
  }
  
  // Calculate end date
  const startDate = new Date();
  const endDate = new Date(startDate);
  
  if (formData.goalType === 'daily') {
    endDate.setDate(endDate.getDate() + formData.dailyDays);
  } else if (formData.goalType === 'weekly') {
    endDate.setDate(endDate.getDate() + (formData.weeks * 7));
  } else {
    endDate.setDate(endDate.getDate() + formData.customDays);
  }
  
  // Generate challenge ID
  const challengeId = `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Create transaction
  const xdr = await createChallengeTransaction(
    publicKey,
    formData.stakeAmount,
    challengeId,
    {
      targetCount: formData.targetCount,
      endDate: endDate.toISOString(),
      goalType: formData.goalType,
    }
  );
  
  // Sign with Freighter
  toast.info('Please sign the transaction in Freighter');
  const txHash = await signTransaction(xdr);
  
  // Save to local storage
  const challenge: ChallengeData = {
    id: challengeId,
    userId: publicKey,
    leetcodeUsername: formData.username,
    publicKey,
    goalType: formData.goalType,
    targetCount: formData.targetCount,
    dailyQuestions: formData.dailyQuestions,
    weeklyQuestions: formData.weeklyQuestions,
    weeks: formData.weeks,
    stakeAmount: formData.stakeAmount,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    status: 'active',
    transactionHash: txHash,
    currentProgress: 0,
    createdAt: new Date().toISOString(),
  };
  
  saveChallengeToStorage(challenge);
  
  toast.success('Challenge created successfully! 🎉');
  return challenge;
};
```

### Progress Tracking Implementation

```typescript
// Track user progress over time
const trackChallengeProgress = async (
  username: string,
  startDate: Date,
  endDate: Date = new Date()
): Promise<UserProgressSnapshot[]> => {
  // Fetch submissions
  const submissions = await getUserSubmissions(username, 100);
  
  // Filter accepted submissions in date range
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
    
    progressMap.get(dateKey)!.add(sub.titleSlug);
  });
  
  // Generate daily snapshots with cumulative count
  const snapshots: UserProgressSnapshot[] = [];
  let cumulativeCount = 0;
  
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
};

// Verify challenge completion
const verifyChallengeCompletion = async (
  challenge: ChallengeData
): Promise<{ completed: boolean; currentProgress: number }> => {
  const progress = await trackChallengeProgress(
    challenge.leetcodeUsername,
    new Date(challenge.startDate),
    new Date(challenge.endDate)
  );
  
  const currentProgress = progress.length > 0
    ? progress[progress.length - 1].questionsSolved
    : 0;
  
  let completed = false;
  
  if (challenge.goalType === 'daily') {
    // Check if user met daily goal each day
    const daysRequired = Math.ceil(
      (new Date(challenge.endDate).getTime() - new Date(challenge.startDate).getTime()) 
      / (1000 * 60 * 60 * 24)
    );
    
    for (let i = 0; i < daysRequired; i++) {
      const expectedCount = (i + 1) * (challenge.dailyQuestions || 1);
      if (progress[i]?.questionsSolved < expectedCount) {
        completed = false;
        break;
      }
    }
    completed = true;
    
  } else if (challenge.goalType === 'weekly') {
    // Check weekly targets
    const weeks = challenge.weeks || 1;
    const questionsPerWeek = challenge.weeklyQuestions || 0;
    
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
    
    completed = completedWeeks === weeks;
    
  } else {
    // Custom goal - just check total
    completed = currentProgress >= challenge.targetCount;
  }
  
  return { completed, currentProgress };
};
```

### Real-time Progress Updates

```typescript
// Hook for automatic progress updates
const useChallengeProgress = (challenge: ChallengeData | null) => {
  const [progress, setProgress] = useState<UserProgressSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (!challenge) return;
    
    const fetchProgress = async () => {
      setIsLoading(true);
      try {
        const progressData = await trackChallengeProgress(
          challenge.leetcodeUsername,
          new Date(challenge.startDate),
          new Date()
        );
        setProgress(progressData);
      } catch (error) {
        console.error('Failed to fetch progress:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Fetch immediately
    fetchProgress();
    
    // Then fetch every 5 minutes
    const interval = setInterval(fetchProgress, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [challenge?.id]);
  
  const currentProgress = progress.length > 0
    ? progress[progress.length - 1].questionsSolved
    : 0;
  
  const progressPercentage = challenge
    ? (currentProgress / challenge.targetCount) * 100
    : 0;
  
  return {
    progress,
    currentProgress,
    progressPercentage,
    isLoading,
  };
};
```

---

## 🚨 Error Handling

### API Error Handling

```typescript
// Generic API error handler
class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Wrapper function with error handling
async function fetchWithErrorHandling<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, options);
    
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
    
    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    
    // Network error or other issues
    throw new APIError(
      'Network error: Unable to reach the server',
      0,
      error
    );
  }
}

// Usage with toast notifications
const fetchUserProfile = async (username: string) => {
  try {
    const profile = await fetchWithErrorHandling<LeetCodeUserProfile>(
      `${LEETCODE_API_BASE_URL}/user/${username}`
    );
    return profile;
  } catch (error) {
    if (error instanceof APIError) {
      switch (error.statusCode) {
        case 404:
          toast.error('User not found. Please check the username.');
          break;
        case 429:
          toast.error('Too many requests. Please try again later.');
          break;
        case 500:
          toast.error('Server error. Please try again.');
          break;
        default:
          toast.error('Failed to fetch user profile.');
      }
    } else {
      toast.error('Network error. Please check your connection.');
    }
    throw error;
  }
};
```

### Stellar Transaction Errors

```typescript
// Handle Freighter errors
const handleFreighterError = (error: any) => {
  const errorMessage = error.message || error.toString();
  
  if (errorMessage.includes('User declined')) {
    return 'Transaction cancelled by user';
  }
  
  if (errorMessage.includes('insufficient balance')) {
    return 'Insufficient XLM balance';
  }
  
  if (errorMessage.includes('timeout')) {
    return 'Transaction timeout. Please try again.';
  }
  
  return 'Transaction failed. Please try again.';
};

// Safe transaction signing
const safeSignTransaction = async (xdr: string) => {
  try {
    const result = await freighterApi.signTransaction(xdr, {
      networkPassphrase: Networks.TESTNET,
    });
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    return result.signedTxXdr;
  } catch (error) {
    const message = handleFreighterError(error);
    toast.error(message);
    throw error;
  }
};
```

---

## ⚡ Rate Limiting & Caching

### Caching Strategy

```typescript
// Simple in-memory cache with TTL
class APICache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private ttl = 5 * 60 * 1000; // 5 minutes default
  
  set(key: string, data: any, ttl?: number) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }
  
  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const age = Date.now() - cached.timestamp;
    if (age > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }
  
  clear() {
    this.cache.clear();
  }
}

const apiCache = new APICache();

// Cached API call
async function getCachedUserProfile(username: string) {
  const cacheKey = `profile:${username}`;
  
  // Check cache first
  const cached = apiCache.get(cacheKey);
  if (cached) {
    return cached;
  }
  
  // Fetch from API
  const profile = await getLeetCodeProfile(username);
  
  // Cache result
  apiCache.set(cacheKey, profile);
  
  return profile;
}
```

### Rate Limiting

```typescript
// Simple rate limiter
class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private windowMs: number;
  
  constructor(maxRequests: number = 10, windowMs: number = 60000) {
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

const leetcodeRateLimiter = new RateLimiter(20, 60000); // 20 req/min

// Use with API calls
async function rateLimitedFetch(url: string) {
  await leetcodeRateLimiter.throttle();
  return fetch(url);
}
```

### Request Deduplication

```typescript
// Prevent duplicate concurrent requests
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

const deduplicator = new RequestDeduplicator();

// Usage
async function getUserSubmissions(username: string) {
  return deduplicator.dedupe(
    `submissions:${username}`,
    () => fetch(`${LEETCODE_API_BASE_URL}/user/${username}/submissions`)
      .then(r => r.json())
  );
}
```

---

## 🔧 Environment Configuration

### .env File

```bash
# Stellar Network
VITE_STELLAR_NETWORK=testnet
# Options: testnet, mainnet

# Smart Contract Address (after deployment)
VITE_CHALLENGE_CONTRACT_ADDRESS=CCXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Platform Fee Address (your Stellar address)
VITE_PLATFORM_FEE_ADDRESS=GBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# LeetCode API
VITE_LEETCODE_API_URL=https://leetcode-api-pied.vercel.app
# Use http://localhost:8000 for local development

# API Configuration
VITE_API_TIMEOUT=30000
VITE_API_RETRY_ATTEMPTS=3

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_NOTIFICATIONS=false
```

### Environment Variables Access

```typescript
// lib/config.ts
export const config = {
  stellar: {
    network: import.meta.env.VITE_STELLAR_NETWORK || 'testnet',
    contractAddress: import.meta.env.VITE_CHALLENGE_CONTRACT_ADDRESS,
    platformFeeAddress: import.meta.env.VITE_PLATFORM_FEE_ADDRESS,
  },
  api: {
    leetcode: import.meta.env.VITE_LEETCODE_API_URL || 'https://leetcode-api-pied.vercel.app',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
    retryAttempts: parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS || '3'),
  },
  features: {
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    notifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true',
  },
};

// Usage
import { config } from '@/lib/config';

const LEETCODE_API_BASE_URL = config.api.leetcode;
const STELLAR_NETWORK = config.stellar.network;
```

---

## 🔗 Complete API Integration Module

```typescript
// lib/api-client.ts
import { config } from './config';

export class APIClient {
  private baseURL: string;
  private timeout: number;
  private cache: APICache;
  private rateLimiter: RateLimiter;
  
  constructor() {
    this.baseURL = config.api.leetcode;
    this.timeout = config.api.timeout;
    this.cache = new APICache();
    this.rateLimiter = new RateLimiter(20, 60000);
  }
  
  async get<T>(endpoint: string, options?: {
    cache?: boolean;
    cacheTTL?: number;
  }): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const cacheKey = `GET:${endpoint}`;
    
    // Check cache
    if (options?.cache) {
      const cached = this.cache.get(cacheKey);
      if (cached) return cached;
    }
    
    // Rate limit
    await this.rateLimiter.throttle();
    
    // Fetch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    
    try {
      const response = await fetch(url, {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new APIError(
          `API Error: ${response.statusText}`,
          response.status
        );
      }
      
      const data = await response.json();
      
      // Cache if requested
      if (options?.cache) {
        this.cache.set(cacheKey, data, options.cacheTTL);
      }
      
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
  
  // Convenience methods
  async getUserProfile(username: string) {
    return this.get<LeetCodeUserProfile>(`/user/${username}`, {
      cache: true,
      cacheTTL: 5 * 60 * 1000, // 5 minutes
    });
  }
  
  async getUserSubmissions(username: string, limit: number = 20) {
    return this.get<LeetCodeSubmission[]>(
      `/user/${username}/submissions?limit=${limit}`
    );
  }
  
  async getDailyChallenge() {
    return this.get<DailyChallenge>('/daily', {
      cache: true,
      cacheTTL: 60 * 60 * 1000, // 1 hour
    });
  }
  
  async searchProblems(query: string) {
    return this.get<LeetCodeProblem[]>(
      `/search?query=${encodeURIComponent(query)}`
    );
  }
  
  async getProblemDetails(idOrSlug: string) {
    return this.get<LeetCodeProblem>(`/problem/${idOrSlug}`, {
      cache: true,
      cacheTTL: 24 * 60 * 60 * 1000, // 24 hours
    });
  }
  
  async getAllProblems() {
    return this.get<LeetCodeProblem[]>('/problems', {
      cache: true,
      cacheTTL: 24 * 60 * 60 * 1000, // 24 hours
    });
  }
}

// Export singleton instance
export const apiClient = new APIClient();
```

---

## 📝 Usage Examples

### Component Integration

```tsx
// components/ChallengeForm.tsx
import { apiClient } from '@/lib/api-client';
import { useFreighterWallet } from '@/hooks/useFreighterWallet';

export const ChallengeForm = () => {
  const [username, setUsername] = useState('');
  const [verified, setVerified] = useState(false);
  const { publicKey, signTransaction } = useFreighterWallet();
  
  const handleVerify = async () => {
    try {
      const profile = await apiClient.getUserProfile(username);
      setVerified(true);
      toast.success(`Verified: ${profile.username}`);
    } catch (error) {
      toast.error('User not found');
    }
  };
  
  const handleSubmit = async (formData: ChallengeFormData) => {
    if (!verified) {
      toast.error('Please verify your username');
      return;
    }
    
    // Create challenge...
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <Input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="LeetCode username"
      />
      <Button onClick={handleVerify}>
        Verify
      </Button>
      {/* Rest of form */}
    </form>
  );
};
```

---

## 🎯 Summary

This document provides everything the frontend needs to integrate with:

1. **LeetCode API** - All 9 endpoints with examples
2. **Stellar/Blockchain** - Wallet and transaction APIs
3. **Data Models** - Complete TypeScript interfaces
4. **Error Handling** - Robust error management
5. **Caching & Rate Limiting** - Performance optimization
6. **Complete Code Examples** - Ready-to-use implementations

**Key Files to Reference**:
- `lib/leetcode-api.ts` - LeetCode integration
- `lib/stellar.ts` - Blockchain integration
- `hooks/useFreighterWallet.tsx` - Wallet connection
- `lib/api-client.ts` - Unified API client

---

**Version**: 1.0.0  
**Last Updated**: November 2, 2025  
**Status**: Production Ready
