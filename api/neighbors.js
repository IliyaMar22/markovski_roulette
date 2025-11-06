/**
 * Mr Markovski's Roulette - Neighbors API Endpoint
 * Node.js serverless function for Vercel
 */

// Neighbor relationships (wheel positions)
const WHEEL_POSITIONS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
  5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];

function getNeighbors(number, count) {
  try {
    const idx = WHEEL_POSITIONS.indexOf(number);
    if (idx === -1) return [];

    const neighbors = [];
    for (let i = -count; i <= count; i++) {
      if (i === 0) continue;
      const neighborIdx = (idx + i + WHEEL_POSITIONS.length) % WHEEL_POSITIONS.length;
      neighbors.push(WHEEL_POSITIONS[neighborIdx]);
    }
    return neighbors;
  } catch (error) {
    return [];
  }
}

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract number from path: /api/numbers/{number}/neighbors
    const pathParts = req.url.split('/');
    const numberIndex = pathParts.indexOf('numbers');
    const number = numberIndex !== -1 && pathParts[numberIndex + 1] 
      ? parseInt(pathParts[numberIndex + 1], 10)
      : parseInt(req.query.number, 10);
    
    const count = parseInt(req.query.count || '1', 10);
    const num = number;
    const cnt = count;

    if (isNaN(num) || num < 0 || num > 36) {
      return res.status(400).json({ error: 'Invalid number' });
    }

    if (isNaN(cnt) || cnt < 1 || cnt > 4) {
      return res.status(400).json({ error: 'Count must be 1-4' });
    }

    const neighbors = getNeighbors(num, cnt);

    return res.status(200).json({
      number: num,
      neighbors: neighbors,
      count: cnt,
    });
  } catch (error) {
    console.error('Error getting neighbors:', error);
    return res.status(500).json({
      error: {
        code: '500',
        message: `Internal server error: ${error.message}`,
      },
    });
  }
}

