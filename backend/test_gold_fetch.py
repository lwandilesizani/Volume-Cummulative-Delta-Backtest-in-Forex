"""
Test Gold data fetch with small date range
"""

import os
from dotenv import load_dotenv
from databento_fetcher import DatabentoFetcher

load_dotenv()

print("="*80)
print("TESTING GOLD DATA FETCH (Small Sample)")
print("="*80)
print()

fetcher = DatabentoFetcher()

# Test with just 2 days first
symbols = ['GC.c.0']
start_date = '2023-01-03'
end_date = '2023-01-05'
dataset = 'GLBX.MDP3'
stype = 'continuous'

print(f"Symbol: {symbols[0]} (Gold continuous front month)")
print(f"Date Range: {start_date} to {end_date} (2 days test)")
print(f"Dataset: {dataset}")
print()

# Test OHLCV first (smaller dataset)
print("Testing OHLCV-1m...")
try:
    ohlcv_df = fetcher.fetch_ohlcv(
        symbols=symbols,
        start_date=start_date,
        end_date=end_date,
        dataset=dataset,
        timeframe='1m',
        stype=stype
    )

    print(f"\n✓ OHLCV Success! Got {len(ohlcv_df)} records")
    print(f"Columns: {list(ohlcv_df.columns)}")
    print("\nFirst 10 rows:")
    print(ohlcv_df.head(10))
    print()

except Exception as e:
    print(f"\n✗ OHLCV Failed: {e}\n")

# Test Trades
print("-"*80)
print("Testing Trades...")
try:
    trades_df = fetcher.fetch_trades(
        symbols=symbols,
        start_date=start_date,
        end_date=end_date,
        dataset=dataset,
        stype=stype
    )

    print(f"\n✓ Trades Success! Got {len(trades_df):,} records")
    print(f"Columns: {list(trades_df.columns)}")
    print("\nFirst 10 rows:")
    print(trades_df.head(10))
    print()

except Exception as e:
    print(f"\n✗ Trades Failed: {e}\n")

print("="*80)
print("If both tests passed, we're ready to fetch 2020-2023 data!")
print("="*80)
