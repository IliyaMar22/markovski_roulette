"""Minimal FastAPI app for Vercel deployment smoke test."""

import json
import traceback

try:
    from fastapi import FastAPI

    app = FastAPI(title="Roulette API Diagnostic")

    @app.get("/")
    async def root():
        return {"message": "FastAPI is running on Vercel"}

    handler = app

except Exception as exc:  # pragma: no cover - diagnostic path
    error_message = f"FastAPI import or initialization failed: {exc}"
    error_trace = traceback.format_exc()

    print(error_message)
    print(error_trace)

    def handler(event, context):
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({
                "error": "FastAPI initialization failed",
                "detail": error_message,
                "traceback": error_trace,
            }),
        }

