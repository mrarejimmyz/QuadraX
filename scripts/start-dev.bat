@echo off
echo ========================================
echo QuadraX Development Server
echo ========================================
echo.

echo Starting Next.js development server...
echo The app will be available at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

cd frontend
call npm run dev
