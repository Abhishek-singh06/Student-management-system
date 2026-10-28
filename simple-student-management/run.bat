@echo off
title Student Management System (Python Flask + SQLite)
cd /d "%~dp0"

echo ======================================================================
echo          Student Management System - DBMS College Project
echo ======================================================================
echo.

:: 1. Check Python installation
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not added to your system PATH!
    echo Please install Python from https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation.
    echo.
    pause
    exit /b 1
)

echo [1/3] Python detected successfully.

:: 2. Check / Create Virtual Environment
if not exist "venv\Scripts\activate.bat" (
    echo [2/3] Creating Python virtual environment (venv)...
    python -m venv venv
    if %errorlevel% neq 0 (
        echo [WARNING] Failed to create virtual environment. Using global Python.
        set "PY_EXEC=python"
    ) else (
        set "PY_EXEC=venv\Scripts\python.exe"
    )
) else (
    echo [2/3] Virtual environment found.
    set "PY_EXEC=venv\Scripts\python.exe"
)

:: 3. Install Flask if not present
echo [3/3] Checking dependencies (Flask)...
%PY_EXEC% -c "import flask" >nul 2>nul
if %errorlevel% neq 0 (
    echo Installing Flask from requirements.txt...
    %PY_EXEC% -m pip install -r requirements.txt
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install Flask dependencies.
        pause
        exit /b 1
    )
)

echo.
echo ======================================================================
echo   Server URL : http://127.0.0.1:5000
echo   Database   : students.db (Persistent SQLite)
echo   Press CTRL+C in this terminal window to stop the application.
echo ======================================================================
echo.

:: Automatically open browser after 2 seconds in background
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://127.0.0.1:5000"

:: Start Flask App
%PY_EXEC% app.py
pause
