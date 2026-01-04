import type { ABATransaction, WiseCSVRow, ParseResult, ConversionResult } from './types';

/**
 * Parse an ABA file content and extract transaction records
 * @param abaContent - The raw ABA file content as a string
 * @returns ParseResult containing transactions and any errors
 */
export function parseABAFile(abaContent: string): ParseResult {
  const lines = abaContent.split('\n');
  const transactions: ABATransaction[] = [];
  const errors: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip empty lines
    if (!line || line.trim().length === 0) {
      continue;
    }

    // Check line length (ABA format is 120 characters)
    if (line.length < 120) {
      errors.push(`Line ${i + 1}: Invalid line length (${line.length}, expected 120)`);
      continue;
    }

    const recordType = line.charAt(0);

    // Process only detail records (type '1')
    if (recordType === '1') {
      try {
        const transaction = parseDetailRecord(line);
        transactions.push(transaction);
      } catch (error) {
        errors.push(`Line ${i + 1}: ${error instanceof Error ? error.message : 'Failed to parse'}`);
      }
    }
    // Skip header (type '0') and trailer (type '7') records
  }

  return { transactions, errors };
}

/**
 * Parse a detail record (type 1) from an ABA file line
 * @param line - A 120-character ABA detail record line
 * @returns ABATransaction object
 */
function parseDetailRecord(line: string): ABATransaction {
  // Extract fields based on fixed positions (0-indexed)
  // Positions 1-7 (0-indexed: 1-7) = BSB code
  const bsbCode = line.substring(1, 8).trim();
  
  // Positions 8-16 (0-indexed: 8-17) = Account number
  const accountNumber = line.substring(8, 17).trim();
  
  // Positions 20-29 (0-indexed: 20-30) = Amount in cents
  const amountStr = line.substring(20, 30).trim();
  const amount = parseInt(amountStr, 10);
  
  if (isNaN(amount)) {
    throw new Error(`Invalid amount: ${amountStr}`);
  }
  
  // Positions 30-61 (0-indexed: 30-62) = Account name
  const name = line.substring(30, 62).trim();
  
  // Positions 62-79 (0-indexed: 62-80) = Payment reference
  const paymentReference = line.substring(62, 80).trim();

  return {
    bsbCode,
    accountNumber,
    amount,
    name,
    paymentReference,
  };
}

/**
 * Convert ABA transactions to Wise CSV format
 * Excludes the last transaction (typically the offsetting debit)
 * @param transactions - Array of ABA transactions
 * @returns Array of Wise CSV rows
 */
export function convertToWiseFormat(transactions: ABATransaction[]): WiseCSVRow[] {
  // Exclude the last transaction (offsetting debit from company account)
  const transactionsToConvert = transactions.slice(0, -1);

  return transactionsToConvert.map((tx) => ({
    name: tx.name,
    recipientEmail: '', // Not available in ABA format
    paymentReference: tx.paymentReference,
    receiverType: 'PERSON',
    amountCurrency: 'source',
    amount: (tx.amount / 100).toFixed(2), // Convert cents to dollars
    sourceCurrency: 'AUD',
    targetCurrency: 'AUD',
    bsbCode: tx.bsbCode,
    accountNumber: tx.accountNumber,
  }));
}

/**
 * Generate CSV content from Wise CSV rows
 * @param rows - Array of Wise CSV rows
 * @returns CSV string with headers
 */
export function generateCSV(rows: WiseCSVRow[]): string {
  const headers = [
    'name',
    'recipientEmail',
    'paymentReference',
    'receiverType',
    'amountCurrency',
    'amount',
    'sourceCurrency',
    'targetCurrency',
    'bsbCode',
    'accountNumber',
  ];

  const csvLines = [headers.join(',')];

  for (const row of rows) {
    const values = [
      escapeCSVValue(row.name),
      escapeCSVValue(row.recipientEmail),
      escapeCSVValue(row.paymentReference),
      escapeCSVValue(row.receiverType),
      escapeCSVValue(row.amountCurrency),
      escapeCSVValue(row.amount),
      escapeCSVValue(row.sourceCurrency),
      escapeCSVValue(row.targetCurrency),
      escapeCSVValue(row.bsbCode),
      escapeCSVValue(row.accountNumber),
    ];
    csvLines.push(values.join(','));
  }

  return csvLines.join('\n');
}

/**
 * Escape a CSV value (wrap in quotes if needed)
 * @param value - The value to escape
 * @returns Escaped CSV value
 */
function escapeCSVValue(value: string): string {
  // If value contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Extract filename from ABA content (from header record)
 * @param abaContent - The raw ABA file content
 * @returns Suggested filename or default
 */
export function extractFilename(abaContent: string): string {
  const lines = abaContent.split('\n');
  
  // Look for header record (type '0')
  for (const line of lines) {
    if (line.charAt(0) === '0' && line.length >= 80) {
      // Extract description from positions 62-79 (0-indexed: 62-80)
      // This typically contains date/description like "Payroll31Jan020126"
      const description = line.substring(62, 80).trim();
      if (description) {
        return `wise_batch_${description}.csv`;
      }
    }
  }
  
  return 'wise_batch.csv';
}

/**
 * Main conversion function: ABA file to Wise CSV
 * @param file - The uploaded ABA file
 * @returns Promise resolving to ConversionResult
 */
export async function convertABAToWise(file: File): Promise<ConversionResult> {
  try {
    // Read file content
    const content = await file.text();

    // Parse ABA file
    const parseResult = parseABAFile(content);

    if (parseResult.errors.length > 0) {
      return {
        success: false,
        error: `Parsing errors:\n${parseResult.errors.join('\n')}`,
      };
    }

    if (parseResult.transactions.length === 0) {
      return {
        success: false,
        error: 'No transactions found in ABA file',
      };
    }

    // Convert to Wise format (excludes last transaction)
    const wiseRows = convertToWiseFormat(parseResult.transactions);

    if (wiseRows.length === 0) {
      return {
        success: false,
        error: 'No valid transactions to convert (file may only contain offsetting transaction)',
      };
    }

    // Generate CSV content
    const csvContent = generateCSV(wiseRows);

    // Extract filename from ABA content or use default
    const filename = extractFilename(content);

    return {
      success: true,
      csvContent,
      filename,
      transactionCount: wiseRows.length,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Trigger download of CSV file in browser
 * @param csvContent - The CSV content to download
 * @param filename - The filename for the download
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
