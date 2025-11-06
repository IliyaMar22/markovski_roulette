import React from 'react';
import { useGameStore } from '../store/gameStore';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const SpinControls: React.FC = () => {
  const {
    bets,
    isSpinning,
    setIsSpinning,
    setLastSpin,
    setBalance,
    addToHistory,
    clearBets,
    getTotalStake,
    balance,
  } = useGameStore();

  const handleSpin = async () => {
    if (isSpinning || bets.length === 0) return;

    const totalStake = getTotalStake();
    if (totalStake > balance) {
      alert('Insufficient balance!');
      return;
    }

    try {
      // Convert bets to API format
      const apiBets = bets.map((bet) => ({
        type: bet.type,
        value: bet.value,
        numbers: bet.numbers,
        amount: bet.amount,
        payout: bet.payout,
      }));

      console.log('API URL:', API_URL);
      console.log('Sending bets:', apiBets);
      console.log('Balance:', balance);

      const response = await axios.post(`${API_URL}/spin`, {
        bets: apiBets,
        balance: balance,
      });

      const result = response.data;

      // Set winning number first, then start spinning
      setLastSpin(result.winning_number, result.winning_color);
      
      // Small delay to ensure state is set, then start animation
      setTimeout(() => {
        setIsSpinning(true);
        
        // Update balance and history after animation starts
        setBalance(result.new_balance);
        addToHistory(result.winning_number);

        // Clear bets and stop spinning after animation completes
        setTimeout(() => {
          clearBets();
          setIsSpinning(false);
        }, 3500);
      }, 100);
    } catch (error) {
      console.error('Spin error:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response:', error.response?.data);
        console.error('Status:', error.response?.status);
        console.error('Message:', error.message);
        alert(`Error: ${error.response?.data?.detail || error.message || 'Unknown error'}`);
      } else {
        alert('Error processing spin. Please try again.');
      }
      setIsSpinning(false);
    }
  };

  const totalStake = getTotalStake();

  return (
    <div className="flex flex-col items-center space-y-6 w-full">
      <button
        onClick={handleSpin}
        disabled={isSpinning || bets.length === 0 || totalStake > balance}
        className={`
          w-64 h-64 rounded-full font-bold text-4xl transition-all transform shadow-2xl
          ${
            isSpinning || bets.length === 0 || totalStake > balance
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-[#00ff88] hover:bg-[#00cc6a] text-black hover:scale-110 shadow-[0_0_50px_rgba(0,255,136,0.5)] hover:shadow-[0_0_70px_rgba(0,255,136,0.8)]'
          }
        `}
      >
        {isSpinning ? (
          <div className="animate-pulse">SPINNING...</div>
        ) : (
          'SPIN'
        )}
      </button>
      
      {totalStake > balance && (
        <div className="bg-[#ff006e] text-white px-6 py-3 rounded-xl font-bold text-lg">
          Insufficient balance!
        </div>
      )}
      
      {bets.length === 0 && !isSpinning && (
        <div className="bg-[#0f0f23] text-gray-400 px-6 py-3 rounded-xl text-lg">
          Place bets to spin
        </div>
      )}
    </div>
  );
};
