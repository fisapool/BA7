# PowerShell script to set up the Python virtual environment

# Create virtual environment
Write-Host "Creating Python virtual environment..." -ForegroundColor Green
python -m venv .venv

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Green
& .\.venv\Scripts\Activate.ps1

# Install requirements
Write-Host "Installing required packages..." -ForegroundColor Green
pip install -r requirements.txt

# Verify pandas installation
Write-Host "Verifying pandas installation..." -ForegroundColor Green
python -c "import pandas; print(f'pandas {pandas.__version__} successfully installed')"

Write-Host "Setup complete! Virtual environment is now active." -ForegroundColor Green
Write-Host "To activate this environment in the future, run: .\.venv\Scripts\Activate.ps1" -ForegroundColor Yellow 