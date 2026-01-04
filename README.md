# ABA to Wise Converter

Convert ABA (Australian Banking Association) files to Wise batch payment CSV format.

## Usage

There are two ways to run this project:

### Option 1: Using `uv` (Recommended)

If you have [uv](https://github.com/astral-sh/uv) installed:

```bash
uv run python aba-to-wise.py
```

Or with a specific file:

```bash
uv run python aba-to-wise.py 20250101.aba
```

### Option 2: Using `run.sh`

The `run.sh` script will automatically:
- Check for `uv` and use it if available
- Otherwise, create a virtual environment if needed
- Install dependencies
- Run the conversion script

```bash
./run.sh
```

Or with a specific file:

```bash
./run.sh 20250101.aba
```

## Interactive Mode

If you run the script without specifying a file, it will:
1. List all `.aba` files in the current directory
2. Prompt you to select a file by number
3. Default to `current.aba` if you press Enter

## Output

The script generates a Wise-compatible CSV file named `wise_batch_[filename].csv` containing:
- Recipient name
- Payment reference
- Amount
- BSB code and account number
- Currency information (AUD)

## Requirements

- Python 3.10 or higher
- No external dependencies required (uses standard library only)
