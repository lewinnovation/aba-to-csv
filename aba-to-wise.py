import csv
import sys
import os
from pathlib import Path

def get_aba_files():
    """Get all .aba files in the current directory."""
    return sorted([f for f in os.listdir('.') if f.endswith('.aba')])

def prompt_for_file():
    """Prompt user to select an ABA file to process."""
    aba_files = get_aba_files()
    
    if not aba_files:
        print("Error: No .aba files found in the current directory.")
        sys.exit(1)
    
    print("\nAvailable ABA files:")
    for i, filename in enumerate(aba_files, 1):
        default_marker = " (default)" if filename == 'current.aba' else ""
        print(f"  {i}. {filename}{default_marker}")
    
    print("\nEnter the number of the file to process, or press Enter for default (current.aba):")
    choice = input("> ").strip()
    
    if not choice:
        # Default to current.aba if it exists
        if 'current.aba' in aba_files:
            return 'current.aba'
        else:
            return aba_files[0]
    
    try:
        index = int(choice) - 1
        if 0 <= index < len(aba_files):
            return aba_files[index]
        else:
            print(f"Invalid choice. Using default: current.aba")
            return 'current.aba' if 'current.aba' in aba_files else aba_files[0]
    except ValueError:
        print(f"Invalid input. Using default: current.aba")
        return 'current.aba' if 'current.aba' in aba_files else aba_files[0]

def parse_aba_file(aba_filename):
    transactions = []
    with open(aba_filename, 'r') as file:
        for line in file:
            record_type = line[0]
            if record_type == '1':
                # Detail Record
                transaction = {
                    'name': line[30:62].strip(),  # Account Name (Positions 31-62)
                    'payment_reference': line[62:80].strip(),  # Lodgement Reference (Positions 63-80)
                    'amount': int(line[20:30].strip()) / 100.0,  # Amount in dollars (Positions 21-30)
                    'bsbCode': line[1:8].strip(),  # BSB Number (Positions 2-8)
                    'accountNumber': line[8:17].strip(),  # Account Number (Positions 9-17)
                }
                transactions.append(transaction)
            else:
                # Skip header (Record Type '0') and footer (Record Type '7') records
                continue
    return transactions

def create_wise_batch_file(transactions, wise_filename):
    # Define the CSV headers as per your expected output
    fieldnames = [
        'name',
        'recipientEmail',
        'paymentReference',
        'receiverType',
        'amountCurrency',
        'amount',
        'sourceCurrency',
        'targetCurrency',
        'bsbCode',
        'accountNumber'
    ]

    with open(wise_filename, 'w', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()

        for tx in transactions[:-1]:  # Exclude the last transaction
            writer.writerow({
                'name': tx['name'],
                'recipientEmail': '',  # Assuming email is not available in ABA file
                'paymentReference': tx['payment_reference'],
                'receiverType': 'PERSON',
                'amountCurrency': 'source',
                'amount': f"{tx['amount']:.2f}",
                'sourceCurrency': 'AUD',
                'targetCurrency': 'AUD',
                'bsbCode': tx['bsbCode'],
                'accountNumber': tx['accountNumber'],
            })

    print(f"Wise batch file '{wise_filename}' created successfully.")

if __name__ == "__main__":
    # Check if filename was provided as command-line argument
    if len(sys.argv) > 1:
        aba_filename = sys.argv[1]
        if not aba_filename.endswith('.aba'):
            print(f"Error: '{aba_filename}' is not an ABA file.")
            sys.exit(1)
        if not os.path.exists(aba_filename):
            print(f"Error: File '{aba_filename}' not found.")
            sys.exit(1)
    else:
        # Interactively prompt for file selection
        aba_filename = prompt_for_file()
    
    # Generate output filename based on input filename
    base_name = Path(aba_filename).stem
    wise_filename = f'wise_batch_{base_name}.csv'
    
    print(f"\nProcessing: {aba_filename}")
    print(f"Output will be saved to: {wise_filename}")

    # Parse the ABA file
    transactions = parse_aba_file(aba_filename)

    # Create the Wise batch CSV file
    create_wise_batch_file(transactions, wise_filename)
