#!/usr/bin/env python
"""
Backend server launcher for Forest Rights Authority OCR + NER Pipeline.

This script starts the FastAPI server with custom Tesseract model support.
"""

import sys
import uvicorn
from pathlib import Path


def main():
    """Start the backend server."""
    # Get the backend directory
    backend_dir = Path(__file__).parent
    
    # Print startup info
    print("\n" + "="*60)
    print("Forest Rights Authority - OCR + NER Pipeline Backend")
    print("="*60)
    print("\nStarting FastAPI server...")
    print("API Documentation: http://localhost:8000/docs")
    print("ReDoc Documentation: http://localhost:8000/redoc")
    print("\n" + "="*60 + "\n")
    
    # Start the server
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
        cwd=str(backend_dir)
    )


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nShutting down...")
        sys.exit(0)
    except Exception as e:
        print(f"\nError: {e}", file=sys.stderr)
        sys.exit(1)
