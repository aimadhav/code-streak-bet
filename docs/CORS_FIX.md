# CORS Issue Fix

## Problem
The frontend was getting CORS errors when trying to fetch data from `https://leetcode-api-pied.vercel.app`.

## Root Cause
The deployed Vercel API doesn't have CORS headers configured, preventing browser requests from different origins.

## Solution Applied

### 1. Added CORS Middleware to Python API

Updated `leetcode-api/src/api/api.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

# Added after app initialization
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 2. Updated Environment Configuration

Changed `.env` to use local API:

```bash
VITE_LEETCODE_API_URL=http://localhost:8000
```

### 3. Made Port Configurable

Updated `run.py` to accept PORT environment variable:

```python
port = int(os.environ.get("PORT", 8000))
uvicorn.run(app, host="0.0.0.0", port=port)
```

## How to Use

### For Development (No CORS Issues)

1. Start Python API server:
   ```bash
   cd leetcode-api
   python run.py
   ```
   Server runs on `http://localhost:8000`

2. Start frontend:
   ```bash
   cd code-streak-bet
   npm run dev
   ```
   Frontend runs on `http://localhost:8081`

3. Test at: `http://localhost:8081/api-test`

### For Production (Vercel Deployment)

If you want to use the deployed Vercel API, you need to:

1. **Option A**: Deploy your own version to Vercel and configure CORS
2. **Option B**: Use a CORS proxy service
3. **Option C**: Deploy the Python API to a service that allows CORS configuration (Heroku, Railway, Render, etc.)

## API Endpoints Available

All endpoints now support CORS:

- `GET /user/{username}` - User profile
- `GET /user/{username}/submissions` - User submissions
- `GET /user/{username}/contests` - User contests
- `GET /daily` - Daily challenge
- `GET /problems` - All problems
- `GET /problem/{id_or_slug}` - Problem details
- `GET /search?query={query}` - Search problems
- `GET /random` - Random problem
- `GET /health` - Health check

## Testing

Visit `http://localhost:8081/api-test` and:

1. Enter username: `madhav`
2. Click "Test Profile API"
3. Click "Test Submissions API"
4. Verify JSON responses appear without CORS errors

## Production Deployment Options

### Option 1: Vercel (Recommended)

Deploy your Python API to Vercel with CORS configured:

```bash
cd leetcode-api
vercel deploy
```

Then update `.env`:
```bash
VITE_LEETCODE_API_URL=https://your-api.vercel.app
```

### Option 2: Railway

```bash
cd leetcode-api
railway deploy
```

### Option 3: Render

```bash
# Push to GitHub
# Connect repo to Render
# Auto-deploys with CORS enabled
```

## Status

✅ **CORS Fixed** - Local development now works without errors  
✅ **API Server Running** - http://localhost:8000  
✅ **Frontend Running** - http://localhost:8081  
✅ **Test Page Available** - http://localhost:8081/api-test  

## Next Steps

1. ✅ Test username verification
2. ✅ Test progress monitoring
3. [ ] Deploy Python API to production
4. [ ] Update production environment variables
