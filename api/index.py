"""
Temporary minimal handler to diagnose Vercel deployment issues.
"""

import json


def handler(event, context):
    """Simple diagnostic handler to verify serverless execution."""
    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps({
            "message": "Python serverless function is running",
            "event": event,
        })
    }

