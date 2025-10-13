@echo off
echo ========================================
echo QuadraX Testing Suite
echo ========================================
echo.

echo Step 1: Compiling smart contracts...
call npx hardhat compile
if %errorlevel% neq 0 (
    echo ERROR: Compilation failed
    pause
    exit /b 1
)

echo.
echo Step 2: Running tests...
call npm test
if %errorlevel% neq 0 (
    echo ERROR: Tests failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo All Tests Passed! ✓
echo ========================================
echo.
echo Your project is ready to use!
echo.
pause
