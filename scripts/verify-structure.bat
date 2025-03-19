@echo off
echo Verifying project structure...

:: Check key directories
if not exist client\src\components (
    echo Error: client\src\components directory is missing!
    exit /b 1
)

if not exist server\ml (
    echo Error: server\ml directory is missing!
    exit /b 1
)

if not exist shared (
    echo Error: shared directory is missing!
    exit /b 1
)

:: Check for key files
if not exist shared\schema.ts (
    echo Error: shared\schema.ts is missing!
    exit /b 1
)

if not exist client\tsconfig.json (
    echo Error: client\tsconfig.json is missing!
    exit /b 1
)

if not exist server\tsconfig.json (
    echo Error: server\tsconfig.json is missing!
    exit /b 1
)

echo Project structure verification complete!
echo.
echo You can now run:
echo   1. .\scripts\install-dependencies.bat
echo   2. .\scripts\install-python-deps.bat
echo to fully set up your development environment. 