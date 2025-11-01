"""
Process Gold trades data to calculate buy/sell volume and cumulative delta
"""

import pandas as pd
from dotenv import load_dotenv
from databento_fetcher import DatabentoFetcher
from volume_calculator import VolumeCalculator

# Load environment variables
load_dotenv()

print("="*80)
print("PROCESSING GOLD TRADES DATA")
print("="*80)
print()

# Load the trades data
fetcher = DatabentoFetcher()
filename = 'trades_GC.c.0_2020-01-01_2023-12-31.csv'

print(f"Loading: {filename}")
trades_df = fetcher.load_csv(filename)

print(f"Loaded {len(trades_df):,} trade records")
print(f"Date range: {trades_df.index.min()} to {trades_df.index.max()}")
print()

# Display sample
print("Sample trades:")
print(trades_df.head(10))
print()
print(f"Columns: {list(trades_df.columns)}")
print()

# Check for 'action' or 'side' column
if 'action' in trades_df.columns:
    print("Trade side indicator: 'action' column")
    print(f"Unique values: {trades_df['action'].unique()}")
elif 'side' in trades_df.columns:
    print("Trade side indicator: 'side' column")
    print(f"Unique values: {trades_df['side'].unique()}")
else:
    print("⚠ Warning: No clear trade side indicator found")
print()

# Process trades to 1-minute bars
print("-"*80)
print("Processing trades to 1-minute bars with buy/sell volume...")
print("-"*80)
print()

calc = VolumeCalculator()
bars = calc.process_trades_to_bars(trades_df, frequency='1min')

print()
print("Processed bars summary:")
print(bars.describe())
print()

# Save processed bars
output_filename = 'processed-data.csv'
output_path = f"{fetcher.data_dir}/{output_filename}"
bars.to_csv(output_path)
print(f"✓ Saved processed bars to: {output_path}")
print()

# Show sample
print("Sample processed bars (first 20):")
print(bars.head(20))
print()

print("="*80)
print("PROCESSING COMPLETE!")
print("="*80)
print(f"Created {len(bars):,} bars with cumulative delta")
print(f"Ready for backtesting!")
print()
