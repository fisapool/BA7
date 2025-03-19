@echo off
echo Installing client dependencies...
cd client
call npm install --save react react-dom recharts @mui/material @emotion/react @emotion/styled axios
call npm install --save-dev @types/react @types/react-dom @types/node typescript

echo.
echo Installing server dependencies...
cd ../server
call npm install --save express python-shell uuid pg dotenv
call npm install --save-dev @types/express @types/node @types/uuid @types/pg typescript ts-node nodemon

echo.
echo Installation complete! 