@echo off
echo ========================================
echo QuadraX Project Setup
echo ========================================
echo.

echo Step 1: Verifying Node.js installation...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found!
    echo Please make sure Node.js is installed and in your PATH.
    pause
    exit /b 1
)

npm --version
if %errorlevel% neq 0 (
    echo ERROR: npm not found!
    pause
    exit /b 1
)

echo.
echo Node.js is installed! ✓
echo.

echo Step 2: Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install root dependencies
    pause
    exit /b 1
)

echo.
echo Step 3: Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo Step 4: Running verification script...
node verify-setup.js

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo   1. Run tests:          npm test
echo   2. Compile contracts:  npx hardhat compile
echo   3. Start local node:   npx hardhat node
echo   4. Deploy contracts:   npx hardhat run scripts/deploy.js --network localhost
echo   5. Start frontend:     cd frontend ^&^& npm run dev
echo.
pause
