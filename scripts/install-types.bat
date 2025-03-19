@echo off
echo Installing type definitions...
cd server
call npm install --save-dev @types/node @types/express @types/uuid
cd ../client
call npm install --save-dev @types/react @types/react-dom
echo Type definitions installed! 