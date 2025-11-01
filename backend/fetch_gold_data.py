"""
Fetch Gold (GC.FUT) data from Databento
Date Range: 2020-01-01 to 2023-12-31
Schemas: trades + ohlcv-1m
"""

import os
from datetime import datetime
from dotenv import load_dotenv
from databento_fetcher import DatabentoFetcher

# Load environment variables
load_dotenv()


def fetch_gold_historical_data():
    """
    Fetch Gold futures data from 2020 to 2023
    """
    print("="*80)
    print("FETCHING GOLD FUTURES DATA FROM DATABENTO")
    print("="*80)
    print()

    # Initialize fetcher
    fetcher = DatabentoFetcher()

    # Set parameters for Gold
    # Continuous contract format: [ROOT].[ROLL_RULE].[RANK]
    # GC.c.0 = Gold front month continuous contract
    symbols = ['GC.c.0']  # Gold futures continuous contract
    start_date = '2020-01-01'
    end_date = '2023-12-31'
    dataset = 'GLBX.MDP3'  # CME Globex dataset
    stype = 'continuous'  # Symbol type

    print(f"Symbol: {symbols[0]} (Gold Futures)")
    print(f"Date Range: {start_date} to {end_date}")
    print(f"Dataset: {dataset}")
    print(f"Schemas: trades, ohlcv-1m")
    print()

    # Check existing data
    fetcher.list_available_data()
    print()

    # Fetch trades data
    print("-"*80)
    print("STEP 1: Fetching TRADES data (tick-by-tick)")
    print("-"*80)
    print("Note: This may take a while due to large date range...")
    print()

    try:
        trades_df = fetcher.fetch_trades(
            symbols=symbols,
            start_date=start_date,
            end_date=end_date,
            dataset=dataset,
            stype=stype
        )

        print()
        print(f"✓ Trades data fetched successfully!")
        print(f"  Records: {len(trades_df):,}")
        print(f"  Date range: {trades_df.index.min()} to {trades_df.index.max()}")
        print(f"  Columns: {list(trades_df.columns)}")
        print()
        print("Sample data:")
        print(trades_df.head(10))
        print()

    except Exception as e:
        print(f"✗ Error fetching trades data: {e}")
        print()
        return

    # Fetch OHLCV-1m data
    print("-"*80)
    print("STEP 2: Fetching OHLCV-1m data (1-minute candles)")
    print("-"*80)
    print()

    try:
        ohlcv_df = fetcher.fetch_ohlcv(
            symbols=symbols,
            start_date=start_date,
            end_date=end_date,
            dataset=dataset,
            timeframe='1m',
            stype=stype
        )

        print()
        print(f"✓ OHLCV-1m data fetched successfully!")
        print(f"  Records: {len(ohlcv_df):,}")
        print(f"  Date range: {ohlcv_df.index.min()} to {ohlcv_df.index.max()}")
        print(f"  Columns: {list(ohlcv_df.columns)}")
        print()
        print("Sample data:")
        print(ohlcv_df.head(10))
        print()

    except Exception as e:
        print(f"✗ Error fetching OHLCV data: {e}")
        print()
        return

    # Show summary
    print("="*80)
    print("FETCH COMPLETE!")
    print("="*80)
    print()
    print("Data saved to backend/Data/ folder:")
    fetcher.list_available_data()
    print()
    print("Next steps:")
    print("1. Check the CSV files in backend/Data/")
    print("2. Run: python volume_calculator.py to process trades")
    print("3. Run: python run_backtest_with_data.py to backtest")
    print()


if __name__ == "__main__":
    fetch_gold_historical_data()
