import { RouletteGame } from './components/RouletteGame';
import { useGameStore } from './store/gameStore';

function App() {
  const { balance } = useGameStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#0f0f23] flex flex-col">
      {/* Header */}
      <header className="bg-[#1a1a2e] border-b-4 border-[#00ff88] shadow-2xl py-6">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-[#00ff88] tracking-wider">
                🎰 Mr Markovski's Roulette
              </h1>
              <p className="text-gray-300 mt-1 text-sm">European Roulette • 0-36</p>
            </div>
            <div className="text-right">
              <div className="text-gray-400 text-sm">Balance</div>
              <div className="text-[#00ff88] text-3xl font-bold">${balance.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Game */}
      <main className="flex-1 flex items-center justify-center p-6">
        <RouletteGame />
      </main>

      {/* Footer */}
      <footer className="bg-[#1a1a2e] border-t-4 border-[#00ff88] py-4">
        <div className="container mx-auto px-6 text-center text-gray-400">
          <p>Mr Markovski's Roulette © 2024 | Play Responsibly</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
