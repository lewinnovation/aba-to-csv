# Web Application API Documentation

The web application provides a React + TypeScript + Material-UI interface for ABA to Wise conversion in the browser.

## Features

- 🖱️ Drag-and-drop file upload
- 🎨 Modern, responsive Material-UI design
- ✅ Real-time validation and error messages
- 📱 Mobile-friendly interface
- 🔐 100% client-side processing - no data sent to server

## Deployment

### Development
```bash
npm run dev
```
Starts dev server at `http://localhost:5173/`

### Production Build
```bash
npm run build
```
Creates optimized build in `dist/` directory.

Deploy to: GitHub Pages, Vercel, Netlify, or any static host.

## API Reference

### Core Conversion Functions

#### `parseABAFile(content: string): ParseResult`
Parses ABA file content and extracts transaction records.

```typescript
const result = parseABAFile(abaContent);
// Returns: { transactions: ABATransaction[], errors: string[] }
```

#### `convertToWiseFormat(transactions: ABATransaction[]): WiseCSVRow[]`
Converts ABA transactions to Wise CSV format, excluding last transaction.

```typescript
const wiseRows = convertToWiseFormat(transactions);
// Returns: Array of CSV rows formatted for Wise
```

#### `generateCSV(rows: WiseCSVRow[]): string`
Generates CSV string from Wise format rows with proper header and escaping.

```typescript
const csv = generateCSV(wiseRows);
// Returns: CSV string with headers and properly escaped values
```

#### `convertABAToWise(file: File): Promise<ConversionResult>`
Main entry point: reads file, parses, converts, and generates CSV in one call.

```typescript
const result = await convertABAToWise(file);
if (result.success) {
  console.log(`Converted ${result.transactionCount} transactions`);
  console.log(`Filename: ${result.filename}`);
  console.log(`CSV Content: ${result.csvContent}`);
}
```

#### `downloadCSV(csvContent: string, filename: string): void`
Triggers browser download of CSV file.

```typescript
downloadCSV(csvContent, 'wise_batch.csv');
```

## Components

### FileUpload
Accepts `.aba` files with drag-and-drop or file picker.
- Max file size: 10MB
- Validates file extension

### ConversionStatus  
Shows processing state with real-time feedback.
- States: idle, processing, success, error
- Displays transaction count on success

### Footer
Branding with links to Lew Innovation and GitHub.

## SEO & Accessibility

- ✅ Meta tags for search engines
- ✅ Open Graph for social sharing
- ✅ JSON-LD structured data
- ✅ Semantic HTML
- ✅ robots.txt and sitemap.xml
- ✅ ARIA labels for accessibility

## Testing

```bash
npm test -- --run              # Run all tests
npm run test:ui                # Interactive test UI
npm run test:coverage          # Coverage report
```

All 15 tests validate the conversion logic against real ABA file samples.

## Configuration

### Vite (Frontend Build)
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: { outDir: 'dist' }
})
```

### TypeScript
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "jsx": "react-jsx",
    "strict": true
  }
}
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Modern mobile browsers

## Privacy

See [PRIVACY.md](../PRIVACY.md) for information about test data and security practices.
