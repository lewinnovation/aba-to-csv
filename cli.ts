#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, basename } from 'path';
import { createInterface } from 'readline';
import { convertABAToWise } from './src/lib/abaConverter.js';

function prompt(question: string): Promise<string> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  
  // If a filename is provided, use it
  if (args.length > 0) {
    const filename = args[0];
    await processFile(filename);
    return;
  }

  // Otherwise, list available ABA files and prompt for selection
  const files = readdirSync('.')
    .filter(f => f.endsWith('.aba'))
    .sort();

  if (files.length === 0) {
    console.error('No .aba files found in current directory');
    process.exit(1);
  }

  console.log('\nAvailable ABA files:');
  files.forEach((file, index) => {
    const isDefault = file === 'current.aba' ? ' (default)' : '';
    console.log(`${index + 1}. ${file}${isDefault}`);
  });

  // Prompt user for selection
  const answer = await prompt('\nSelect a file (enter number or press Enter for default): ');
  
  // If empty, use current.aba if it exists, otherwise use first file
  let selectedFile: string;
  if (answer === '') {
    selectedFile = files.find(f => f === 'current.aba') || files[0];
  } else {
    const selectedIndex = parseInt(answer, 10) - 1;

    if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= files.length) {
      console.error('Invalid selection');
      process.exit(1);
    }

    selectedFile = files[selectedIndex];
  }

  await processFile(selectedFile);
}

async function processFile(filename: string) {
  try {
    console.log(`\nReading ${filename}...`);
    
    // Read the ABA file
    const content = readFileSync(filename, 'utf-8');
    
    // Create a File-like object for the converter
    const file = new File([content], filename, { type: 'text/plain' });
    
    // Convert using the same logic as the web app
    const result = await convertABAToWise(file);
    
    if (!result.success) {
      console.error(`\nError: ${result.error}`);
      process.exit(1);
    }
    
    // Write the CSV file
    const outputFilename = result.filename || 'wise_batch.csv';
    writeFileSync(outputFilename, result.csvContent!);
    
    console.log(`✓ Converted ${result.transactionCount} transactions`);
    console.log(`✓ Output written to: ${outputFilename}`);
    
  } catch (error) {
    console.error(`\nError processing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
