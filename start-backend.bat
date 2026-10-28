@echo off
title Student Management System - Spring Boot Backend
cd /d "%~dp0backend"
echo ========================================================
echo Checking Java Environment...
echo ========================================================
where java >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Java is not installed or not in your system PATH!
    echo.
    echo Please install JDK 17 (or JDK 21) from Oracle or Eclipse Adoptium:
    echo 1. Download Java 17 x64 Installer: https://adoptium.net/temurin/releases/?version=17
    echo 2. Run the installer and check "Set JAVA_HOME variable"
    echo 3. Re-open this script to start the backend!
    echo.
    pause
    exit /b 1
)
echo Java detected! Starting Spring Boot Backend on http://localhost:8080...
call mvnw.cmd spring-boot:run
pause
