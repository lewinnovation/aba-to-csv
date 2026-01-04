# ABA to Wise Converter

Convert ABA (Australian Banking Association) files to Wise batch payment CSV format.

🌐 **Web App** | ⌨️ **CLI** | 🧪 **Tested**

## Quick Start

### Installation
```bash
npm install
```

### CLI Usage
```bash
./run.sh                    # Process current.aba (or list available files)
./run.sh 20250101.aba       # Process specific file
npm run cli filename.aba    # Direct usage
```

### Web App
```bash
npm run dev                 # Start dev server at http://localhost:5173/
npm run build              # Build for production
```

### Testing
```bash
npm test -- --run          # Run tests
npm run test:coverage      # Coverage report
```

## Features

- **CLI Tool**: Quick command-line conversion with file listing
- **Web App**: Modern React + TypeScript + Material-UI interface
- **100% Private**: All processing happens locally (CLI) or in browser (web app)
- **Well Tested**: 15 unit tests covering conversion logic
- **TypeScript**: Type-safe codebase with shared logic between CLI and web

## How It Works

1. Reads 120-character fixed-width ABA payroll format
2. Extracts transaction details (BSB, account, amount, name, reference)
3. Converts to Wise batch payment CSV format
4. Excludes last transaction (offsetting company debit)
5. Outputs `wise_batch_[date].csv`

## Development

### Prerequisites
- Node.js 18+ ([nvm recommended](https://github.com/nvm-sh/nvm))

### Commit Standards
This project uses:
- **Husky** for git hooks (runs tests on pre-commit)
- **Commitlint** enforces [Conventional Commits](https://www.conventionalcommits.org/)

Commit format: `type(scope): description`

Example: `feat: add support for multiple files` or `fix(cli): handle empty ABA files`

### Project Structure
```
src/lib/
  └── abaConverter.ts       # Core conversion logic (shared)
src/components/             # React UI components
cli.ts                      # CLI entry point
.husky/                     # Git hooks
```

## Privacy & Security

- ✅ No data transmitted to servers
- ✅ Test data uses fictional names/accounts (see [PRIVACY.md](PRIVACY.md))
- ✅ Real ABA/CSV files gitignored
- ✅ All processing local to your machine

## Deployment

### Web App Hosting

The web app is deployed on **GCP Cloud Storage** with **Cloud CDN** for global distribution.

**Direct URL (Production)**:
```
https://storage.googleapis.com/aba-to-wise-1767511685/index.html
```

**Custom Domain via Cloudflare Worker** (Recommended):

To serve from your custom domain (e.g., `aba-to-csv.example.com`), use a **Cloudflare Worker** as a proxy:

1. **Create Cloudflare Worker**
   - Go to Cloudflare Dashboard → Workers & Pages → Create Worker
   - Name it `aba-to-wise-proxy`

2. **Add This Code**:
   ```javascript
   export default {
     async fetch(request) {
       const url = new URL(request.url);
       let path = url.pathname;
       
       // If root path, serve index.html
       if (path === '/' || path === '') {
         path = '/index.html';
       }
       
       // Construct the GCS URL
       const gcsUrl = `https://storage.googleapis.com/aba-to-wise-1767511685${path}`;
       
       try {
         const response = await fetch(gcsUrl);
         
         if (response.status === 404) {
           // SPA fallback: if not found, serve index.html
           const indexResponse = await fetch('https://storage.googleapis.com/aba-to-wise-1767511685/index.html');
           return new Response(indexResponse.body, {
             status: indexResponse.status,
             headers: {
               ...Object.fromEntries(indexResponse.headers),
               'Cache-Control': 'public, max-age=3600',
             },
           });
         }
         
         return new Response(response.body, {
           status: response.status,
           headers: {
             ...Object.fromEntries(response.headers),
             'Cache-Control': 'public, max-age=3600',
           },
         });
       } catch (error) {
         return new Response(`Error: ${error.message}`, { status: 500 });
       }
     },
   };
   ```

3. **Deploy Worker**
   - Click Save and Deploy

4. **Attach Custom Domain**
   - Go to Worker Settings → Custom Domains
   - Add your domain (e.g., `aba-to-csv.example.com`)
   - Cloudflare automatically provisions SSL certificate

5. **Verify**
   ```bash
   curl -I https://aba-to-csv.example.com
   # Should return 200 OK
   ```

## Resources

- [Detailed API Documentation](README-WEB.md)
- [Privacy Policy](PRIVACY.md)
- GitHub: [lewinnovation/aba-to-csv](https://github.com/lewinnovation/aba-to-csv)
