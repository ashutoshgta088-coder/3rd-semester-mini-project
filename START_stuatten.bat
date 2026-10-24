@echo off
title stuatten - Smart Biometric Attendance System
color 0B
cls

echo.
echo  ============================================================
echo   stuatten - Smart Biometric Attendance System (AKTU)
echo  ============================================================
echo.

set "PROJECT_DIR=C:\Users\Ashutosh Gupta\OneDrive\Desktop\mp\server"

if not exist "%PROJECT_DIR%" (
    echo  ERROR: Cannot find project directory at %PROJECT_DIR%
    pause
    exit /b 1
)

cd /d "%PROJECT_DIR%"

echo  Starting server on http://localhost:5000 ...
echo.
echo   Student  ^>  2100270100001  /  studentpassword
echo   Teacher  ^>  T1001          /  teacherpassword
echo   Admin    ^>  admin          /  adminpassword123
echo.
echo  Opening web browser...
echo  Keep this command window open to keep the server active!
echo  ============================================================
echo.

start "" "C:\Users\Ashutosh Gupta\OneDrive\Desktop\stuatten.html"
start "" "http://localhost:5000"

node src/server.js

pause
