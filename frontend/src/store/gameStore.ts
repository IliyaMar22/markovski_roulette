import { create } from 'zustand';

export interface Bet {
  id: string;
  type: string;
  value?: number;
  numbers: number[];
  amount: number;
  payout: number;
}

export interface SpinResult {
  winAmount: number;
  totalBet: number;
  netProfit: number; // positive = won, negative = lost
}

export interface GameState {
  balance: number;
  bets: Bet[];
  lastSpin: number | null;
  lastColor: string | null;
  lastSpinResult: SpinResult | null;
  history: number[];
  isSpinning: boolean;
  selectedChip: number;
  addBet: (bet: Bet) => void;
  removeBet: (id: string) => void;
  clearBets: () => void;
  setBalance: (balance: number) => void;
  setLastSpin: (number: number, color: string) => void;
  setLastSpinResult: (result: SpinResult) => void;
  addToHistory: (number: number) => void;
  setIsSpinning: (spinning: boolean) => void;
  setSelectedChip: (chip: number) => void;
  getTotalStake: () => number;
  resetGame: () => void;
}

const CHIP_DENOMINATIONS = [1, 5, 25, 100, 500, 1000];

// Load initial state from localStorage (with reset option)
const loadInitialState = () => {
  try {
    // Check if user wants to reset (for development)
    const resetKey = localStorage.getItem('roulette-reset');
    if (resetKey === 'true') {
      localStorage.removeItem('roulette-game-storage');
      localStorage.setItem('roulette-reset', 'false');
      return {
        balance: 10000,
        history: [],
      };
    }
    
    const stored = localStorage.getItem('roulette-game-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        balance: parsed.balance ?? 10000,
        history: parsed.history ?? [],
      };
    }
  } catch (e) {
    console.error('Failed to load state from localStorage', e);
  }
  return {
    balance: 10000,
    history: [],
  };
};

const initialState = loadInitialState();

export const useGameStore = create<GameState>()((set, get) => ({
      balance: initialState.balance,
      bets: [],
      lastSpin: null,
      lastColor: null,
      lastSpinResult: null,
      history: initialState.history,
      isSpinning: false,
      selectedChip: 25,
      
      addBet: (bet) => {
        const currentBets = get().bets;
        const existingBet = currentBets.find(
          (b) => b.type === bet.type && 
                 JSON.stringify(b.numbers) === JSON.stringify(bet.numbers)
        );
        
        if (existingBet) {
          set({
            bets: currentBets.map((b) =>
              b.id === existingBet.id
                ? { ...b, amount: b.amount + bet.amount }
                : b
            ),
          });
        } else {
          set({ bets: [...currentBets, bet] });
        }
      },
      
      removeBet: (id) => {
        set({ bets: get().bets.filter((b) => b.id !== id) });
      },
      
      clearBets: () => {
        set({ bets: [] });
      },
      
      setBalance: (balance) => {
        set({ balance });
      },
      
      setLastSpin: (number, color) => {
        set({ lastSpin: number, lastColor: color });
      },
      
      setLastSpinResult: (result) => {
        set({ lastSpinResult: result });
      },
      
      addToHistory: (number) => {
        const history = [number, ...get().history].slice(0, 20);
        set({ history });
      },
      
      setIsSpinning: (spinning) => {
        set({ isSpinning: spinning });
      },
      
      setSelectedChip: (chip) => {
        if (CHIP_DENOMINATIONS.includes(chip)) {
          set({ selectedChip: chip });
        }
      },
      
      getTotalStake: () => {
        return get().bets.reduce((sum, bet) => sum + bet.amount, 0);
      },
      
      resetGame: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('roulette-game-storage');
        }
        set({
          balance: 10000,
          bets: [],
          lastSpin: null,
          lastColor: null,
          lastSpinResult: null,
          history: [],
          isSpinning: false,
          selectedChip: 25,
        });
      },
    })
);

// Persist state to localStorage
if (typeof window !== 'undefined') {
  useGameStore.subscribe((state) => {
    try {
      localStorage.setItem('roulette-game-storage', JSON.stringify({
        balance: state.balance,
        history: state.history,
      }));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  });
}

export { CHIP_DENOMINATIONS };

