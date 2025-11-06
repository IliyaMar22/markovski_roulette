import React from 'react';
import { useGameStore, CHIP_DENOMINATIONS } from '../store/gameStore';

export const ChipSelector: React.FC = () => {
  const { selectedChip, setSelectedChip } = useGameStore();

  const getChipColor = (value: number): string => {
    const colors: { [key: number]: string } = {
      1: 'bg-white text-black border-4 border-blue-500',
      5: 'bg-red-600 text-white border-4 border-red-800',
      25: 'bg-green-600 text-white border-4 border-green-800',
      100: 'bg-black text-white border-4 border-yellow-500',
      500: 'bg-purple-600 text-white border-4 border-purple-800',
      1000: 'bg-yellow-500 text-black border-4 border-yellow-700',
    };
    return colors[value] || 'bg-gray-500';
  };

  return (
    <div className="bg-[#1a1a2e] rounded-2xl p-8 shadow-2xl">
      <h3 className="text-2xl font-bold text-[#00ff88] mb-6 text-center">Select Chip Value</h3>
      <div className="flex flex-wrap gap-6 justify-center">
        {CHIP_DENOMINATIONS.map((value) => (
          <button
            key={value}
            onClick={() => setSelectedChip(value)}
            className={`
              w-24 h-24 rounded-full flex items-center justify-center
              font-bold text-xl transition-all transform shadow-2xl
              ${getChipColor(value)}
              ${selectedChip === value 
                ? 'scale-125 ring-8 ring-[#00ff88] shadow-[0_0_30px_rgba(0,255,136,0.6)]' 
                : 'scale-100 hover:scale-110 hover:shadow-xl'
              }
            `}
          >
            ${value}
          </button>
        ))}
      </div>
    </div>
  );
};
