# Contributing to FreeVerse Video Studio

Thank you for your interest in contributing to FreeVerse Video Studio! We welcome developers, designers, and video creators from around the world.

## Development Setup

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- FFmpeg (automatically installed via `imageio-ffmpeg` or available on system PATH)

### Quick Start
1. Fork and clone the repository:
   ```bash
   git clone https://github.com/Yogesh-Badigineni/freeverse-video-studio.git
   cd freeverse-video-studio
   ```
2. Install Backend Dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
3. Install Frontend Dependencies:
   ```bash
   cd ../frontend
   npm install
   ```
4. Run Backend:
   ```bash
   cd ../backend
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
   ```
5. Run Frontend:
   ```bash
   cd ../frontend
   npm run dev
   ```

## Running Tests
- Backend test suite:
  ```bash
  cd backend
  pytest tests/
  ```
- Security scan:
  ```bash
  bandit -r app/ -ll
  ```
- Frontend build check:
  ```bash
  cd frontend
  npm run build
  ```

## Pull Request Guidelines
1. Ensure all tests pass.
2. Maintain zero external paid API dependencies.
3. Keep code modular and well-documented.
4. Follow the existing design aesthetics (dark glassmorphism, modern typography).
