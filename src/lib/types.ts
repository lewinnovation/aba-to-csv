/**
 * Represents a single transaction record from an ABA file
 */
export interface ABATransaction {
  bsbCode: string;
  accountNumber: string;
  amount: number; // in cents
  name: string;
  paymentReference: string;
}

/**
 * Represents a row in the Wise batch payment CSV
 */
export interface WiseCSVRow {
  name: string;
  recipientEmail: string;
  paymentReference: string;
  receiverType: string;
  amountCurrency: string;
  amount: string; // formatted as decimal
  sourceCurrency: string;
  targetCurrency: string;
  bsbCode: string;
  accountNumber: string;
}

/**
 * Result of ABA file parsing
 */
export interface ParseResult {
  transactions: ABATransaction[];
  errors: string[];
}

/**
 * Result of conversion process
 */
export interface ConversionResult {
  success: boolean;
  csvContent?: string;
  filename?: string;
  error?: string;
  transactionCount?: number;
}
