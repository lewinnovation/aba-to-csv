# Privacy & Test Data

## Important Notes

All test data in this repository uses **fictional information** for privacy and security:

### Test Data Used
- **Names**: John Smith, Jane Doe, Bob Johnson
- **BSB Codes**: 123-456, 234-567, 345-678, 012-345
- **Account Numbers**: 11111111, 22222222, 33333333, 678901234
- **Company**: Example Company Pty Ltd

### Files Excluded from Git

The following real data files are excluded via `.gitignore`:
- `*.aba` - All ABA payroll files
- `*.csv` - All CSV output files

This ensures that no actual bank account details, BSB codes, or personal information is committed to version control.

### Production Use

When using this application:
- All processing happens **client-side** in the browser
- No data is transmitted to any server
- Files are processed in memory only
- No data is stored or logged

Your real ABA files and generated CSV files remain completely private and secure on your local machine.
