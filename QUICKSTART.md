# ⚡ Quick Start Guide

Get Mr Markovski's Roulette running in 5 minutes!

## Prerequisites

- Python 3.11+ installed
- Node.js 18+ and npm installed

## Option 1: Using the Start Script (Easiest)

```bash
./start.sh
```

This will:
1. Set up Python virtual environment
2. Install backend dependencies
3. Start backend server (port 8000)
4. Install frontend dependencies
5. Start frontend dev server (port 5173)

## Option 2: Manual Setup

### Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend Setup (New Terminal)

```bash
cd frontend
npm install
npm run dev
```

## Access the Game

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## First Spin

1. Select a chip denomination (default: $25)
2. Click on a number or betting area to place a bet
3. Click the green "SPIN" button
4. Watch the wheel spin and see your results!

## Troubleshooting

**Port already in use?**
- Backend: Change port in `uvicorn main:app --reload --port 8001`
- Frontend: Vite will automatically use next available port

**Dependencies not installing?**
- Backend: Try `python3 -m pip install -r requirements.txt`
- Frontend: Try `npm install --legacy-peer-deps`

**Backend not connecting?**
- Check backend is running on port 8000
- Check browser console for CORS errors
- Verify `VITE_API_URL` in frontend `.env` file

## Next Steps

- Read the full [README.md](./README.md) for features and game rules
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) to deploy to production
- Customize the theme in `tailwind.config.js`
- Add sound effects (see TODO in components)

Enjoy playing! 🎰

