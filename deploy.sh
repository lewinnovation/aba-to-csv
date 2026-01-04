#!/bin/bash

# ABA to Wise - Deployment Script
# Builds the project and deploys to GCP Cloud Storage

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 ABA to Wise Deployment Script${NC}"
echo ""

# Get bucket name from terraform output or command line argument
BUCKET_NAME="${1:-}"

if [ -z "$BUCKET_NAME" ]; then
    # Try to get from terraform output
    if command -v terraform &> /dev/null && [ -d "terraform" ]; then
        BUCKET_NAME=$(cd terraform && terraform output -raw bucket_name 2>/dev/null || echo "")
    fi
fi

if [ -z "$BUCKET_NAME" ]; then
    echo -e "${RED}Error: Bucket name not provided${NC}"
    echo "Usage: ./deploy.sh <bucket-name>"
    echo "Or run from a directory with terraform state"
    exit 1
fi

echo -e "${YELLOW}📦 Building project...${NC}"
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}Error: dist/ directory not found. Build may have failed.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Build complete${NC}"
echo ""

# Check if gsutil is available
if ! command -v gsutil &> /dev/null; then
    echo -e "${RED}Error: gsutil not found. Please install Google Cloud SDK.${NC}"
    exit 1
fi

echo -e "${YELLOW}📤 Uploading files to gs://${BUCKET_NAME}...${NC}"
echo ""

# Upload index.html with short cache
echo "  Uploading index.html (cache: 1 hour)..."
gsutil -h "Cache-Control: public, max-age=3600" cp dist/index.html "gs://${BUCKET_NAME}/index.html"

# Upload all assets with long cache
echo "  Uploading assets (cache: 1 year, immutable)..."
gsutil -m -h "Cache-Control: public, max-age=31536000, immutable" cp -r dist/assets/ "gs://${BUCKET_NAME}/assets/"

# Upload any other files (robots.txt, sitemap.xml, etc)
if [ -f "dist/robots.txt" ]; then
    echo "  Uploading robots.txt..."
    gsutil -h "Cache-Control: public, max-age=86400" cp dist/robots.txt "gs://${BUCKET_NAME}/robots.txt"
fi

if [ -f "dist/sitemap.xml" ]; then
    echo "  Uploading sitemap.xml..."
    gsutil -h "Cache-Control: public, max-age=86400" cp dist/sitemap.xml "gs://${BUCKET_NAME}/sitemap.xml"
fi

echo ""
echo -e "${GREEN}✓ Deployment complete!${NC}"
echo ""
echo -e "${YELLOW}📍 Your site is live at:${NC}"
echo "   https://storage.googleapis.com/${BUCKET_NAME}/index.html"
echo ""
echo -e "${YELLOW}💡 Tip: Point your domain's A record to the Cloud Storage bucket${NC}"
echo "   or use the URL above directly."
echo ""
