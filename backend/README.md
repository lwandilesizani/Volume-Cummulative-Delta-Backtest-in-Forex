# Backend - Volume Cumulative Delta Backtest Engine

## Overview

Python backtesting engine that fetches real market data from Databento and calculates Volume Cumulative Delta for trading strategies.

## Features

- **Databento Integration**: Fetch real tick-by-tick trade data
- **Volume Analysis**: Calculate buy/sell volume from trades
- **Cumulative Delta**: Track order flow imbalance
- **Backtesting Engine**: Test trading strategies with historical data
- **CSV Storage**: All data saved as CSV for analysis

## Project Structure

```
backend/
├── main.py                      # Core backtest engine
├── databento_fetcher.py         # Fetch data from Databento API
├── volume_calculator.py         # Process trades to buy/sell volume
├── run_backtest_with_data.py   # Full pipeline script
├── requirements.txt             # Python dependencies
├── .env.example                 # Environment variables template
└── Data/                        # CSV data storage
    ├── trades_*.csv             # Trade-level data
    └── ohlcv_*.csv              # OHLCV candlestick data
```

## Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

Dependencies:
- `pandas` - Data manipulation
- `numpy` - Numerical computing
- `databento` - Market data API client
- `python-dotenv` - Environment variable management

### 2. Configure Databento API

1. Get your API key from [Databento Portal](https://databento.com/portal/keys)
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Add your API key to `.env`:
   ```
   DATABENTO_API_KEY=your_actual_api_key_here
   ```

## Databento Schemas

We use two schemas:

### 1. Trades Schema
- **Purpose**: Tick-by-tick trade data for calculating buy/sell volume
- **Fields**: timestamp, price, size, side (buy/sell aggressor)
- **Use**: Order flow analysis, cumulative delta calculation

### 2. OHLCV-1m Schema
- **Purpose**: 1-minute candlestick bars
- **Fields**: open, high, low, close, volume
- **Use**: Price visualization, context for trade signals

## Usage

### Option 1: Run Full Pipeline (Recommended)

Fetches data from Databento and runs backtest:

```bash
python run_backtest_with_data.py
```

This will:
1. Fetch last 7 days of ES futures trade data
2. Process trades into 1-minute bars with buy/sell volume
3. Calculate cumulative delta
4. Generate trading signals
5. Run backtest and display results
6. Save all data as CSV in `Data/` folder

### Option 2: Fetch Data Only

Just fetch and save data without running backtest:

```bash
python databento_fetcher.py
```

### Option 3: Process Existing Data

If you already have CSV files in `Data/` folder:

```python
from databento_fetcher import DatabentoFetcher
from volume_calculator import VolumeCalculator

# Load existing trades data
fetcher = DatabentoFetcher()
trades_df = fetcher.load_csv('trades_ES.FUT_2024-01-01_2024-01-07.csv')

# Process to bars
calc = VolumeCalculator()
bars = calc.process_trades_to_bars(trades_df, frequency='1min')

# bars now has: close, buy_volume, sell_volume, cumulative_delta
```

### Option 4: Original Backtest (Sample Data)

Run original backtest with synthetic data:

```bash
python main.py
```

## Configuration

### Symbols

Common futures symbols for Databento `GLBX.MDP3` dataset:
- `ES.FUT` - E-mini S&P 500
- `NQ.FUT` - E-mini NASDAQ-100
- `YM.FUT` - E-mini Dow
- `RTY.FUT` - E-mini Russell 2000
- `GC.FUT` - Gold
- `CL.FUT` - Crude Oil

### Parameters in `run_backtest_with_data.py`

```python
run_full_backtest(
    symbols=['ES.FUT'],        # Symbol to trade
    days_back=7,               # Days of historical data
    dataset='GLBX.MDP3',       # Databento dataset
    frequency='1min',          # Bar frequency
    threshold=500,             # Cumulative delta threshold
    position_size=0.1,         # 10% of capital per trade
    initial_capital=10000,     # Starting capital
    use_cached=True            # Use existing CSV if available
)
```

## Data Storage

All fetched data is stored as CSV in `backend/Data/`:

### Trades Data
```
trades_ES.FUT_2024-01-01_2024-01-07.csv
```
Columns: timestamp, price, size, side, ...

### OHLCV Data
```
ohlcv_1m_ES.FUT_2024-01-01_2024-01-07.csv
```
Columns: timestamp, open, high, low, close, volume

### Listing Available Data

```python
from databento_fetcher import DatabentoFetcher

fetcher = DatabentoFetcher()
fetcher.list_available_data()
```

## Volume Calculation

The `VolumeCalculator` class processes raw trades:

1. **Determine Trade Side**: Classify each trade as buy or sell based on aggressor
2. **Aggregate to Bars**: Group trades into time bars (1min, 5min, etc.)
3. **Calculate Delta**: `delta = buy_volume - sell_volume`
4. **Cumulative Delta**: Running sum of delta over time

### Example:
```python
from volume_calculator import VolumeCalculator

calc = VolumeCalculator()

# Process trades to 1-minute bars
bars = calc.process_trades_to_bars(trades_df, frequency='1min')

# Result columns:
# - close: last price in bar
# - buy_volume: sum of buy trades
# - sell_volume: sum of sell trades
# - delta: buy_volume - sell_volume
# - cumulative_delta: running sum of delta
```

## Backtest Strategy

Current strategy (from `main.py`):

1. **Calculate Cumulative Delta**: Track order flow imbalance
2. **Generate Signals**:
   - **BUY**: When cumulative delta > threshold (e.g., +500)
   - **SELL**: When cumulative delta < -threshold (e.g., -500)
3. **Execute Trades**: Enter long on buy signal, exit on sell signal
4. **Track Performance**: Calculate metrics like win rate, profit factor

## Output

Sample backtest output:
```
============================================================
PERFORMANCE METRICS
============================================================
Initial Capital:    $10000.00
Final Capital:      $10534.25
Total Return:       5.34%
Total Trades:       14
Winning Trades:     8
Losing Trades:      6
Win Rate:           57.14%
Average Win:        $156.23
Average Loss:       $98.45
Profit Factor:      1.42
============================================================
```

## Troubleshooting

### No data received
- Check your Databento API key
- Verify you have an active subscription
- Confirm the symbol and dataset are correct
- Check date range (market must have been open)

### Import errors
- Ensure all dependencies are installed: `pip install -r requirements.txt`
- Check Python version (3.8+)

### CSV not found
- Run `databento_fetcher.py` first to download data
- Or set `use_cached=False` in run_backtest_with_data.py

## Next Steps

1. **Test with your Databento API key**
2. **Experiment with different symbols and timeframes**
3. **Adjust strategy parameters** (threshold, position_size)
4. **Add more sophisticated signals** (combining delta with price action)
5. **Integrate with frontend** for visualization

## Resources

- [Databento Documentation](https://docs.databento.com/)
- [Databento Python Client](https://github.com/databento/databento-python)
- [CME Market Data](https://www.cmegroup.com/market-data.html)
