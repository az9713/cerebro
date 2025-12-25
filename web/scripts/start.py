#!/usr/bin/env python3
"""
Cerebro Web Application Startup Script

Starts both FastAPI backend and Next.js frontend.
Usage: python web/scripts/start.py
"""

import subprocess
import sys
import os
import signal
from pathlib import Path

# Paths
SCRIPT_DIR = Path(__file__).parent
WEB_DIR = SCRIPT_DIR.parent
BACKEND_DIR = WEB_DIR / "backend"
FRONTEND_DIR = WEB_DIR / "frontend"

# Process handles
processes = []


def check_python_deps():
    """Check and install Python dependencies."""
    requirements = BACKEND_DIR / "requirements.txt"

    try:
        import fastapi
        import uvicorn
        import aiosqlite
    except ImportError:
        print("Installing Python dependencies...")
        subprocess.run(
            [sys.executable, "-m", "pip", "install", "-r", str(requirements)],
            check=True
        )


def check_node_deps():
    """Check and install Node.js dependencies."""
    node_modules = FRONTEND_DIR / "node_modules"

    # Check if Node.js is available
    result = subprocess.run(["node", "--version"], capture_output=True)
    if result.returncode != 0:
        print("ERROR: Node.js not found. Please install Node.js 18+")
        sys.exit(1)

    # Install dependencies if needed
    if not node_modules.exists():
        print("Installing frontend dependencies...")
        subprocess.run(
            ["npm", "install"],
            cwd=str(FRONTEND_DIR),
            check=True,
            shell=True  # Required on Windows
        )


def start_backend():
    """Start FastAPI backend."""
    print("Starting backend...")

    # Use shell=True on Windows for proper command execution
    if sys.platform == "win32":
        cmd = f'"{sys.executable}" -m uvicorn main:app --reload --port 8000'
        process = subprocess.Popen(
            cmd,
            cwd=str(BACKEND_DIR),
            shell=True
        )
    else:
        process = subprocess.Popen(
            [sys.executable, "-m", "uvicorn", "main:app", "--reload", "--port", "8000"],
            cwd=str(BACKEND_DIR)
        )

    processes.append(process)
    return process


def start_frontend():
    """Start Next.js frontend."""
    print("Starting frontend...")

    if sys.platform == "win32":
        process = subprocess.Popen(
            "npm run dev",
            cwd=str(FRONTEND_DIR),
            shell=True
        )
    else:
        process = subprocess.Popen(
            ["npm", "run", "dev"],
            cwd=str(FRONTEND_DIR)
        )

    processes.append(process)
    return process


def shutdown(sig=None, frame=None):
    """Graceful shutdown."""
    print("\nShutting down...")

    for process in processes:
        try:
            process.terminate()
            process.wait(timeout=5)
        except Exception:
            process.kill()

    sys.exit(0)


def main():
    """Main entry point."""
    print("=" * 50)
    print("Cerebro Web Application")
    print("=" * 50)

    # Check prerequisites
    print("\nChecking prerequisites...")
    check_python_deps()
    check_node_deps()
    print("Prerequisites OK\n")

    # Register shutdown handler
    signal.signal(signal.SIGINT, shutdown)
    if hasattr(signal, 'SIGTERM'):
        signal.signal(signal.SIGTERM, shutdown)

    # Start services
    backend = start_backend()
    frontend = start_frontend()

    print("\n" + "=" * 50)
    print("Cerebro is running!")
    print("=" * 50)
    print(f"Frontend: http://localhost:3000")
    print(f"Backend:  http://localhost:8000")
    print(f"API Docs: http://localhost:8000/docs")
    print("=" * 50)
    print("Press Ctrl+C to stop\n")

    # Wait for processes
    try:
        backend.wait()
        frontend.wait()
    except KeyboardInterrupt:
        shutdown()


if __name__ == "__main__":
    main()
