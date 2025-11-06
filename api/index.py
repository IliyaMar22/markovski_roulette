"""Minimal FastAPI app for Vercel deployment smoke test."""

from fastapi import FastAPI

app = FastAPI(title="Roulette API Diagnostic")


@app.get("/")
async def root():
    return {"message": "FastAPI is running on Vercel"}


# Export the ASGI app; Vercel detects the "app" variable automatically.
handler = app

