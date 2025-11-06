import React, { useState } from 'react';
import { useGameStore, CHIP_DENOMINATIONS, type Bet } from '../store/gameStore';
import axios from 'axios';

// Auto-detect API URL based on environment
const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? '/api' : 'http://localhost:8000');
const SPIN_DURATION = 5000;

const RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);

export const GameControls: React.FC = () => {
  const {
    balance,
    bets,
    selectedChip,
    setSelectedChip,
    clearBets,
    addBet,
    isSpinning,
    setIsSpinning,
    setLastSpin,
    setLastSpinResult,
    lastSpinResult,
    setBalance,
    addToHistory,
    getTotalStake,
    history,
    resetGame,
  } = useGameStore();

  const [neighborNumber, setNeighborNumber] = useState('');
  const [neighborCount, setNeighborCount] = useState(1);

  const totalStake = getTotalStake();

  const getBetAmount = (numbers: number[]): number => {
    return bets
      .filter((b) => JSON.stringify(b.numbers.sort()) === JSON.stringify(numbers.sort()))
      .reduce((sum, b) => sum + b.amount, 0);
  };

  const handleSpin = async () => {
    console.log('Spin clicked. Bets:', bets, 'Total stake:', totalStake, 'Balance:', balance, 'Is spinning:', isSpinning);
    
    if (isSpinning) {
      console.log('Already spinning, ignoring click');
      return;
    }
    
    if (bets.length === 0) {
      console.log('No bets placed');
      alert('Please place at least one bet before spinning!');
      return;
    }
    
    if (totalStake > balance) {
      console.log('Insufficient balance');
      alert('Insufficient balance!');
      return;
    }

    console.log('Making API call to:', `${API_URL}/spin`);
    
    try {
      const apiBets = bets.map((bet) => ({
        type: bet.type,
        value: bet.value,
        numbers: bet.numbers,
        amount: bet.amount,
        payout: bet.payout,
      }));

      const requestPayload = {
        bets: apiBets,
        balance: balance,
      };
      
      console.log('=== REQUEST DETAILS ===');
      console.log('API URL:', `${API_URL}/spin`);
      console.log('Request Payload:', JSON.stringify(requestPayload, null, 2));
      console.log('Bets array:', apiBets);
      console.log('Balance:', balance);
      console.log('About to make axios call...');
      
      const response = await axios.post(`${API_URL}/spin`, requestPayload, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(resp => {
          console.log('THEN block executed, response:', resp);
          return resp;
        })
        .catch(err => {
          console.error('CATCH block executed, error:', err);
          throw err;
        });

      console.log('After axios call, API response received:', response.data);
      const result = response.data;
      
      // Calculate win/loss
      const netProfit = result.payout - totalStake;
      setLastSpinResult({
        winAmount: result.payout,
        totalBet: totalStake,
        netProfit: netProfit,
      });
      
      // Set winning number first
      console.log('Setting winning number:', result.winning_number);
      setLastSpin(result.winning_number, result.winning_color);
      
      // Start animation immediately
      console.log('Setting isSpinning to true');
      setIsSpinning(true);
      
      // Update balance and history
      setBalance(result.new_balance);
      addToHistory(result.winning_number);

      // Clear bets and stop spinning after animation completes
      setTimeout(() => {
        console.log('Clearing bets and stopping spin');
        clearBets();
        setIsSpinning(false);
      }, SPIN_DURATION + 500);
    } catch (error) {
      console.error('=== SPIN ERROR CAUGHT ===');
      console.error('Error type:', typeof error);
      console.error('Error:', error);
      console.error('Error string:', String(error));
      
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        const errorDetail = errorData?.detail || errorData?.error || error.message;
        
        console.error('=== FULL ERROR RESPONSE ===');
        console.error('Status:', error.response?.status);
        console.error('Response Data:', JSON.stringify(errorData, null, 2));
        console.error('Error Detail:', errorDetail);
        console.error('Full Error Object:', error);
        
        alert(`Error: ${errorDetail || 'Failed to connect to backend'}\n\nCheck console for full details.`);
      } else {
        console.error('Non-axios error:', error);
        alert('Error processing spin. Please check backend connection.');
      }
      setIsSpinning(false);
    }
  };

  const handleCallBet = (type: string, numbers: number[]) => {
    const bet: Bet = {
      id: `${type}-${Date.now()}`,
      type,
      numbers,
      amount: selectedChip,
      payout: 0,
    };
    console.log('Adding call bet:', bet);
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
      neighbors.push(wheelPositions[(idx - i + wheelPositions.length) % wheelPositions.length]);
      neighbors.push(wheelPositions[(idx + i) % wheelPositions.length]);
    }
    
    addBet({
      id: `neighbor-${number}-${Date.now()}`,
      type: 'neighbor',
      value: number,
      numbers: neighbors,
      amount: selectedChip * neighbors.length,
      payout: 0,
    });
    setNeighborNumber('');
  };

  const getChipColor = (value: number): string => {
    const colors: Record<number, string> = {
      1: 'bg-white text-black border-blue-600',
      5: 'bg-red-600 text-white border-red-800',
      25: 'bg-green-600 text-white border-green-800',
      100: 'bg-black text-white border-yellow-500',
      500: 'bg-purple-600 text-white border-purple-800',
      1000: 'bg-yellow-500 text-black border-yellow-700',
    };
    return colors[value] || 'bg-gray-500';
  };

  const getNumberColor = (num: number): string => {
    if (num === 0) return 'bg-green-700';
    return RED_NUMBERS.has(num) ? 'bg-red-600' : 'bg-gray-900';
  };

  return (
    <div className="space-y-4">
      {/* Spin Button */}
      <div className="bg-gradient-to-br from-green-900 via-green-800 to-green-900 rounded-2xl p-6 shadow-2xl border-4 border-yellow-700 text-center">
        <button
          onClick={handleSpin}
          disabled={isSpinning || bets.length === 0 || totalStake > balance}
          className={`
            w-full h-32 rounded-2xl font-bold text-3xl transition-all transform shadow-2xl
            ${
              isSpinning || bets.length === 0 || totalStake > balance
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-yellow-500 hover:bg-yellow-400 text-black hover:scale-105 shadow-[0_0_30px_rgba(255,215,0,0.5)]'
            }
          `}
        >
          {isSpinning ? 'SPINNING...' : 'SPIN'}
        </button>
        <div className="mt-4 text-white text-sm">
          <div>Total Stake: <span className="font-bold text-yellow-400">${totalStake.toFixed(2)}</span></div>
          {totalStake > balance && <div className="text-red-400 font-bold mt-2">Insufficient balance!</div>}
          {bets.length === 0 && !isSpinning && <div className="text-gray-400 mt-2">Place bets to spin</div>}
        </div>
      </div>

      {/* Last Spin Result - Win/Loss Display */}
      {lastSpinResult && (
        <div className={`
          rounded-2xl p-4 shadow-2xl border-4 text-center transform transition-all
          ${lastSpinResult.netProfit > 0 
            ? 'bg-gradient-to-br from-green-600 to-green-800 border-green-400' 
            : lastSpinResult.netProfit < 0
            ? 'bg-gradient-to-br from-red-600 to-red-800 border-red-400'
            : 'bg-gradient-to-br from-gray-600 to-gray-800 border-gray-400'
          }
        `}>
          <div className="text-white font-bold text-lg mb-2">
            {lastSpinResult.netProfit > 0 ? '🎉 YOU WON! 🎉' : lastSpinResult.netProfit < 0 ? '😢 YOU LOST' : 'PUSH'}
          </div>
          <div className="text-white space-y-1">
            <div className="text-sm">Bet: <span className="font-bold">${lastSpinResult.totalBet.toFixed(2)}</span></div>
            <div className="text-sm">Won: <span className="font-bold">${lastSpinResult.winAmount.toFixed(2)}</span></div>
            <div className={`text-2xl font-extrabold ${lastSpinResult.netProfit > 0 ? 'text-yellow-300' : 'text-white'}`}>
              {lastSpinResult.netProfit > 0 ? '+' : ''}{lastSpinResult.netProfit.toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* Chip Selector */}
      <div className="bg-gradient-to-br from-green-900 via-green-800 to-green-900 rounded-2xl p-4 shadow-2xl border-4 border-yellow-700">
        <h3 className="text-white font-bold mb-3 text-center">Select Chip</h3>
        <div className="grid grid-cols-3 gap-2">
          {CHIP_DENOMINATIONS.map((value) => (
            <button
              key={value}
              onClick={() => setSelectedChip(value)}
              className={`
                w-full aspect-square rounded-full flex items-center justify-center
                font-bold text-sm transition-all transform shadow-lg border-4
                ${getChipColor(value)}
                ${selectedChip === value ? 'scale-110 ring-4 ring-yellow-400' : 'scale-100 hover:scale-105'}
              `}
            >
              ${value}
            </button>
          ))}
        </div>
      </div>

      {/* Call Bets & Neighbors */}
      <div className="bg-gradient-to-br from-green-900 via-green-800 to-green-900 rounded-2xl p-4 shadow-2xl border-4 border-yellow-700">
        <h3 className="text-white font-bold mb-3 text-center text-sm">Special Bets</h3>
        <div className="space-y-2">
          <button
            onClick={() => handleCallBet('voisins', [0, 2, 3, 4, 7, 12, 15, 18, 19, 21, 22, 25, 26, 28, 29, 32, 35])}
            className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-2 px-2 rounded text-xs transition-all relative"
          >
            Voisins du Zéro
            {getBetAmount([0, 2, 3, 4, 7, 12, 15, 18, 19, 21, 22, 25, 26, 28, 29, 32, 35]) > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-yellow-400 text-xs px-1.5 py-0.5 rounded-full font-bold shadow-lg">
                ${getBetAmount([0, 2, 3, 4, 7, 12, 15, 18, 19, 21, 22, 25, 26, 28, 29, 32, 35])}
              </span>
            )}
          </button>
          <button
            onClick={() => handleCallBet('tiers', [5, 8, 10, 11, 13, 16, 23, 24, 27, 30, 33, 36])}
            className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-2 px-2 rounded text-xs transition-all relative"
          >
            Tiers du Cylindre
            {getBetAmount([5, 8, 10, 11, 13, 16, 23, 24, 27, 30, 33, 36]) > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-yellow-400 text-xs px-1.5 py-0.5 rounded-full font-bold shadow-lg">
                ${getBetAmount([5, 8, 10, 11, 13, 16, 23, 24, 27, 30, 33, 36])}
              </span>
            )}
          </button>
          <button
            onClick={() => handleCallBet('orphelins', [1, 6, 9, 14, 17, 20, 31, 34])}
            className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-2 px-2 rounded text-xs transition-all relative"
          >
            Orphelins
            {getBetAmount([1, 6, 9, 14, 17, 20, 31, 34]) > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-yellow-400 text-xs px-1.5 py-0.5 rounded-full font-bold shadow-lg">
                ${getBetAmount([1, 6, 9, 14, 17, 20, 31, 34])}
              </span>
            )}
          </button>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              max="36"
              value={neighborNumber}
              onChange={(e) => setNeighborNumber(e.target.value)}
              placeholder="Num"
              className="flex-1 bg-white/10 text-white px-2 py-2 rounded text-sm text-center"
            />
            <select
              value={neighborCount}
              onChange={(e) => setNeighborCount(Number(e.target.value))}
              className="bg-white/10 text-white px-2 py-2 rounded text-sm"
            >
              <option value={1}>±1</option>
              <option value={2}>±2</option>
              <option value={3}>±3</option>
              <option value={4}>±4</option>
            </select>
            <button
              onClick={handleNeighborBet}
              className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold px-3 py-2 rounded text-xs"
            >
              Bet
            </button>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="bg-gradient-to-br from-green-900 via-green-800 to-green-900 rounded-2xl p-4 shadow-2xl border-4 border-yellow-700">
        <h3 className="text-white font-bold mb-3 text-center text-sm">Last Results</h3>
        <div className="flex flex-wrap gap-2 justify-center">
          {history.length === 0 ? (
            <p className="text-gray-400 text-xs">No spins yet</p>
          ) : (
            history.slice(0, 10).map((num, idx) => (
              <div
                key={idx}
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-lg ${getNumberColor(num)} ${idx === 0 ? 'ring-2 ring-yellow-400' : ''}`}
              >
                {num}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bet Controls */}
      <div className="flex gap-2">
        <button
          onClick={clearBets}
          disabled={bets.length === 0}
          className={`
            flex-1 py-3 rounded-lg font-bold text-sm transition-all
            ${bets.length === 0 ? 'bg-gray-700 text-gray-500' : 'bg-red-600 hover:bg-red-500 text-white'}
          `}
        >
          Clear Bets
        </button>
        <button
          onClick={() => {
            if (bets.length > 0) {
              bets.forEach(b => addBet({ ...b, id: `${b.id}-${Date.now()}` }));
            }
          }}
          disabled={bets.length === 0}
          className={`
            flex-1 py-3 rounded-lg font-bold text-sm transition-all
            ${bets.length === 0 ? 'bg-gray-700 text-gray-500' : 'bg-green-600 hover:bg-green-500 text-white'}
          `}
        >
          Repeat
        </button>
      </div>
      
      {/* Reset Game Button */}
      <button
        onClick={() => {
          if (confirm('Reset game to $10,000 balance and clear all data?')) {
            resetGame();
          }
        }}
        className="w-full mt-2 py-2 rounded-lg font-bold text-sm bg-yellow-600 hover:bg-yellow-500 text-black transition-all"
      >
        Reset Game
      </button>
    </div>
  );
};

