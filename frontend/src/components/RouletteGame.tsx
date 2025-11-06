import React from 'react';
import { RouletteWheel } from './RouletteWheel';
import { BettingBoard } from './BettingBoard';
import { GameControls } from './GameControls';
import { useGameStore } from '../store/gameStore';

export const RouletteGame: React.FC = () => {
  const { lastSpin, isSpinning } = useGameStore();

  return (
    <div className="w-full max-w-[1400px] mx-auto">
      {/* Top Section: Wheel and Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 mb-8">
        {/* Betting Board */}
        <div>
          <BettingBoard />
        </div>

        {/* Wheel and Controls */}
        <div className="space-y-6">
          <RouletteWheel
            winningNumber={lastSpin}
            isSpinning={isSpinning}
          />
          <GameControls />
        </div>
      </div>
    </div>
  );
};

