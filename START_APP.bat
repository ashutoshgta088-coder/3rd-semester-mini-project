@echo off
title Stuatten - Smart Attendance System
color 0B
cls

echo.
echo  ============================================================
echo   Stuatten - Bluetooth-Based Smart Attendance System
echo  ============================================================
echo.

:: Kill any existing process on port 5000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000 "') do (
    taskkill /PID %%a /F >nul 2>&1
)

cd /d "%~dp0server"

if not exist "node_modules\" (
    echo  First run: Installing packages, please wait...
    call npm install
    echo.
)

echo  Starting server on http://localhost:5000 ...
echo.
echo   Open your browser at: http://localhost:5000
echo.
echo   Login Credentials:
echo   Student  ^>  2100270100001  /  studentpassword
echo   Teacher  ^>  T1001          /  teacherpassword
echo   Admin    ^>  admin          /  adminpassword123
echo.
echo  Keep this window open. Press Ctrl+C to stop.
echo  ============================================================
echo.

:: Start server in background
start /B node src/server.js

:: Wait 5 seconds for server to start, then open browser
ping -n 6 127.0.0.1 >nul
start "" "http://localhost:5000"

:: Keep server running (wait here forever)
:loop
ping -n 11 127.0.0.1 >nul
goto loop
