@echo off
setlocal

:: Get remote URL and extract repo path (works for both HTTPS and SSH)
for /f "delims=" %%i in ('git remote get-url origin 2^>nul') do set REMOTE_URL=%%i

:: Strip HTTPS prefix
set REPO_PATH=%REMOTE_URL:https://github.com/=%

:: Strip SSH prefix
set REPO_PATH=%REPO_PATH:git@github.com:=%

:: Strip trailing .git if present
if "%REPO_PATH:~-4%"==".git" set REPO_PATH=%REPO_PATH:~0,-4%

:: Extract repo name
for /f "tokens=2 delims=/" %%i in ("%REPO_PATH%") do set REPO_NAME=%%i

set ACTIONS_URL=https://github.com/%REPO_PATH%/actions

echo.
echo ========================================
echo   🚀 Deploying %REPO_NAME% to GitHub
echo ========================================
echo.

:: Fetch remote state without merging
echo Checking remote for updates...
git fetch origin >nul 2>&1

:: Count commits remote has that local doesn't
for /f %%i in ('git rev-list HEAD..origin/main --count 2^>nul') do set REMOTE_AHEAD=%%i

:: Count commits local has that remote doesn't
for /f %%i in ('git rev-list origin/main..HEAD --count 2^>nul') do set LOCAL_AHEAD=%%i

if not defined REMOTE_AHEAD set REMOTE_AHEAD=0
if not defined LOCAL_AHEAD set LOCAL_AHEAD=0

:: If remote has new commits, pull first
if %REMOTE_AHEAD% gtr 0 (
    echo Remote has %REMOTE_AHEAD% new commit(s^). Pulling first...
    git pull origin main
    if %ERRORLEVEL% neq 0 (
        echo.
        echo ========================================
        echo   ❌ Pull failed. Resolve conflicts manually.
        echo ========================================
        echo.
        pause
        exit /b 1
    )
    echo Pull successful.
    echo.
)

:: Clean up ignored files from tracking
echo Cleaning up ignored files from tracking...
git rm -r --cached . >nul 2>&1

:: Stage all local changes
echo Staging local changes...
git add -A

:: Check if there is anything to commit
git diff --cached --quiet
if %ERRORLEVEL% equ 0 (
    if %LOCAL_AHEAD% equ 0 (
        echo.
        echo ========================================
        echo   ✅ Already in sync. Nothing to deploy.
        echo ========================================
        echo.
        pause
        exit /b 0
    )
    :: Local is ahead but nothing new staged — just push
    goto :push
)

:: Generate AI commit message using Gemini CLI
echo Generating AI commit message...
for /f "delims=" %%i in ('git diff --cached --stat 2^>nul ^| gemini -p "Write a concise Git commit message (max 72 chars, imperative tone) summarizing these file changes. Return only the commit message text, no quotes, no explanation, nothing else:"') do (
    if not defined AI_COMMIT set AI_COMMIT=%%i
)

:: Fallback if Gemini is unavailable or returns nothing
if not defined AI_COMMIT (
    echo Gemini unavailable. Using fallback commit message.
    set AI_COMMIT=%REPO_NAME% update: %date% %time%
)

echo Commit: %AI_COMMIT%
echo.
git commit -m "%AI_COMMIT%"

:push
:: Push to remote
echo Pushing to GitHub...
git push origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo ========================================
    echo   ✅ Success! %REPO_NAME% is live.
    echo   Commit: %AI_COMMIT%
    echo   Check %ACTIONS_URL%
    echo ========================================
) else (
    echo.
    echo ========================================
    echo   ❌ Push failed. Check your connection
    echo   or branch permissions.
    echo ========================================
)

echo.
pause