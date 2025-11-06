# 🎰 Mr Markovski's European Roulette

A modern, full-featured European Roulette game with a sleek casino-style interface, built with React and FastAPI.

![European Roulette](https://img.shields.io/badge/Roulette-European-green)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-blue)
![React](https://img.shields.io/badge/React-19.1.1-blue)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)

## ✨ Features

### Game Features
- 🎡 **Animated Roulette Wheel** - Smooth wheel and ball animations using anime.js
- 💰 **All European Bets** - Complete betting system including:
  - Inside bets (straight, split, street, corner, line)
  - Outside bets (red/black, odd/even, high/low, dozens, columns)
  - Special call bets (Voisins du Zéro, Tiers du Cylindre, Orphelins)
  - Neighbors betting (1-4 neighbors on wheel)
- 📊 **Live Win/Loss Display** - See your profit/loss after each spin
- 💵 **Balance Management** - Track your balance with localStorage persistence
- 📈 **Spin History** - View last 20 spin results
- 🎨 **Modern Casino UI** - Dark mode with neon accents and smooth transitions

### Technical Features
- ⚡ **Fast & Responsive** - Built with Vite for lightning-fast development
- 🔒 **Secure RNG** - Cryptographically secure random number generation
- 📱 **Fully Responsive** - Works on desktop, tablet, and mobile
- 🚀 **Vercel Ready** - Configured for serverless deployment
- 💾 **State Persistence** - Game state saved to localStorage
- 🎯 **Type Safe** - Full TypeScript support

## 🎮 How to Play

1. **Select Your Chip** - Choose a chip denomination ($1, $5, $25, $100, $500, $1000)
2. **Place Your Bets** - Click on numbers, colors, or special bet buttons
3. **Press SPIN** - Watch the wheel spin and the ball land
4. **See Results** - View your winnings/losses and updated balance
5. **Repeat** - Place new bets and spin again!

### Betting Options

**Inside Bets:**
- **Straight Up** - Single number (35:1 payout)
- **Split** - Two adjacent numbers (17:1)
- **Street** - Three numbers in a row (11:1)
- **Corner** - Four numbers in a square (8:1)
- **Line** - Six numbers (5:1)

**Outside Bets:**
- **Red/Black** - Color (1:1)
- **Odd/Even** - Number type (1:1)
- **High/Low** - 1-18 or 19-36 (1:1)
- **Dozens** - 1st, 2nd, or 3rd 12 numbers (2:1)
- **Columns** - One of three columns (2:1)

**Special Call Bets:**
- **Voisins du Zéro** - Neighbors of zero (17 numbers)
- **Tiers du Cylindre** - Third of the wheel (12 numbers)
- **Orphelins** - Orphans (8 numbers)
- **Neighbors** - A number plus 1-4 neighbors on each side

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Python 3.9+
- npm or yarn

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/mr-markovski-roulette.git
   cd mr-markovski-roulette
   ```

2. **Start the Backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn main:app --reload --port 8000
   ```

3. **Start the Frontend** (in a new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Open Your Browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

## 📦 Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS 3** - Styling
- **Zustand** - State management
- **anime.js** - Animations
- **Axios** - HTTP client

### Backend
- **FastAPI** - Python web framework
- **Pydantic** - Data validation
- **Python Secrets** - Secure RNG

### Deployment
- **Vercel** - Serverless hosting
- **GitHub** - Version control

## 🌐 Deploy to Vercel

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/mr-markovski-roulette)

1. Click the button above
2. Vercel will automatically configure and deploy
3. Your game will be live in minutes!

## 📁 Project Structure

```
mr-markovski-roulette/
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── RouletteWheel.tsx
│   │   │   ├── BettingBoard.tsx
│   │   │   ├── GameControls.tsx
│   │   │   └── ...
│   │   ├── store/         # Zustand state
│   │   ├── App.tsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.ts
├── backend/               # Local development backend
│   ├── main.py
│   └── requirements.txt
├── api/                   # Vercel serverless API
│   └── index.py
├── vercel.json           # Vercel configuration
├── requirements.txt      # Python dependencies for Vercel
└── README.md
```

## 🎨 UI Components

- **RouletteWheel** - Animated wheel with ball physics
- **BettingBoard** - Interactive betting grid
- **GameControls** - Spin button, chip selector, special bets
- **HistoryPanel** - Recent spin history
- **Header** - Balance display and branding

## 🔧 Configuration

### Environment Variables

**Development:**
- Backend runs on `http://localhost:8000`
- Frontend auto-detects and connects

**Production (Vercel):**
- API runs at `/api/*` routes
- Frontend automatically uses relative paths
- No environment variables needed

### Customization

**Change Initial Balance:**
Edit `frontend/src/store/gameStore.ts`:
```typescript
balance: 10000, // Change this value
```

**Change Chip Denominations:**
Edit `frontend/src/store/gameStore.ts`:
```typescript
const CHIP_DENOMINATIONS = [1, 5, 25, 100, 500, 1000];
```

**Change Spin Duration:**
Edit `frontend/src/components/GameControls.tsx`:
```typescript
const SPIN_DURATION = 5000; // milliseconds
```

## 🧪 Testing

```bash
# Frontend type checking
cd frontend
npm run build

# Backend testing
cd backend
python -m pytest  # (tests not included, add as needed)
```

## 📝 API Endpoints

- `GET /api/` - API health check
- `POST /api/spin` - Process spin with bets
  ```json
  {
    "bets": [
      {
        "type": "straight",
        "numbers": [7],
        "amount": 25,
        "payout": 0
      }
    ],
    "balance": 10000
  }
  ```
- `GET /api/numbers/{number}/neighbors?count=2` - Get wheel neighbors

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Roulette wheel design inspired by classic European casinos
- Built with modern web technologies
- Special thanks to the FastAPI and React communities

## 📧 Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter)

Project Link: [https://github.com/YOUR_USERNAME/mr-markovski-roulette](https://github.com/YOUR_USERNAME/mr-markovski-roulette)

---

**Enjoy playing responsibly! 🎰**

*This is a game for entertainment purposes only. No real money is involved.*
