"""
Check Databento API access and available datasets
"""

import os
from dotenv import load_dotenv
import databento as db

load_dotenv()

client = db.Historical(os.environ.get('DATABENTO_API_KEY'))

print("="*80)
print("DATABENTO API ACCESS CHECK")
print("="*80)
print()

# Try to get datasets
print("Attempting to list datasets...")
try:
    # Get account info
    print("Checking account status...")
    # Note: Different versions of databento may have different API methods

    # Try a simple request with a well-known symbol
    print("\nTrying to fetch ES (S&P 500) data as a test...")
    result = client.timeseries.get_range(
        dataset='GLBX.MDP3',
        symbols=['ES.FUT'],
        schema='ohlcv-1d',
        start='2023-01-01',
        end='2023-01-03',
        stype_in='continuous',
    )
    df = result.to_df()
    print(f"✓ API is working! Got {len(df)} records for ES.FUT")
    print(f"Columns: {list(df.columns)}")
    print()
    print("Sample data:")
    print(df)
    print()

except Exception as e:
    print(f"✗ Error: {e}")
    print()
    print("This could mean:")
    print("1. The API key doesn't have access to GLBX.MDP3 dataset")
    print("2. The subscription level doesn't include this data")
    print("3. The symbol format is incorrect")
    print()

# Try Gold with continuous contract
print("-"*80)
print("Testing Gold (GC) with continuous contract...")
try:
    result = client.timeseries.get_range(
        dataset='GLBX.MDP3',
        symbols=['GC.FUT'],
        schema='ohlcv-1d',
        start='2023-01-01',
        end='2023-01-03',
        stype_in='continuous',
    )
    df = result.to_df()
    print(f"✓ Gold data working! Got {len(df)} records")
    print(df)
    print()
except Exception as e:
    print(f"✗ Error with Gold: {e}")
    print()

print("="*80)
