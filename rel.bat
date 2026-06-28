@echo off
setlocal enabledelayedexpansion

echo Starting release deployment...
echo.

set "APP_NAME=pdf-figure-picker"
set "DST_DIR=dist"
set "REL_DIR=..\jeanhwea.github.io\apps\%APP_NAME%"

where pnpm >nul 2>&1
if errorlevel 1 (
    echo pnpm is not installed. Please install pnpm first.
    echo.
    exit /b 1
)

if not exist "node_modules" (
    echo Installing dependencies...
    call pnpm install
    echo.
)

echo Building %APP_NAME% from source...
echo.

call pnpm build
if errorlevel 1 (
    echo Build failed for %APP_NAME%!
    exit /b %errorlevel%
)

if not exist "%DST_DIR%" (
    echo Error: Dist directory %DST_DIR% was not created!
    exit /b 1
)

echo Cleaning old release directory...
if exist "%REL_DIR%" rmdir /s /q "%REL_DIR%"

echo Copying dist to %REL_DIR%...
xcopy "%DST_DIR%" "%REL_DIR%\" /e /i /y >nul
if errorlevel 1 (
    echo Copy failed!
    exit /b 1
)

echo.
echo Release deployed to %REL_DIR%!
endlocal
