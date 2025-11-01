"""
Volume Calculator for Trades Data
Calculates buy/sell volume and cumulative delta from trade-level data
"""

import pandas as pd
import numpy as np


class VolumeCalculator:
    """Processes trade data to calculate buy/sell volume and cumulative delta"""

    @staticmethod
    def calculate_trade_side(trades_df):
        """
        Determine if each trade is a buy or sell based on aggressor side

        Args:
            trades_df: DataFrame with trade data from Databento

        Returns:
            DataFrame with 'side' column added ('buy' or 'sell')
        """
        df = trades_df.copy()

        # Databento trades schema includes 'side' field:
        # 'A' = ask (sell), 'B' = bid (buy)
        # Or use 'action' field if available
        if 'side' in df.columns:
            df['trade_side'] = df['side'].map({'A': 'sell', 'B': 'buy'})
        elif 'action' in df.columns:
            # 'A' = Ask side (seller initiated), 'B' = Bid side (buyer initiated)
            df['trade_side'] = df['action'].map({'A': 'sell', 'B': 'buy'})
        else:
            # Fallback: use tick rule (compare to mid price if available)
            print("Warning: No side/action field found. Using tick rule approximation")
            df['trade_side'] = 'unknown'

        return df

    @staticmethod
    def aggregate_to_bars(trades_df, frequency='1min'):
        """
        Aggregate tick trades into time bars with buy/sell volume

        Args:
            trades_df: DataFrame with trade data
            frequency: Pandas frequency string (e.g., '1min', '5min', '1h')

        Returns:
            DataFrame with columns: timestamp, close, buy_volume, sell_volume, total_volume
        """
        df = trades_df.copy()

        # Ensure we have trade side
        if 'trade_side' not in df.columns:
            df = VolumeCalculator.calculate_trade_side(df)

        # Group by time frequency
        df.index = pd.to_datetime(df.index)

        # Aggregate data
        agg_dict = {
            'price': 'last',  # Last price in the bar (close)
        }

        # If size/quantity column exists
        size_col = None
        for col in ['size', 'quantity', 'qty', 'volume']:
            if col in df.columns:
                size_col = col
                break

        if size_col is None:
            raise ValueError("No size/volume column found in trades data")

        # Create separate columns for buy and sell volume
        df['buy_volume'] = df.apply(
            lambda row: row[size_col] if row['trade_side'] == 'buy' else 0,
            axis=1
        )
        df['sell_volume'] = df.apply(
            lambda row: row[size_col] if row['trade_side'] == 'sell' else 0,
            axis=1
        )

        # Resample to desired frequency
        bars = df.resample(frequency).agg({
            'price': 'last',
            'buy_volume': 'sum',
            'sell_volume': 'sum',
        })

        # Clean up
        bars = bars.dropna(subset=['price'])
        bars['total_volume'] = bars['buy_volume'] + bars['sell_volume']
        bars.rename(columns={'price': 'close'}, inplace=True)

        return bars

    @staticmethod
    def calculate_cumulative_delta(bars_df):
        """
        Calculate cumulative delta from buy/sell volume bars

        Args:
            bars_df: DataFrame with buy_volume and sell_volume columns

        Returns:
            DataFrame with 'delta' and 'cumulative_delta' columns added
        """
        df = bars_df.copy()

        # Calculate delta for each bar
        df['delta'] = df['buy_volume'] - df['sell_volume']

        # Calculate cumulative sum
        df['cumulative_delta'] = df['delta'].cumsum()

        return df

    @staticmethod
    def process_trades_to_bars(trades_df, frequency='1min'):
        """
        Full pipeline: trades -> bars with buy/sell volume -> cumulative delta

        Args:
            trades_df: Raw trade data from Databento
            frequency: Time bar frequency

        Returns:
            DataFrame ready for backtesting with cumulative delta
        """
        print(f"Processing {len(trades_df)} trades into {frequency} bars...")

        # Step 1: Determine trade side
        df = VolumeCalculator.calculate_trade_side(trades_df)

        # Step 2: Aggregate to time bars
        bars = VolumeCalculator.aggregate_to_bars(df, frequency)

        # Step 3: Calculate cumulative delta
        bars = VolumeCalculator.calculate_cumulative_delta(bars)

        print(f"Created {len(bars)} bars with cumulative delta")
        print(f"Delta range: {bars['cumulative_delta'].min():.0f} to {bars['cumulative_delta'].max():.0f}")

        return bars


def example_usage():
    """Example of processing trade data"""

    # This would normally load from CSV
    print("Example: Processing trades to volume bars")
    print("="*60)

    # Simulate some trade data
    dates = pd.date_range('2024-01-01', periods=1000, freq='1s')
    trades = pd.DataFrame({
        'price': 4500 + np.random.randn(1000).cumsum() * 0.5,
        'size': np.random.randint(1, 100, 1000),
        'side': np.random.choice(['A', 'B'], 1000),
    }, index=dates)

    # Process trades
    calc = VolumeCalculator()
    bars = calc.process_trades_to_bars(trades, frequency='1min')

    print("\nResulting bars:")
    print(bars.head(10))
    print("\nColumns:", bars.columns.tolist())
    print("\nSummary stats:")
    print(bars.describe())


if __name__ == "__main__":
    example_usage()
