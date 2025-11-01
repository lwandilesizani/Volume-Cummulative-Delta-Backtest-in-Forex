"""
Databento Data Fetcher
Fetches trade and OHLCV data from Databento and saves as CSV
"""

import databento as db
import pandas as pd
from datetime import datetime, timedelta
import os


class DatabentoFetcher:
    """Fetches market data from Databento API"""

    def __init__(self, api_key=None):
        """
        Initialize Databento client

        Args:
            api_key: Databento API key. If None, will use DATABENTO_API_KEY env var
        """
        self.api_key = api_key or os.environ.get('DATABENTO_API_KEY')
        if not self.api_key:
            raise ValueError("API key required. Set DATABENTO_API_KEY environment variable or pass api_key parameter")

        self.client = db.Historical(self.api_key)
        self.data_dir = os.path.join(os.path.dirname(__file__), 'Data')

        # Create Data directory if it doesn't exist
        os.makedirs(self.data_dir, exist_ok=True)

    def fetch_trades(self, symbols, start_date, end_date, dataset='GLBX.MDP3', stype='continuous'):
        """
        Fetch tick-by-tick trade data

        Args:
            symbols: List of symbols (e.g., ['GC.c.0'])
            start_date: Start date (string 'YYYY-MM-DD' or datetime)
            end_date: End date (string 'YYYY-MM-DD' or datetime)
            dataset: Databento dataset (default: GLBX.MDP3 for CME futures)
            stype: Symbol type ('continuous', 'raw_symbol', 'parent', etc.)

        Returns:
            DataFrame with trade data
        """
        print(f"Fetching trades data for {symbols}...")
        print(f"Date range: {start_date} to {end_date}")
        print(f"Symbol type: {stype}")

        try:
            # Fetch data from Databento
            data = self.client.timeseries.get_range(
                dataset=dataset,
                symbols=symbols,
                schema='trades',
                start=start_date,
                end=end_date,
                stype_in=stype,
            )

            # Convert to DataFrame
            df = data.to_df()

            if df.empty:
                print("Warning: No trades data received")
                return df

            print(f"Fetched {len(df)} trade records")

            # Save to CSV
            filename = f"trades_{symbols[0]}_{start_date}_{end_date}.csv"
            filepath = os.path.join(self.data_dir, filename)
            df.to_csv(filepath, index=True)
            print(f"Saved trades data to: {filepath}")

            return df

        except Exception as e:
            print(f"Error fetching trades data: {e}")
            raise

    def fetch_ohlcv(self, symbols, start_date, end_date, dataset='GLBX.MDP3', timeframe='1m', stype='continuous'):
        """
        Fetch OHLCV candlestick data

        Args:
            symbols: List of symbols (e.g., ['GC.c.0'])
            start_date: Start date (string 'YYYY-MM-DD' or datetime)
            end_date: End date (string 'YYYY-MM-DD' or datetime)
            dataset: Databento dataset (default: GLBX.MDP3 for CME futures)
            timeframe: Timeframe (e.g., '1m', '5m', '1h', '1d')
            stype: Symbol type ('continuous', 'raw_symbol', 'parent', etc.)

        Returns:
            DataFrame with OHLCV data
        """
        print(f"Fetching {timeframe} OHLCV data for {symbols}...")
        print(f"Date range: {start_date} to {end_date}")
        print(f"Symbol type: {stype}")

        try:
            # Fetch data from Databento
            data = self.client.timeseries.get_range(
                dataset=dataset,
                symbols=symbols,
                schema=f'ohlcv-{timeframe}',
                start=start_date,
                end=end_date,
                stype_in=stype,
            )

            # Convert to DataFrame
            df = data.to_df()

            if df.empty:
                print("Warning: No OHLCV data received")
                return df

            print(f"Fetched {len(df)} {timeframe} bars")

            # Save to CSV
            filename = f"ohlcv_{timeframe}_{symbols[0]}_{start_date}_{end_date}.csv"
            filepath = os.path.join(self.data_dir, filename)
            df.to_csv(filepath, index=True)
            print(f"Saved OHLCV data to: {filepath}")

            return df

        except Exception as e:
            print(f"Error fetching OHLCV data: {e}")
            raise

    def fetch_all(self, symbols, start_date, end_date, dataset='GLBX.MDP3'):
        """
        Fetch both trades and OHLCV-1m data

        Args:
            symbols: List of symbols (e.g., ['ES.FUT'])
            start_date: Start date (string 'YYYY-MM-DD' or datetime)
            end_date: End date (string 'YYYY-MM-DD' or datetime)
            dataset: Databento dataset

        Returns:
            Dictionary with 'trades' and 'ohlcv' DataFrames
        """
        trades_df = self.fetch_trades(symbols, start_date, end_date, dataset)
        ohlcv_df = self.fetch_ohlcv(symbols, start_date, end_date, dataset, timeframe='1m')

        return {
            'trades': trades_df,
            'ohlcv': ohlcv_df
        }

    def list_available_data(self):
        """List all CSV files in the Data directory"""
        files = [f for f in os.listdir(self.data_dir) if f.endswith('.csv')]

        if not files:
            print("No data files found in Data directory")
            return []

        print(f"\nAvailable data files in {self.data_dir}:")
        print("-" * 60)
        for f in sorted(files):
            filepath = os.path.join(self.data_dir, f)
            size_mb = os.path.getsize(filepath) / (1024 * 1024)
            print(f"  {f} ({size_mb:.2f} MB)")
        print("-" * 60)

        return files

    def load_csv(self, filename):
        """
        Load a CSV file from the Data directory

        Args:
            filename: Name of the CSV file

        Returns:
            DataFrame
        """
        filepath = os.path.join(self.data_dir, filename)

        if not os.path.exists(filepath):
            raise FileNotFoundError(f"File not found: {filepath}")

        print(f"Loading data from: {filepath}")
        df = pd.read_csv(filepath, index_col=0, parse_dates=True)
        print(f"Loaded {len(df)} records")

        return df


def example_usage():
    """Example usage of DatabentoFetcher"""

    # Initialize fetcher
    fetcher = DatabentoFetcher()

    # Set parameters
    symbols = ['ES.FUT']  # E-mini S&P 500 futures
    end_date = datetime.now()
    start_date = end_date - timedelta(days=7)  # Last 7 days

    # Fetch data
    print("="*60)
    print("Databento Data Fetcher Example")
    print("="*60)

    # Fetch trades
    trades_df = fetcher.fetch_trades(
        symbols=symbols,
        start_date=start_date.strftime('%Y-%m-%d'),
        end_date=end_date.strftime('%Y-%m-%d'),
        dataset='GLBX.MDP3'
    )

    print(f"\nTrades data shape: {trades_df.shape}")
    print(trades_df.head())

    # Fetch OHLCV
    ohlcv_df = fetcher.fetch_ohlcv(
        symbols=symbols,
        start_date=start_date.strftime('%Y-%m-%d'),
        end_date=end_date.strftime('%Y-%m-%d'),
        dataset='GLBX.MDP3',
        timeframe='1m'
    )

    print(f"\nOHLCV data shape: {ohlcv_df.shape}")
    print(ohlcv_df.head())

    # List available data
    fetcher.list_available_data()


if __name__ == "__main__":
    example_usage()
