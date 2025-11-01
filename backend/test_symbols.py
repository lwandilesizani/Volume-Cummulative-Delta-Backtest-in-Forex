"""
Test Gold symbol formats with Databento
"""

import os
from dotenv import load_dotenv
import databento as db

load_dotenv()

client = db.Historical(os.environ.get('DATABENTO_API_KEY'))

# Try to get available symbols for Gold
print("Testing Gold futures symbols...")
print()

# Common Gold symbol formats to try:
test_symbols = [
    'GC',           # Generic continuous
    'GC.FUT',       # Futures continuous
    'GC.n.0',       # Continuous contract
    'GCZ4',         # Specific contract (Dec 2024)
    'GC.c.0',       # Another continuous format
]

dataset = 'GLBX.MDP3'

for symbol in test_symbols:
    try:
        print(f"Trying: {symbol}")
        # Try a small data request to test if symbol is valid
        result = client.timeseries.get_range(
            dataset=dataset,
            symbols=[symbol],
            schema='ohlcv-1d',
            start='2020-01-01',
            end='2020-01-02',
            stype_in='raw_symbol',
        )
        df = result.to_df()
        print(f"  ✓ SUCCESS: {symbol} - Got {len(df)} records")
        print(f"  Columns: {list(df.columns)}")
        print()
    except Exception as e:
        error_msg = str(e)
        if '422' in error_msg:
            print(f"  ✗ FAILED: Invalid symbol")
        else:
            print(f"  ✗ FAILED: {e}")
        print()
