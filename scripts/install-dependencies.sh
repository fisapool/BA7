#!/bin/bash
# Install client dependencies
cd client
npm install --save react react-dom recharts @mui/material @emotion/react @emotion/styled
npm install --save-dev @types/react @types/react-dom @types/node

# Install server dependencies
cd ../server
npm install --save express python-shell uuid
npm install --save-dev @types/express @types/node @types/uuid 