"""
Complete Backtest Pipeline with Databento Integration
Fetches data from Databento, processes it, and runs backtest
"""

import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
import pandas as pd

from databento_fetcher import DatabentoFetcher
from volume_calculator import VolumeCalculator
from main import VolumeCumulativeDeltaBacktest

# Load environment variables
load_dotenv()


def run_full_backtest(
    symbols=['ES.FUT'],
    days_back=7,
    dataset='GLBX.MDP3',
    frequency='1min',
    threshold=500,
    position_size=0.1,
    initial_capital=10000,
    use_cached=True
):
    """
    Complete backtest pipeline

    Args:
        symbols: List of symbols to trade
        days_back: Number of days of historical data
        dataset: Databento dataset
        frequency: Bar frequency for analysis
        threshold: Cumulative delta threshold for signals
        position_size: Fraction of capital per trade
        initial_capital: Starting capital
        use_cached: If True, use existing CSV data if available

    Returns:
        Dictionary with backtest results and data
    """
    print("="*80)
    print("VOLUME CUMULATIVE DELTA BACKTEST WITH DATABENTO DATA")
    print("="*80)
    print()

    # Set date range
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days_back)

    print(f"Symbol: {symbols[0]}")
    print(f"Date Range: {start_date.date()} to {end_date.date()}")
    print(f"Dataset: {dataset}")
    print(f"Bar Frequency: {frequency}")
    print()

    # Initialize fetcher
    fetcher = DatabentoFetcher()

    # Check for existing data
    expected_filename = f"trades_{symbols[0]}_{start_date.strftime('%Y-%m-%d')}_{end_date.strftime('%Y-%m-%d')}.csv"
    data_path = os.path.join(fetcher.data_dir, expected_filename)

    if use_cached and os.path.exists(data_path):
        print(f"Using cached data: {expected_filename}")
        trades_df = fetcher.load_csv(expected_filename)
    else:
        print("Fetching fresh data from Databento...")
        trades_df = fetcher.fetch_trades(
            symbols=symbols,
            start_date=start_date.strftime('%Y-%m-%d'),
            end_date=end_date.strftime('%Y-%m-%d'),
            dataset=dataset
        )

        if trades_df.empty:
            raise ValueError("No trade data received from Databento")

    print()
    print("-"*80)
    print("PROCESSING TRADE DATA")
    print("-"*80)

    # Process trades into bars with buy/sell volume
    calc = VolumeCalculator()
    bars_df = calc.process_trades_to_bars(trades_df, frequency=frequency)

    print()
    print("-"*80)
    print("RUNNING BACKTEST")
    print("-"*80)

    # Initialize backtest engine
    backtest = VolumeCumulativeDeltaBacktest(initial_capital=initial_capital)

    # Note: bars_df already has cumulative_delta from volume_calculator
    # But main.py's calculate_cumulative_delta expects buy_volume/sell_volume
    # So we can use it directly or recalculate

    # Generate signals
    print(f"Generating trading signals (threshold: ±{threshold})...")
    bars_df = backtest.generate_signals(bars_df, threshold=threshold)
    signals_count = bars_df[bars_df['signal'] != 0].shape[0]
    print(f"Generated {signals_count} trading signals")

    # Run backtest
    print("Executing backtest...")
    backtest.backtest(bars_df, position_size=position_size)
    print("Backtest complete!")
    print()

    # Get performance metrics
    metrics = backtest.get_performance_metrics()

    # Display results
    print("="*80)
    print("PERFORMANCE METRICS")
    print("="*80)
    print(f"Initial Capital:    ${initial_capital:.2f}")
    print(f"Final Capital:      ${metrics['final_capital']:.2f}")
    print(f"Total Return:       {metrics['total_return']:.2f}%")
    print(f"Total Trades:       {metrics['total_trades']}")
    print(f"Winning Trades:     {metrics['winning_trades']}")
    print(f"Losing Trades:      {metrics['losing_trades']}")
    print(f"Win Rate:           {metrics['win_rate']:.2f}%")
    print(f"Average Win:        ${metrics['avg_win']:.2f}")
    print(f"Average Loss:       ${metrics['avg_loss']:.2f}")
    print(f"Profit Factor:      {metrics['profit_factor']:.2f}")
    print("="*80)
    print()

    # Show sample trades
    if backtest.trades:
        print("Sample Trades (first 5):")
        print("-" * 80)
        for i, trade in enumerate(backtest.trades[:5]):
            print(f"Trade {i+1}:")
            print(f"  Entry: ${trade['entry_price']:.2f} | Exit: ${trade['exit_price']:.2f}")
            print(f"  P&L: ${trade['pnl']:.2f} ({trade['return']:.2f}%)")
            print(f"  Exit: {trade['exit_time']}")
        print()

    # Return data for visualization
    return {
        'bars': bars_df,
        'trades': backtest.trades,
        'equity_curve': backtest.equity_curve,
        'metrics': metrics,
        'positions': backtest.positions
    }


def main():
    """Run backtest with default parameters"""
    try:
        results = run_full_backtest(
            symbols=['ES.FUT'],
            days_back=7,
            dataset='GLBX.MDP3',
            frequency='1min',
            threshold=500,
            position_size=0.1,
            initial_capital=10000,
            use_cached=True
        )

        print("Backtest completed successfully!")
        print(f"Generated {len(results['bars'])} bars")
        print(f"Executed {len(results['trades'])} trades")
        print()

    except Exception as e:
        print(f"\nError running backtest: {e}")
        print("\nPlease ensure:")
        print("1. DATABENTO_API_KEY is set in .env file")
        print("2. You have active Databento subscription")
        print("3. Dataset and symbols are correct")
        raise


if __name__ == "__main__":
    main()
