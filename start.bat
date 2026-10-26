@echo off
cd /d "%~dp0"

if not exist node_modules (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 goto fail
)

echo Starting the blog at http://localhost:5173/blog/
echo Edits to src\ and src\posts\ reload the page automatically. Close this window to stop.
call npm run dev -- --open /blog/
goto end

:fail
echo.
echo npm install failed. Check that Node.js is installed: https://nodejs.org

:end
pause
