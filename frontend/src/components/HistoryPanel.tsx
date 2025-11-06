import React from 'react';
import { useGameStore } from '../store/gameStore';

const RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);

const getNumberColor = (num: number): string => {
  if (num === 0) return 'bg-green-600';
  return RED_NUMBERS.has(num) ? 'bg-red-600' : 'bg-gray-900';
};

export const HistoryPanel: React.FC = () => {
  const { history } = useGameStore();

  return (
    <div className="bg-[#1a1a2e] rounded-2xl p-8 shadow-2xl h-full">
      <h2 className="text-3xl font-bold text-[#00ff88] mb-6">Last 20 Results</h2>
      <div className="flex flex-wrap gap-3">
        {history.length === 0 ? (
          <div className="w-full bg-[#0f0f23] rounded-xl p-6 text-center">
            <p className="text-gray-500 text-lg">No spins yet</p>
          </div>
        ) : (
          history.map((number, index) => (
            <div
              key={index}
              className={`
                w-14 h-14 rounded-xl flex items-center justify-center
                font-bold text-white text-lg shadow-lg
                ${getNumberColor(number)}
                ${index === 0 ? 'ring-4 ring-[#ffd700] scale-110' : ''}
              `}
              title={`Spin ${history.length - index}: ${number}`}
            >
              {number}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
