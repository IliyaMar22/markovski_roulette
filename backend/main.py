"""
Mr Markovski's Roulette - FastAPI Backend
Handles game logic, bet validation, and payouts
"""
import secrets
from typing import Dict, List, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json

app = FastAPI(title="Mr Markovski's Roulette API")

# CORS middleware for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ],
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
ZERO = {0}

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
    "neighbor": 35,  # Same as straight for each number
    "voisins": 35,   # Same as straight
    "tiers": 35,     # Same as straight
    "orphelins": 35  # Same as straight
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


class GameState:
    def __init__(self):
        self.balance = 10000.0
        self.last_spin = None
        self.history: List[int] = []


game_state = GameState()


def get_color(number: int) -> str:
    """Get color of a number"""
    if number == 0:
        return "green"
    return "red" if number in RED_NUMBERS else "black"


def is_winning_bet(bet: Bet, winning_number: int) -> bool:
    """Check if a bet wins"""
    if winning_number in bet.numbers:
        return True
    return False


def calculate_payout(bet: Bet, winning_number: int) -> float:
    """Calculate payout for a bet"""
    if not is_winning_bet(bet, winning_number):
        return 0.0
    
    # Inside bets
    if bet.type == "straight":
        return bet.amount * (PAYOUTS["straight"] + 1)
    elif bet.type == "split":
        return bet.amount * (PAYOUTS["split"] + 1)
    elif bet.type == "street":
        return bet.amount * (PAYOUTS["street"] + 1)
    elif bet.type == "corner":
        return bet.amount * (PAYOUTS["corner"] + 1)
    elif bet.type == "line":
        return bet.amount * (PAYOUTS["line"] + 1)
    elif bet.type == "neighbor":
        return bet.amount * (PAYOUTS["neighbor"] + 1)
    
    # Outside bets
    elif bet.type == "dozen":
        return bet.amount * (PAYOUTS["dozen"] + 1)
    elif bet.type == "column":
        return bet.amount * (PAYOUTS["column"] + 1)
    elif bet.type == "red":
        return bet.amount * (PAYOUTS["red"] + 1)
    elif bet.type == "black":
        return bet.amount * (PAYOUTS["black"] + 1)
    elif bet.type == "odd":
        return bet.amount * (PAYOUTS["odd"] + 1)
    elif bet.type == "even":
        return bet.amount * (PAYOUTS["even"] + 1)
    elif bet.type == "high":
        return bet.amount * (PAYOUTS["high"] + 1)
    elif bet.type == "low":
        return bet.amount * (PAYOUTS["low"] + 1)
    
    # Call bets
    elif bet.type in ["voisins", "tiers", "orphelins"]:
        return bet.amount * (PAYOUTS[bet.type] + 1)
    
    return 0.0


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
async def root():
    return {"message": "Mr Markovski's Roulette API", "status": "running"}


@app.get("/balance")
async def get_balance():
    """Get current balance"""
    return {"balance": game_state.balance}


@app.post("/balance")
async def set_balance(balance: float):
    """Set balance (for testing/reset)"""
    game_state.balance = balance
    return {"balance": game_state.balance}


@app.post("/spin", response_model=SpinResult)
async def spin(request: SpinRequest):
    """Process a spin with bets"""
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
    
    # Update game state
    game_state.balance = new_balance
    game_state.last_spin = winning_number
    game_state.history.insert(0, winning_number)
    if len(game_state.history) > 20:
        game_state.history.pop()
    
    return SpinResult(
        winning_number=winning_number,
        winning_color=winning_color,
        payout=total_payout,
        new_balance=new_balance,
        winning_bets=winning_bets
    )


@app.get("/history")
async def get_history():
    """Get spin history"""
    return {
        "history": game_state.history,
        "last_spin": game_state.last_spin
    }


@app.get("/numbers/{number}/neighbors")
async def get_number_neighbors(number: int, count: int = 1):
    """Get neighbors for a number"""
    if number < 0 or number > 36:
        raise HTTPException(status_code=400, detail="Invalid number")
    if count < 1 or count > 4:
        raise HTTPException(status_code=400, detail="Count must be 1-4")
    
    neighbors = get_neighbors(number, count)
    return {"number": number, "neighbors": neighbors, "count": count}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates"""
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
            elif message.get("type") == "spin_request":
                # Process spin request
                bets = [Bet(**bet) for bet in message.get("bets", [])]
                request = SpinRequest(bets=bets, balance=message.get("balance", 10000))
                
                # Generate spin
                rng = secrets.SystemRandom()
                winning_number = rng.choice(EUROPEAN_NUMBERS)
                winning_color = get_color(winning_number)
                
                total_bet = sum(bet.amount for bet in bets)
                total_payout = 0.0
                winning_bets = []
                
                for bet in bets:
                    payout = calculate_payout(bet, winning_number)
                    if payout > 0:
                        total_payout += payout
                        winning_bets.append({
                            "type": bet.type,
                            "numbers": bet.numbers,
                            "amount": bet.amount,
                            "payout": payout
                        })
                
                new_balance = request.balance - total_bet + total_payout
                game_state.balance = new_balance
                game_state.last_spin = winning_number
                game_state.history.insert(0, winning_number)
                if len(game_state.history) > 20:
                    game_state.history.pop()
                
                await websocket.send_json({
                    "type": "spin_result",
                    "winning_number": winning_number,
                    "winning_color": winning_color,
                    "payout": total_payout,
                    "new_balance": new_balance,
                    "winning_bets": winning_bets
                })
    except WebSocketDisconnect:
        pass


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

