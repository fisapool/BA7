@echo off
echo Installing Python dependencies...

:: Try pip first
pip install pandas==1.3.5 SQLAlchemy==1.4.46 psycopg2-binary==2.9.5 scikit-learn==1.0.2
if %errorlevel% neq 0 (
    :: If failed, try pip3
    echo Trying with pip3...
    pip3 install pandas==1.3.5 SQLAlchemy==1.4.46 psycopg2-binary==2.9.5 scikit-learn==1.0.2
)

echo.
echo Python dependencies installation complete! 