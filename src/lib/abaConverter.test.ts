import { describe, it, expect } from 'vitest';
import {
  parseABAFile,
  convertToWiseFormat,
  generateCSV,
  extractFilename,
} from './abaConverter';
import type { ABATransaction } from './types';

describe('parseABAFile', () => {
  it('should parse a valid ABA file with multiple transactions', () => {
    const abaContent = `0                 01NAB       Example Company Pty Ltd   000000Payroll31Jan020126                                        
1123-456 11111111 530000028600John Smith                      Bank A            012-345678901234Example Company 00000000
1234-567 22222222 530000134000Jane Doe                        Bank B            012-345678901234Example Company 00000000
1345-678 33333333 530001134866Bob Johnson                     Bank C            012-345678901234Example Company 00000000
1012-345678901234 130001297466Example Company Pty Ltd         SALARIES AND WAGES012-345678901234Example Company 00000000
7999-999            000000000000012974660001297466                        000004                                        `;

    const result = parseABAFile(abaContent);

    expect(result.errors).toHaveLength(0);
    expect(result.transactions).toHaveLength(4);
    
    // Check first transaction
    expect(result.transactions[0]).toEqual({
      bsbCode: '123-456',
      accountNumber: '11111111',
      amount: 28600,
      name: 'John Smith',
      paymentReference: 'Bank A',
    });

    // Check second transaction
    expect(result.transactions[1]).toEqual({
      bsbCode: '234-567',
      accountNumber: '22222222',
      amount: 134000,
      name: 'Jane Doe',
      paymentReference: 'Bank B',
    });

    // Check third transaction
    expect(result.transactions[2]).toEqual({
      bsbCode: '345-678',
      accountNumber: '33333333',
      amount: 1134866,
      name: 'Bob Johnson',
      paymentReference: 'Bank C',
    });

    // Check fourth transaction (offsetting debit)
    expect(result.transactions[3]).toEqual({
      bsbCode: '012-345',
      accountNumber: '678901234',
      amount: 1297466,
      name: 'Example Company Pty Ltd',
      paymentReference: 'SALARIES AND WAGES',
    });
  });

  it('should skip header and trailer records', () => {
    const abaContent = `0                 01NAB       Example Company Pty Ltd   000000Payroll31Jan020126                                        
1123-456 11111111 530000028600John Smith                      Bank A            012-345678901234Example Company 00000000
7999-999            000000000000012974660001297466                        000004                                        `;

    const result = parseABAFile(abaContent);

    expect(result.errors).toHaveLength(0);
    expect(result.transactions).toHaveLength(1);
  });

  it('should handle empty lines', () => {
    const abaContent = `0                 01NAB       Example Company Pty Ltd   000000Payroll31Jan020126                                        

1123-456 11111111 530000028600John Smith                      Bank A            012-345678901234Example Company 00000000

7999-999            000000000000012974660001297466                        000004                                        `;

    const result = parseABAFile(abaContent);

    expect(result.errors).toHaveLength(0);
    expect(result.transactions).toHaveLength(1);
  });

  it('should report error for invalid line length', () => {
    const abaContent = `0                 01NAB       Example Company Pty Ltd
1123-456 11111111 530000028600John Smith                      Bank A            012-345678901234Example Company 00000000`;

    const result = parseABAFile(abaContent);

    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('Invalid line length');
  });

  it('should handle empty content', () => {
    const result = parseABAFile('');

    expect(result.errors).toHaveLength(0);
    expect(result.transactions).toHaveLength(0);
  });
});

describe('convertToWiseFormat', () => {
  it('should convert ABA transactions to Wise format and exclude last transaction', () => {
    const transactions: ABATransaction[] = [
      {
        bsbCode: '123-456',
        accountNumber: '11111111',
        amount: 28600,
        name: 'John Smith',
        paymentReference: 'Bank A',
      },
      {
        bsbCode: '234-567',
        accountNumber: '22222222',
        amount: 134000,
        name: 'Jane Doe',
        paymentReference: 'Bank B',
      },
      {
        bsbCode: '345-678',
        accountNumber: '33333333',
        amount: 1134866,
        name: 'Bob Johnson',
        paymentReference: 'Bank C',
      },
      {
        bsbCode: '012-345',
        accountNumber: '678901234',
        amount: 1297466,
        name: 'Example Company Pty Ltd',
        paymentReference: 'SALARIES AND WAGES',
      },
    ];

    const wiseRows = convertToWiseFormat(transactions);

    // Should exclude the last transaction (offsetting debit)
    expect(wiseRows).toHaveLength(3);

    // Check first row
    expect(wiseRows[0]).toEqual({
      name: 'John Smith',
      recipientEmail: '',
      paymentReference: 'Bank A',
      receiverType: 'PERSON',
      amountCurrency: 'source',
      amount: '286.00',
      sourceCurrency: 'AUD',
      targetCurrency: 'AUD',
      bsbCode: '123-456',
      accountNumber: '11111111',
    });

    // Check second row
    expect(wiseRows[1]).toEqual({
      name: 'Jane Doe',
      recipientEmail: '',
      paymentReference: 'Bank B',
      receiverType: 'PERSON',
      amountCurrency: 'source',
      amount: '1340.00',
      sourceCurrency: 'AUD',
      targetCurrency: 'AUD',
      bsbCode: '234-567',
      accountNumber: '22222222',
    });

    // Check third row
    expect(wiseRows[2]).toEqual({
      name: 'Bob Johnson',
      recipientEmail: '',
      paymentReference: 'Bank C',
      receiverType: 'PERSON',
      amountCurrency: 'source',
      amount: '11348.66',
      sourceCurrency: 'AUD',
      targetCurrency: 'AUD',
      bsbCode: '345-678',
      accountNumber: '33333333',
    });
  });

  it('should handle single transaction correctly', () => {
    const transactions: ABATransaction[] = [
      {
        bsbCode: '123-456',
        accountNumber: '11111111',
        amount: 28600,
        name: 'John Smith',
        paymentReference: 'Bank A',
      },
    ];

    const wiseRows = convertToWiseFormat(transactions);

    // Should return empty array since last transaction is excluded
    expect(wiseRows).toHaveLength(0);
  });

  it('should properly format amounts with cents', () => {
    const transactions: ABATransaction[] = [
      {
        bsbCode: '123-456',
        accountNumber: '11111111',
        amount: 12345,
        name: 'Test Person',
        paymentReference: 'Test',
      },
      {
        bsbCode: '012-345',
        accountNumber: '678901234',
        amount: 12345,
        name: 'Company',
        paymentReference: 'Offset',
      },
    ];

    const wiseRows = convertToWiseFormat(transactions);

    expect(wiseRows[0].amount).toBe('123.45');
  });
});

