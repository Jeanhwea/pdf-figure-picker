@echo off
setlocal enabledelayedexpansion

echo Running code formatter...
echo.

:: Check if pnpm is installed
where pnpm >nul 2>&1
if errorlevel 1 (
    echo. pnpm is not installed. Please install pnpm first.
    echo.
    exit /b 1
)

:: Install dependencies if node_modules doesn't exist or pnpm-lock.yaml is newer
if not exist "node_modules" (
    echo Installing dependencies...
    call pnpm install
    echo.
) else (
    for %%F in (pnpm-lock.yaml) do set LOCK_TIME=%%~tF
    for /d %%D in (node_modules) do set NM_TIME=%%~tD
    if "!LOCK_TIME!" gtr "!NM_TIME!" (
        echo Installing dependencies...
        call pnpm install
        echo.
    )
)

:: Run formatter
echo Formatting source files with Prettier...
call pnpm format
if errorlevel 1 (
    echo. Formatting failed!
    exit /b %errorlevel%
)

echo.
echo Formatting completed!
endlocal
