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

## Resources

- [Detailed API Documentation](README-WEB.md)
- [Privacy Policy](PRIVACY.md)
- GitHub: [lewinnovation/aba-to-csv](https://github.com/lewinnovation/aba-to-csv)