describe('generateCSV', () => {
  it('should generate CSV with proper headers and values', () => {
    const wiseRows = [
      {
        name: 'John Smith',
        recipientEmail: '',
        paymentReference: 'Bank A',
        receiverType: 'PERSON',
        amountCurrency: 'source',
        amount: '286.00',
        sourceCurrency: 'AUD',
        targetCurrency: 'AUD',
        bsbCode: '123-456',
        accountNumber: '11111111',
      },
      {
        name: 'Jane Doe',
        recipientEmail: '',
        paymentReference: 'Bank B',
        receiverType: 'PERSON',
        amountCurrency: 'source',
        amount: '1340.00',
        sourceCurrency: 'AUD',
        targetCurrency: 'AUD',
        bsbCode: '234-567',
        accountNumber: '22222222',
      },
    ];

    const csv = generateCSV(wiseRows);

    const expectedCSV = `name,recipientEmail,paymentReference,receiverType,amountCurrency,amount,sourceCurrency,targetCurrency,bsbCode,accountNumber
John Smith,,Bank A,PERSON,source,286.00,AUD,AUD,123-456,11111111
Jane Doe,,Bank B,PERSON,source,1340.00,AUD,AUD,234-567,22222222`;

    expect(csv).toBe(expectedCSV);
  });

  it('should escape CSV values containing commas', () => {
    const wiseRows = [
      {
        name: 'Doe, John',
        recipientEmail: '',
        paymentReference: 'Test, Payment',
        receiverType: 'PERSON',
        amountCurrency: 'source',
        amount: '100.00',
        sourceCurrency: 'AUD',
        targetCurrency: 'AUD',
        bsbCode: '123-456',
        accountNumber: '12345678',
      },
    ];

    const csv = generateCSV(wiseRows);

    expect(csv).toContain('"Doe, John"');
    expect(csv).toContain('"Test, Payment"');
  });

  it('should handle empty rows array', () => {
    const csv = generateCSV([]);

    expect(csv).toBe('name,recipientEmail,paymentReference,receiverType,amountCurrency,amount,sourceCurrency,targetCurrency,bsbCode,accountNumber');
  });
});

describe('extractFilename', () => {
  it('should extract filename from ABA header', () => {
    const abaContent = `0                 01NAB       Example Company Pty Ltd   000000Payroll31Jan020126                                        
1123-456 11111111 530000028600John Smith                      Bank A            012-345678901234Example Company 00000000`;

    const filename = extractFilename(abaContent);

    expect(filename).toContain('020126');
  });

  it('should return default filename if no header found', () => {
    const abaContent = `1123-456 11111111 530000028600John Smith                      Bank A            012-345678901234Example Company 00000000`;

    const filename = extractFilename(abaContent);

    expect(filename).toBe('wise_batch.csv');
  });

  it('should return default filename for empty content', () => {
    const filename = extractFilename('');

    expect(filename).toBe('wise_batch.csv');
  });
});

describe('Full integration test', () => {
  it('should match expected output from sample ABA file', () => {
    const abaContent = `0                 01NAB       Example Company Pty Ltd   000000Payroll31Jan020126                                        
1123-456 11111111 530000028600John Smith                      Bank A            012-345678901234Example Company 00000000
1234-567 22222222 530000134000Jane Doe                        Bank B            012-345678901234Example Company 00000000
1345-678 33333333 530001134866Bob Johnson                     Bank C            012-345678901234Example Company 00000000
1012-345678901234 130001297466Example Company Pty Ltd         SALARIES AND WAGES012-345678901234Example Company 00000000
7999-999            000000000000012974660001297466                        000004                                        `;

    const expectedCSV = `name,recipientEmail,paymentReference,receiverType,amountCurrency,amount,sourceCurrency,targetCurrency,bsbCode,accountNumber
John Smith,,Bank A,PERSON,source,286.00,AUD,AUD,123-456,11111111
Jane Doe,,Bank B,PERSON,source,1340.00,AUD,AUD,234-567,22222222
Bob Johnson,,Bank C,PERSON,source,11348.66,AUD,AUD,345-678,33333333`;

    const parseResult = parseABAFile(abaContent);
    const wiseRows = convertToWiseFormat(parseResult.transactions);
    const csv = generateCSV(wiseRows);

    expect(csv).toBe(expectedCSV);
  });
});
