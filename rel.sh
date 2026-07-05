#!/usr/bin/env bash
set -euo pipefail

echo "Starting release deployment..."
echo ""

APP_NAME="pdf-figure-picker"
DST_DIR="dist"
REL_DIR="../jeanhwea.github.io/apps/${APP_NAME}"

if ! command -v pnpm &>/dev/null; then
    echo "pnpm is not installed. Please install pnpm first."
    echo ""
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    pnpm install
    echo ""
fi

echo "Building ${APP_NAME} from source..."
echo ""

pnpm build

if [ ! -d "${DST_DIR}" ]; then
    echo "Error: Dist directory ${DST_DIR} was not created!"
    exit 1
fi

echo "Cleaning old release directory..."
rm -rf "${REL_DIR}"

echo "Copying dist to ${REL_DIR}..."
cp -r "${DST_DIR}" "${REL_DIR}"

echo ""
echo "Release deployed to ${REL_DIR}!"
