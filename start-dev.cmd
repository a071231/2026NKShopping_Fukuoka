@echo off
cd /d "%~dp0"
title 2026NKShopping Fukuoka - Development Server
echo Starting the Fukuoka travel app...
echo Keep this window open while previewing the website.
echo.
call npm.cmd run dev
echo.
echo The development server has stopped.
pause
