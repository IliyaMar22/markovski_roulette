import React, { useState } from 'react';
import { useGameStore, type Bet } from '../store/gameStore';

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const BLACK_NUMBERS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];

// Table layout: 3 rows of 12 numbers each
const TABLE_ROWS = [
  [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
  [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
  [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
];

export const BettingTable: React.FC = () => {
  const { addBet, selectedChip, bets } = useGameStore();
  const [neighborCount, setNeighborCount] = useState<number>(1);
  const [neighborNumber, setNeighborNumber] = useState<string>('');

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
    addBet(bet);
  };

  const handleNeighborBet = () => {
    const number = parseInt(neighborNumber);
    if (isNaN(number) || number < 0 || number > 36) return;

    const wheelPositions = [
      0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
      5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
    ];
    
    const idx = wheelPositions.indexOf(number);
    if (idx === -1) return;
    
    const neighbors: number[] = [number];
    for (let i = 1; i <= neighborCount; i++) {
      const leftIdx = (idx - i + wheelPositions.length) % wheelPositions.length;
      const rightIdx = (idx + i) % wheelPositions.length;
      neighbors.push(wheelPositions[leftIdx]);
      neighbors.push(wheelPositions[rightIdx]);
    }
    
    const bet: Bet = {
      id: `neighbor-${number}-${neighborCount}-${Date.now()}`,
      type: 'neighbor',
      value: number,
      numbers: neighbors,
      amount: selectedChip * neighbors.length,
      payout: 0,
    };
    addBet(bet);
    setNeighborNumber('');
  };

  const handleCallBet = (type: string, numbers: number[]) => {
    const bet: Bet = {
      id: `${type}-${Date.now()}`,
      type,
      numbers,
      amount: selectedChip * numbers.length,
      payout: 0,
    };
    addBet(bet);
  };

  const getNumberColor = (num: number): string => {
    if (num === 0) return 'bg-green-600';
    return RED_NUMBERS.includes(num) ? 'bg-red-600' : 'bg-gray-900';
  };

  const getNumberTextColor = (): string => {
    return 'text-white';
  };

  return (
    <div className="bg-[#1a1a2e] rounded-2xl p-8 shadow-2xl">
      <h2 className="text-3xl font-bold text-[#00ff88] mb-6 text-center">Betting Table</h2>

      {/* Call Bets */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <button
          onClick={() => handleCallBet('voisins', [0, 2, 3, 4, 7, 12, 15, 18, 19, 21, 22, 25, 26, 28, 29, 32, 35])}
          className="bg-[#ffd700] hover:bg-[#ffed4e] text-black px-6 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
        >
          Voisins du Zéro
        </button>
        <button
          onClick={() => handleCallBet('tiers', [5, 8, 10, 11, 13, 16, 23, 24, 27, 30, 33, 36])}
          className="bg-[#ffd700] hover:bg-[#ffed4e] text-black px-6 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
        >
          Tiers du Cylindre
        </button>
        <button
          onClick={() => handleCallBet('orphelins', [1, 6, 9, 14, 17, 20, 31, 34])}
          className="bg-[#ffd700] hover:bg-[#ffed4e] text-black px-6 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
        >
          Orphelins
        </button>
        {/* Neighbor Betting */}
        <div className="bg-[#0f0f23] rounded-xl p-4 flex flex-col gap-2">
          <label className="text-white text-sm font-semibold">Neighbors</label>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              max="36"
              value={neighborNumber}
              onChange={(e) => setNeighborNumber(e.target.value)}
              placeholder="0-36"
              className="flex-1 bg-[#1a1a2e] text-white px-3 py-2 rounded-lg text-center font-bold"
            />
            <select
              value={neighborCount}
              onChange={(e) => setNeighborCount(Number(e.target.value))}
              className="bg-[#1a1a2e] text-white px-2 py-2 rounded-lg font-bold"
            >
              <option value={1}>±1</option>
              <option value={2}>±2</option>
              <option value={3}>±3</option>
              <option value={4}>±4</option>
            </select>
          </div>
          <button
            onClick={handleNeighborBet}
            className="bg-[#00ff88] hover:bg-[#00cc6a] text-black px-4 py-2 rounded-lg font-bold transition-all"
          >
            Bet
          </button>
        </div>
      </div>

      {/* Main Betting Grid */}
      <div className="grid grid-cols-[auto_1fr_auto] gap-4 mb-8">
        {/* Zero */}
        <div className="flex items-center">
          <button
            onClick={() => handleNumberClick(0)}
            className={`w-20 h-full ${getNumberColor(0)} ${getNumberTextColor()} font-bold text-2xl rounded-xl hover:opacity-80 transition-all transform hover:scale-105 shadow-lg relative min-h-[240px]`}
          >
            <span className="transform -rotate-90 inline-block">0</span>
            {getBetAmount([0]) > 0 && (
              <div className="absolute top-2 right-2 bg-[#ffd700] text-black text-xs px-2 py-1 rounded-full font-bold">
                ${getBetAmount([0])}
              </div>
            )}
          </button>
        </div>

        {/* Number Grid */}
        <div className="grid grid-cols-12 gap-2">
          {TABLE_ROWS.map((row) =>
            row.map((num) => (
              <button
                key={num}
                onClick={() => handleNumberClick(num)}
                className={`aspect-square ${getNumberColor(num)} ${getNumberTextColor()} font-bold text-xl rounded-lg hover:opacity-80 transition-all transform hover:scale-105 shadow-lg relative`}
              >
                {num}
                {getBetAmount([num]) > 0 && (
                  <div className="absolute -top-1 -right-1 bg-[#ffd700] text-black text-xs px-1.5 py-0.5 rounded-full font-bold">
                    ${getBetAmount([num])}
                  </div>
                )}
              </button>
            ))
          )}
        </div>

        {/* Column Bets */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => handleOutsideBet('column', [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36])}
            className="flex-1 bg-[#00ff88] hover:bg-[#00cc6a] text-black px-4 py-2 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg"
          >
            2:1
          </button>
          <button
            onClick={() => handleOutsideBet('column', [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35])}
            className="flex-1 bg-[#00ff88] hover:bg-[#00cc6a] text-black px-4 py-2 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg"
          >
            2:1
          </button>
          <button
            onClick={() => handleOutsideBet('column', [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34])}
            className="flex-1 bg-[#00ff88] hover:bg-[#00cc6a] text-black px-4 py-2 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg"
          >
            2:1
          </button>
        </div>
      </div>

      {/* Outside Bets */}
      <div className="grid grid-cols-3 gap-4">
        {/* First Row */}
        <button
          onClick={() => handleOutsideBet('dozen', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])}
          className="bg-[#00ff88] hover:bg-[#00cc6a] text-black px-6 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
        >
          1st 12
        </button>
        <button
          onClick={() => handleOutsideBet('dozen', [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24])}
          className="bg-[#00ff88] hover:bg-[#00cc6a] text-black px-6 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
        >
          2nd 12
        </button>
        <button
          onClick={() => handleOutsideBet('dozen', [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36])}
          className="bg-[#00ff88] hover:bg-[#00cc6a] text-black px-6 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
        >
          3rd 12
        </button>
      </div>

      {/* Even Money Bets */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-4">
        <button
          onClick={() => handleOutsideBet('low', Array.from({ length: 18 }, (_, i) => i + 1))}
          className="bg-[#00ff88] hover:bg-[#00cc6a] text-black px-6 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
        >
          1-18
        </button>
        <button
          onClick={() => handleOutsideBet('even', Array.from({ length: 18 }, (_, i) => (i + 1) * 2))}
          className="bg-[#00ff88] hover:bg-[#00cc6a] text-black px-6 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
        >
          EVEN
        </button>
        <button
          onClick={() => handleOutsideBet('red', RED_NUMBERS)}
          className="bg-red-600 hover:bg-red-500 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
        >
          RED
        </button>
        <button
          onClick={() => handleOutsideBet('black', BLACK_NUMBERS)}
          className="bg-gray-900 hover:bg-gray-700 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg border-2 border-white"
        >
          BLACK
        </button>
        <button
          onClick={() => handleOutsideBet('odd', Array.from({ length: 18 }, (_, i) => i * 2 + 1))}
          className="bg-[#00ff88] hover:bg-[#00cc6a] text-black px-6 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
        >
          ODD
        </button>
        <button
          onClick={() => handleOutsideBet('high', Array.from({ length: 18 }, (_, i) => i + 19))}
          className="bg-[#00ff88] hover:bg-[#00cc6a] text-black px-6 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
        >
          19-36
        </button>
      </div>
    </div>
  );
};
