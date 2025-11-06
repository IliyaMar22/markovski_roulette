/**
 * Mr Markovski's Roulette - Spin API Endpoint
 * Node.js serverless function for Vercel
 */

// European Roulette: 0-36
const EUROPEAN_NUMBERS = Array.from({ length: 37 }, (_, i) => i);

// Number properties
const RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
const BLACK_NUMBERS = new Set([2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35]);

// Payout ratios
const PAYOUTS = {
  straight: 35,
  split: 17,
  street: 11,
  corner: 8,
  line: 5,
  dozen: 2,
  column: 2,
  red: 1,
  black: 1,
  odd: 1,
  even: 1,
  high: 1,
  low: 1,
  neighbor: 35,
  voisins: 35,
  tiers: 35,
  orphelins: 35,
};

function getColor(number) {
  if (number === 0) return "green";
  return RED_NUMBERS.has(number) ? "red" : "black";
}

function isWinningBet(bet, winningNumber) {
  return bet.numbers.includes(winningNumber);
}

function calculatePayout(bet, winningNumber) {
  if (!isWinningBet(bet, winningNumber)) {
    return 0.0;
  }
  
  const payoutRatio = PAYOUTS[bet.type] || 0;
  return bet.amount * (payoutRatio + 1);
}

function generateWinningNumber() {
  // Use Node.js crypto for secure random number
  const crypto = require('crypto');
  const randomBytes = crypto.randomBytes(4);
  const randomInt = randomBytes.readUInt32BE(0);
  return randomInt % 37; // 0-36
}

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { bets, balance } = req.body;

    if (!bets || !Array.isArray(bets) || bets.length === 0) {
      return res.status(400).json({ error: 'Invalid bets array' });
    }

    if (typeof balance !== 'number' || balance < 0) {
      return res.status(400).json({ error: 'Invalid balance' });
    }

    // Validate bets
    const totalBet = bets.reduce((sum, bet) => sum + (bet.amount || 0), 0);
    if (totalBet > balance) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Generate winning number
    const winningNumber = generateWinningNumber();
    const winningColor = getColor(winningNumber);

    // Calculate payouts
    let totalPayout = 0.0;
    const winningBets = [];

    for (const bet of bets) {
      const payout = calculatePayout(bet, winningNumber);
      if (payout > 0) {
        totalPayout += payout;
        winningBets.push({
          type: bet.type,
          numbers: bet.numbers,
          amount: bet.amount,
          payout: payout,
        });
      }
    }

    // Update balance
    const newBalance = balance - totalBet + totalPayout;

    return res.status(200).json({
      winning_number: winningNumber,
      winning_color: winningColor,
      payout: totalPayout,
      new_balance: newBalance,
      winning_bets: winningBets,
    });
  } catch (error) {
    console.error('Error processing spin:', error);
    return res.status(500).json({
      error: {
        code: '500',
        message: `Internal server error: ${error.message}`,
      },
    });
  }
}

