import React from 'react';
import { useGameStore, type Bet } from '../store/gameStore';

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const BLACK_NUMBERS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];

// Table layout: 3 rows × 12 columns
const NUMBERS_GRID = [
  [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],  // Row 1
  [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],  // Row 2
  [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],  // Row 3
];

export const BettingBoard: React.FC = () => {
  const { addBet, selectedChip, bets } = useGameStore();

  const getBetAmount = (numbers: number[]): number => {
    return bets
      .filter((b) => JSON.stringify(b.numbers.sort()) === JSON.stringify(numbers.sort()))
      .reduce((sum, b) => sum + b.amount, 0);
  };

  const handleNumberClick = (number: number) => {
    const bet: Bet = {
      id: `straight-${number}-${Date.now()}`,
      type: 'straight',
      numbers: [number],
      amount: selectedChip,
      payout: 0,
    };
    console.log('Adding number bet:', bet);
    addBet(bet);
  };

  const handleOutsideBet = (type: string, numbers: number[]) => {
    const bet: Bet = {
      id: `${type}-${Date.now()}`,
      type,
      numbers,
      amount: selectedChip,
      payout: 0,
    };
    console.log('Adding outside bet:', bet);
    addBet(bet);
  };

  const getNumberColor = (num: number): string => {
    if (num === 0) return 'bg-green-700 hover:bg-green-600';
    return RED_NUMBERS.includes(num) 
      ? 'bg-red-600 hover:bg-red-500' 
      : 'bg-gray-900 hover:bg-gray-800';
  };

  return (
    <div className="bg-gradient-to-br from-green-900 via-green-800 to-green-900 rounded-2xl p-6 shadow-2xl border-4 border-yellow-700">
      {/* Main Grid */}
      <div className="grid grid-cols-[60px_1fr_60px] gap-2">
        {/* Zero Column */}
        <div className="row-span-3 flex items-center">
          <button
            onClick={() => handleNumberClick(0)}
            className={`w-full h-full ${getNumberColor(0)} text-white font-bold text-2xl rounded-lg shadow-lg transition-all transform hover:scale-105 relative min-h-[180px] border-2 border-white`}
          >
            <span className="transform -rotate-90 inline-block whitespace-nowrap">0</span>
            {getBetAmount([0]) > 0 && (
              <span className="absolute top-2 right-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded-full font-bold">
                ${getBetAmount([0])}
              </span>
            )}
          </button>
        </div>

        {/* Numbers Grid (3 rows × 12 columns) */}
        <div className="row-span-3 grid grid-rows-3 gap-2">
          {NUMBERS_GRID.map((row, rowIdx) => (
            <div key={rowIdx} className="grid grid-cols-12 gap-2">
              {row.map((num) => (
                <button
                  key={num}
                  onClick={() => handleNumberClick(num)}
                  className={`${getNumberColor(num)} text-white font-bold text-lg rounded-md shadow-md transition-all transform hover:scale-110 relative border border-white/30 aspect-square flex items-center justify-center`}
                >
                  {num}
                  {getBetAmount([num]) > 0 && (
                    <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs px-1.5 py-0.5 rounded-full font-bold shadow-lg">
                      ${getBetAmount([num])}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* 2:1 Column Bets */}
        <div className="row-span-3 grid grid-rows-3 gap-2">
          <button
            onClick={() => handleOutsideBet('column', [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36])}
            className="bg-green-700 hover:bg-green-600 text-white font-bold text-sm rounded-lg shadow-lg transition-all transform hover:scale-105 border-2 border-white relative"
          >
            2:1
            {getBetAmount([3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36]) > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs px-1.5 py-0.5 rounded-full font-bold shadow-lg">
                ${getBetAmount([3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36])}
              </span>
            )}
          </button>
          <button
            onClick={() => handleOutsideBet('column', [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35])}
            className="bg-green-700 hover:bg-green-600 text-white font-bold text-sm rounded-lg shadow-lg transition-all transform hover:scale-105 border-2 border-white relative"
          >
            2:1
            {getBetAmount([2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35]) > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs px-1.5 py-0.5 rounded-full font-bold shadow-lg">
                ${getBetAmount([2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35])}
              </span>
            )}
          </button>
          <button
            onClick={() => handleOutsideBet('column', [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34])}
            className="bg-green-700 hover:bg-green-600 text-white font-bold text-sm rounded-lg shadow-lg transition-all transform hover:scale-105 border-2 border-white relative"
          >
            2:1
            {getBetAmount([1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34]) > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs px-1.5 py-0.5 rounded-full font-bold shadow-lg">
                ${getBetAmount([1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34])}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Dozens */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        <button
          onClick={() => handleOutsideBet('dozen', Array.from({ length: 12 }, (_, i) => i + 1))}
          className="bg-green-700 hover:bg-green-600 text-white font-bold py-3 rounded-lg shadow-lg transition-all transform hover:scale-105 border-2 border-white relative"
        >
          1st 12
          {getBetAmount(Array.from({ length: 12 }, (_, i) => i + 1)) > 0 && (
            <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs px-1.5 py-0.5 rounded-full font-bold shadow-lg">
              ${getBetAmount(Array.from({ length: 12 }, (_, i) => i + 1))}
            </span>
          )}
        </button>
        <button
          onClick={() => handleOutsideBet('dozen', Array.from({ length: 12 }, (_, i) => i + 13))}
          className="bg-green-700 hover:bg-green-600 text-white font-bold py-3 rounded-lg shadow-lg transition-all transform hover:scale-105 border-2 border-white relative"
        >
          2nd 12
          {getBetAmount(Array.from({ length: 12 }, (_, i) => i + 13)) > 0 && (
            <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs px-1.5 py-0.5 rounded-full font-bold shadow-lg">
              ${getBetAmount(Array.from({ length: 12 }, (_, i) => i + 13))}
            </span>
          )}
        </button>
        <button
          onClick={() => handleOutsideBet('dozen', Array.from({ length: 12 }, (_, i) => i + 25))}
          className="bg-green-700 hover:bg-green-600 text-white font-bold py-3 rounded-lg shadow-lg transition-all transform hover:scale-105 border-2 border-white relative"
        >
          3rd 12
          {getBetAmount(Array.from({ length: 12 }, (_, i) => i + 25)) > 0 && (
            <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs px-1.5 py-0.5 rounded-full font-bold shadow-lg">
              ${getBetAmount(Array.from({ length: 12 }, (_, i) => i + 25))}
            </span>
          )}
        </button>
      </div>

      {/* Even Money Bets */}
      <div className="grid grid-cols-6 gap-2 mt-4">
        <button
          onClick={() => handleOutsideBet('low', Array.from({ length: 18 }, (_, i) => i + 1))}
          className="bg-green-700 hover:bg-green-600 text-white font-bold py-3 rounded-lg shadow-lg transition-all transform hover:scale-105 border-2 border-white text-sm relative"
        >
          1-18
          {getBetAmount(Array.from({ length: 18 }, (_, i) => i + 1)) > 0 && (
            <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs px-1.5 py-0.5 rounded-full font-bold shadow-lg">
              ${getBetAmount(Array.from({ length: 18 }, (_, i) => i + 1))}
            </span>
          )}
        </button>
        <button
          onClick={() => handleOutsideBet('even', Array.from({ length: 18 }, (_, i) => (i + 1) * 2))}
          className="bg-green-700 hover:bg-green-600 text-white font-bold py-3 rounded-lg shadow-lg transition-all transform hover:scale-105 border-2 border-white text-sm relative"
        >
          EVEN
          {getBetAmount(Array.from({ length: 18 }, (_, i) => (i + 1) * 2)) > 0 && (
            <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs px-1.5 py-0.5 rounded-full font-bold shadow-lg">
              ${getBetAmount(Array.from({ length: 18 }, (_, i) => (i + 1) * 2))}
            </span>
          )}
        </button>
        <button
          onClick={() => handleOutsideBet('red', RED_NUMBERS)}
          className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg shadow-lg transition-all transform hover:scale-105 border-2 border-white text-sm relative"
        >
          RED
          {getBetAmount(RED_NUMBERS) > 0 && (
            <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs px-1.5 py-0.5 rounded-full font-bold shadow-lg">
              ${getBetAmount(RED_NUMBERS)}
            </span>
          )}
        </button>
        <button
          onClick={() => handleOutsideBet('black', BLACK_NUMBERS)}
          className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-lg shadow-lg transition-all transform hover:scale-105 border-2 border-white text-sm relative"
        >
          BLACK
          {getBetAmount(BLACK_NUMBERS) > 0 && (
            <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs px-1.5 py-0.5 rounded-full font-bold shadow-lg">
              ${getBetAmount(BLACK_NUMBERS)}
            </span>
          )}
        </button>
        <button
          onClick={() => handleOutsideBet('odd', Array.from({ length: 18 }, (_, i) => i * 2 + 1))}
          className="bg-green-700 hover:bg-green-600 text-white font-bold py-3 rounded-lg shadow-lg transition-all transform hover:scale-105 border-2 border-white text-sm relative"
        >
          ODD
          {getBetAmount(Array.from({ length: 18 }, (_, i) => i * 2 + 1)) > 0 && (
            <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs px-1.5 py-0.5 rounded-full font-bold shadow-lg">
              ${getBetAmount(Array.from({ length: 18 }, (_, i) => i * 2 + 1))}
            </span>
          )}
        </button>
        <button
          onClick={() => handleOutsideBet('high', Array.from({ length: 18 }, (_, i) => i + 19))}
          className="bg-green-700 hover:bg-green-600 text-white font-bold py-3 rounded-lg shadow-lg transition-all transform hover:scale-105 border-2 border-white text-sm relative"
        >
          19-36
          {getBetAmount(Array.from({ length: 18 }, (_, i) => i + 19)) > 0 && (
            <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs px-1.5 py-0.5 rounded-full font-bold shadow-lg">
              ${getBetAmount(Array.from({ length: 18 }, (_, i) => i + 19))}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

