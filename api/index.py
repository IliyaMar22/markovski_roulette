"""
Mr Markovski's Roulette - FastAPI Backend for Vercel Serverless
"""
import json
import secrets
from typing import Dict, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from mangum import Mangum

app = FastAPI(title="Mr Markovski's Roulette API")

# CORS middleware - allow all origins for Vercel deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# European Roulette: 0-36
EUROPEAN_NUMBERS = list(range(37))

# Number properties
RED_NUMBERS = {1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36}
BLACK_NUMBERS = {2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35}

# Call bets configurations
VOISINS_DU_ZERO = [0, 2, 3, 4, 7, 12, 15, 18, 19, 21, 22, 25, 26, 28, 29, 32, 35]
TIERS_DU_CYLINDRE = [5, 8, 10, 11, 13, 16, 23, 24, 27, 30, 33, 36]
ORPHELINS = [1, 6, 9, 14, 17, 20, 31, 34]

# Neighbor relationships (wheel positions)
WHEEL_POSITIONS = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
    5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
]

# Payout ratios
PAYOUTS = {
    "straight": 35,
    "split": 17,
    "street": 11,
    "corner": 8,
    "line": 5,
    "dozen": 2,
    "column": 2,
    "red": 1,
    "black": 1,
    "odd": 1,
    "even": 1,
    "high": 1,
    "low": 1,
    "neighbor": 35,
    "voisins": 35,
    "tiers": 35,
    "orphelins": 35
}


class Bet(BaseModel):
    type: str
    value: Optional[int] = None
    numbers: List[int]
    amount: float
    payout: float


class SpinRequest(BaseModel):
    bets: List[Bet]
    balance: float


class SpinResult(BaseModel):
    winning_number: int
    winning_color: str
    payout: float
    new_balance: float
    winning_bets: List[Dict]


def get_color(number: int) -> str:
    """Get color of a number"""
    if number == 0:
        return "green"
    return "red" if number in RED_NUMBERS else "black"


def is_winning_bet(bet: Bet, winning_number: int) -> bool:
    """Check if a bet wins"""
    return winning_number in bet.numbers


def calculate_payout(bet: Bet, winning_number: int) -> float:
    """Calculate payout for a bet"""
    if not is_winning_bet(bet, winning_number):
        return 0.0
    
    # Get payout ratio
    payout_ratio = PAYOUTS.get(bet.type, 0)
    return bet.amount * (payout_ratio + 1)


def get_neighbors(number: int, count: int) -> List[int]:
    """Get neighbors around a number on the wheel"""
    try:
        idx = WHEEL_POSITIONS.index(number)
        neighbors = []
        for i in range(-count, count + 1):
            if i == 0:
                continue
            neighbor_idx = (idx + i) % len(WHEEL_POSITIONS)
            neighbors.append(WHEEL_POSITIONS[neighbor_idx])
        return neighbors
    except ValueError:
        return []


@app.get("/")
@app.get("")
async def root():
    """Health check endpoint"""
    return {
        "message": "Mr Markovski's Roulette API",
        "status": "running",
        "version": "1.0.0"
    }


@app.post("/spin", response_model=SpinResult)
async def spin(request: SpinRequest):
    """Process a spin with bets"""
    try:
        # Validate bets
        total_bet = sum(bet.amount for bet in request.bets)
        if total_bet > request.balance:
            raise HTTPException(status_code=400, detail="Insufficient balance")
        
        # Generate winning number using secure RNG
        rng = secrets.SystemRandom()
        winning_number = rng.choice(EUROPEAN_NUMBERS)
        winning_color = get_color(winning_number)
        
        # Calculate payouts
        total_payout = 0.0
        winning_bets = []
        
        for bet in request.bets:
            payout = calculate_payout(bet, winning_number)
            if payout > 0:
                total_payout += payout
                winning_bets.append({
                    "type": bet.type,
                    "numbers": bet.numbers,
                    "amount": bet.amount,
                    "payout": payout
                })
        
        # Update balance
        new_balance = request.balance - total_bet + total_payout
        
        return SpinResult(
            winning_number=winning_number,
            winning_color=winning_color,
            payout=total_payout,
            new_balance=new_balance,
            winning_bets=winning_bets
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.get("/numbers/{number}/neighbors")
async def get_number_neighbors(number: int, count: int = 1):
    """Get neighbors for a number"""
    if number < 0 or number > 36:
        raise HTTPException(status_code=400, detail="Invalid number")
    if count < 1 or count > 4:
        raise HTTPException(status_code=400, detail="Count must be 1-4")
    
    neighbors = get_neighbors(number, count)
    return {"number": number, "neighbors": neighbors, "count": count}


# Add global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    import traceback
    error_detail = str(exc)
    traceback_str = traceback.format_exc()
    print(f"Error: {error_detail}")
    print(f"Traceback: {traceback_str}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": error_detail
        }
    )

# Export handler for Vercel serverless function
# Mangum wraps FastAPI app for AWS Lambda/Vercel compatibility
# Note: Vercel routes /api/* to api/*.py, so routes here should NOT include /api prefix
try:
    mangum_handler = Mangum(app, lifespan="off")
    
    def handler(event, context):
        """Wrapper handler for Vercel"""
        try:
            return mangum_handler(event, context)
        except Exception as e:
            import traceback
            error_msg = str(e)
            traceback_str = traceback.format_exc()
            print(f"Handler error: {error_msg}")
            print(f"Traceback: {traceback_str}")
            return {
                "statusCode": 500,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({
                    "error": "Internal server error",
                    "detail": error_msg
                })
            }
except Exception as e:
    import traceback
    print(f"Mangum initialization error: {str(e)}")
    print(traceback.format_exc())
    
    def handler(event, context):
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({
                "error": "Handler initialization failed",
                "detail": str(e)
            })
        }

