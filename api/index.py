"""
Mr Markovski's Roulette - FastAPI Backend for Vercel Serverless
Uses BaseHTTPRequestHandler format that Vercel expects
"""
import secrets
import traceback
import json
from typing import Dict, List, Optional
from http.server import BaseHTTPRequestHandler

try:
    from fastapi import FastAPI, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse
    from pydantic import BaseModel, ValidationError
    from mangum import Mangum
    import asyncio
    
    # Initialize FastAPI app
    app = FastAPI(title="Mr Markovski's Roulette API")
    print("✅ FastAPI and dependencies imported successfully")
    
    # CORS middleware - allow all origins for Vercel deployment
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
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
            error_trace = traceback.format_exc()
            print(f"Error in /spin endpoint: {type(e).__name__}: {str(e)}")
            print(f"Traceback:\n{error_trace}")
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
    
    # Create Mangum adapter
    try:
        mangum_handler = Mangum(app)
        print("✅ Mangum handler initialized successfully")
    except Exception as e:
        error_msg = f"Mangum initialization failed: {str(e)}"
        error_trace = traceback.format_exc()
        print(f"❌ {error_msg}")
        print(f"Traceback:\n{error_trace}")
        mangum_handler = None
    
except Exception as e:
    # If imports fail, set up fallback
    error_msg = f"Import failed: {str(e)}"
    error_trace = traceback.format_exc()
    print(f"❌ {error_msg}")
    print(f"Traceback:\n{error_trace}")
    app = None
    mangum_handler = None


class handler(BaseHTTPRequestHandler):
    """Vercel Python runtime handler that bridges to FastAPI via Mangum"""
    
    def do_GET(self):
        self._handle_request()
    
    def do_POST(self):
        self._handle_request()
    
    def do_PUT(self):
        self._handle_request()
    
    def do_DELETE(self):
        self._handle_request()
    
    def do_OPTIONS(self):
        self._handle_request()
    
    def _handle_request(self):
        """Handle all HTTP methods by converting to ASGI and calling Mangum"""
        try:
            if mangum_handler is None or app is None:
                self._send_error_response(500, "FastAPI app not initialized")
                return
            
            # Convert BaseHTTPRequestHandler request to ASGI event
            path = self.path.split('?')[0]  # Remove query string
            method = self.command
            
            # Read request body
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length) if content_length > 0 else b''
            
            # Build ASGI event
            event = {
                "httpMethod": method,
                "path": path,
                "headers": {k.lower(): v for k, v in self.headers.items()},
                "body": body.decode('utf-8') if body else '',
                "isBase64Encoded": False,
                "queryStringParameters": self._parse_query_string(),
                "requestContext": {
                    "path": path,
                    "httpMethod": method,
                }
            }
            
            # Call Mangum handler
            context = {}  # Lambda context (not used by Mangum)
            response = mangum_handler(event, context)
            
            # Send response
            status_code = response.get('statusCode', 500)
            headers = response.get('headers', {})
            body = response.get('body', '')
            
            self.send_response(status_code)
            for key, value in headers.items():
                self.send_header(key, value)
            self.end_headers()
            
            if body:
                self.wfile.write(body.encode('utf-8') if isinstance(body, str) else body)
                
        except Exception as e:
            error_trace = traceback.format_exc()
            print(f"Error in handler: {type(e).__name__}: {str(e)}")
            print(f"Traceback:\n{error_trace}")
            self._send_error_response(500, f"Handler error: {str(e)}")
    
    def _parse_query_string(self):
        """Parse query string from path"""
        if '?' not in self.path:
            return None
        query_string = self.path.split('?')[1]
        params = {}
        for param in query_string.split('&'):
            if '=' in param:
                key, value = param.split('=', 1)
                params[key] = value
        return params if params else None
    
    def _send_error_response(self, status_code, message):
        """Send error response"""
        error_body = json.dumps({
            "error": {
                "code": str(status_code),
                "message": message
            }
        })
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(error_body)))
        self.end_headers()
        self.wfile.write(error_body.encode('utf-8'))
    
    def log_message(self, format, *args):
        """Override to use print instead of stderr"""
        print(f"{args[0]} - {args[1]}")
