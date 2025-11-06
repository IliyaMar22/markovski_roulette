import React from 'react';
import { useGameStore } from '../store/gameStore';

export const BetSummary: React.FC = () => {
  const { bets, clearBets, getTotalStake, balance } = useGameStore();

  const totalStake = getTotalStake();

  return (
    <div className="bg-[#1a1a2e] rounded-2xl p-8 shadow-2xl h-full">
      <h2 className="text-3xl font-bold text-[#00ff88] mb-6">Bet Summary</h2>
      
      <div className="space-y-4 mb-6">
        <div className="bg-[#0f0f23] rounded-xl p-4">
          <div className="text-gray-400 text-sm mb-1">Balance</div>
          <div className="text-[#00ff88] text-3xl font-bold">${balance.toFixed(2)}</div>
        </div>
        <div className="bg-[#0f0f23] rounded-xl p-4">
          <div className="text-gray-400 text-sm mb-1">Total Stake</div>
          <div className="text-[#ff006e] text-3xl font-bold">${totalStake.toFixed(2)}</div>
        </div>
      </div>

      <div className="mb-6 max-h-64 overflow-y-auto space-y-3">
        {bets.length === 0 ? (
          <div className="bg-[#0f0f23] rounded-xl p-6 text-center">
            <p className="text-gray-500 text-lg">No bets placed</p>
          </div>
        ) : (
          bets.map((bet) => (
            <div
              key={bet.id}
              className="bg-[#0f0f23] rounded-xl p-4 border-l-4 border-[#00ff88]"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold text-white text-lg capitalize">{bet.type}</div>
                  <div className="text-sm text-gray-400">
                    {bet.numbers.length === 1
                      ? `Number: ${bet.numbers[0]}`
                      : `${bet.numbers.length} numbers`}
                  </div>
                </div>
                <div className="text-[#ffd700] text-xl font-bold">
                  ${bet.amount.toFixed(2)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="space-y-3">
        <button
          onClick={clearBets}
          disabled={bets.length === 0}
          className={`
            w-full py-4 px-6 rounded-xl font-bold text-lg transition-all transform shadow-lg
            ${bets.length === 0
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-[#ff006e] hover:bg-[#cc0058] text-white hover:scale-105'
            }
          `}
        >
          Clear All Bets
        </button>
        <button
          onClick={() => {
            if (bets.length > 0) {
              const lastBets = bets.map(b => ({ ...b, id: `${b.id}-${Date.now()}` }));
              lastBets.forEach(bet => {
                useGameStore.getState().addBet(bet);
              });
            }
          }}
          disabled={bets.length === 0}
          className={`
            w-full py-4 px-6 rounded-xl font-bold text-lg transition-all transform shadow-lg
            ${bets.length === 0
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-[#00ff88] hover:bg-[#00cc6a] text-black hover:scale-105'
            }
          `}
        >
          Repeat Last Bet
        </button>
      </div>
    </div>
  );
};
