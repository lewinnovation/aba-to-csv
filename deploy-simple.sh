#!/bin/bash

# ABA to Wise - Simple Deployment Script with NVM Support
# Usage: ./deploy.sh [bucket-name]
# If no bucket name provided, it will try to get it from terraform output

set -e

# Load nvm
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
    . "$NVM_DIR/nvm.sh"
    nvm use 24
fi

# Colors
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🚀 ABA to Wise Deployment${NC}\n"

# Get bucket name
BUCKET_NAME="${1:-}"
if [ -z "$BUCKET_NAME" ] && [ -d "terraform" ]; then
    BUCKET_NAME=$(cd terraform && terraform output -raw bucket_name 2>/dev/null || echo "")
fi

if [ -z "$BUCKET_NAME" ]; then
    echo -e "${RED}❌ Error: Bucket name required${NC}"
    echo "Usage: ./deploy.sh <bucket-name>"
    exit 1
fi

# Build
echo -e "${YELLOW}📦 Building...${NC}"
npm run build > /dev/null 2>&1
echo -e "${GREEN}✓ Build complete${NC}\n"

# Deploy
echo -e "${YELLOW}📤 Uploading to gs://${BUCKET_NAME}...${NC}"
gsutil -h "Cache-Control: public, max-age=3600" cp dist/index.html "gs://${BUCKET_NAME}/" > /dev/null
gsutil -m -h "Cache-Control: public, max-age=31536000, immutable" cp -r dist/assets/ "gs://${BUCKET_NAME}/assets/" > /dev/null
[ -f "dist/robots.txt" ] && gsutil cp dist/robots.txt "gs://${BUCKET_NAME}/" > /dev/null
[ -f "dist/sitemap.xml" ] && gsutil cp dist/sitemap.xml "gs://${BUCKET_NAME}/" > /dev/null

echo -e "${GREEN}✓ Deployment complete!${NC}\n"
echo -e "${YELLOW}🌐 Live at:${NC} https://storage.googleapis.com/${BUCKET_NAME}/index.html"
