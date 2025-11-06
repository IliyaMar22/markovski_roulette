# Deployment Guide for Mr Markovski's Roulette

## Vercel Deployment

This project is configured to deploy to Vercel with both frontend and backend as serverless functions.

### Project Structure for Vercel

```
mr-markovski-roulette/
├── frontend/          # React + Vite frontend
│   ├── src/
│   ├── package.json
│   └── dist/         # Build output
├── api/              # Serverless API functions
│   └── index.py      # FastAPI backend
├── backend/          # Local development backend (not deployed)
├── vercel.json       # Vercel configuration
├── requirements.txt  # Python dependencies
└── .vercelignore     # Files to exclude from deployment
```

### Deployment Steps

#### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Push to GitHub**
   ```bash
   cd /Users/bilyana/Downloads/.github-main/profile/mr-markovski-roulette
   git init
   git add .
   git commit -m "Initial commit - Mr Markovski's Roulette"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will automatically detect the configuration
   - Click "Deploy"

That's it! Vercel will:
- Build your React frontend
- Deploy your FastAPI backend as serverless functions
- Provide you with a live URL

#### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd /Users/bilyana/Downloads/.github-main/profile/mr-markovski-roulette
   vercel
   ```

4. **Follow prompts:**
   - Set up and deploy? Yes
   - Which scope? (Select your account)
   - Link to existing project? No
   - Project name? mr-markovski-roulette
   - Directory? ./
   - Override settings? No

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

### How It Works

**Frontend:**
- Built with Vite and React
- Served as static files from `frontend/dist/`
- Automatically detects production environment
- Uses `/api` endpoint for backend calls in production

**Backend:**
- FastAPI application in `api/index.py`
- Runs as Vercel serverless functions
- Accessible at `/api/*` routes
- No persistent state (use external database for production)

**API Endpoints:**
- `GET /api/` - API status
- `POST /api/spin` - Process spin with bets
- `GET /api/numbers/{number}/neighbors` - Get wheel neighbors

### Environment Variables

No environment variables are required for basic deployment. The frontend automatically detects the environment and uses the correct API URL.

If you need to customize the API URL, add this in Vercel Dashboard:
- Go to your project settings
- Navigate to "Environment Variables"
- Add: `VITE_API_URL` with your custom API URL

### Local Development

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# Opens at http://localhost:8000
```

### Important Notes

1. **No Persistent State**: Serverless functions are stateless. Game history and balance reset between function calls. For production with persistent state, integrate a database (e.g., Vercel Postgres, MongoDB Atlas).

2. **Cold Starts**: First request to API may be slower due to serverless cold start. This is normal.

3. **CORS**: Configured to allow all origins in production. Customize in `api/index.py` if needed.

4. **Build Command**: Vercel runs `cd frontend && npm install && npm run build`

5. **Output Directory**: `frontend/dist/`

### Troubleshooting

**Build fails:**
- Check that all dependencies are listed in `package.json` and `requirements.txt`
- Ensure Node version is compatible (v18+)
- Check build logs in Vercel dashboard

**API not working:**
- Check that API calls use `/api/` prefix in production
- Verify `api/index.py` has all required imports
- Check serverless function logs in Vercel dashboard

**Frontend not loading:**
- Verify build output is in `frontend/dist/`
- Check that `outputDirectory` in `vercel.json` is correct
- Clear browser cache and try again

### Custom Domain

After deployment, you can add a custom domain:
1. Go to your project in Vercel
2. Click "Settings" → "Domains"
3. Add your domain
4. Follow DNS configuration instructions

### Monitoring

- View deployment logs in Vercel dashboard
- Monitor function invocations and errors
- Set up alerts for failures

---

**Live Demo:** https://your-project.vercel.app
**API Health:** https://your-project.vercel.app/api/
