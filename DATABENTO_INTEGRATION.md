# Databento Integration Complete!

## What's Been Set Up

### Backend Databento Integration ✅

1. **`databento_fetcher.py`** - Main data fetcher
   - Fetches **trades** schema (tick-by-tick trade data)
   - Fetches **ohlcv-1m** schema (1-minute candles)
   - Saves all data as CSV in `backend/Data/` folder
   - Supports caching (reuse downloaded data)

2. **`volume_calculator.py`** - Volume analysis
   - Processes raw trades into time bars
   - Calculates buy/sell volume from trade side
   - Computes cumulative delta (order flow imbalance)
   - Flexible timeframes (1m, 5m, 1h, etc.)

3. **`run_backtest_with_data.py`** - Full pipeline
   - Fetches data from Databento
   - Processes trades to bars
   - Runs backtest with real data
   - Displays performance metrics

4. **Updated `requirements.txt`**
   - Added `databento>=0.45.0`
   - Added `python-dotenv>=1.0.0`

5. **`.env.example`** - Configuration template
   - Shows how to set Databento API key

## Data Flow

```
Databento API
    ↓
databento_fetcher.py → Fetch trades + OHLCV
    ↓
backend/Data/*.csv → Save as CSV
    ↓
volume_calculator.py → Process trades to bars with buy/sell volume
    ↓
main.py → Calculate cumulative delta, generate signals
    ↓
Backtest Results → Performance metrics
    ↓
Frontend API → Visualize in TradingView charts
```

## Databento Schemas Focus

As requested, we're focusing on these two schemas:

### 1. **trades** - Tick-by-tick trade data
- Every individual trade
- Includes: timestamp, price, size, side (buy/sell aggressor)
- **Purpose**: Calculate buy/sell volume for cumulative delta
- **Best for**: Order flow analysis, microstructure

### 2. **ohlcv-1m** - 1-minute candlesticks
- Open, High, Low, Close, Volume per minute
- Aggregated from trades
- **Purpose**: Price visualization, context
- **Best for**: Backtesting, charting

## Quick Start

### 1. Get Databento API Key
```bash
# Sign up at https://databento.com
# Get API key from https://databento.com/portal/keys
```

### 2. Configure Environment
```bash
cd backend
cp .env.example .env
# Edit .env and add your API key
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run Full Pipeline
```bash
python run_backtest_with_data.py
```

This will:
- ✅ Fetch 7 days of ES.FUT (S&P 500 futures) trades
- ✅ Process to 1-minute bars with buy/sell volume
- ✅ Calculate cumulative delta
- ✅ Generate trading signals (buy when delta > +500, sell when < -500)
- ✅ Run backtest and show performance
- ✅ Save all data as CSV in `Data/` folder

## File Structure

```
backend/
├── databento_fetcher.py         ← Fetch data from Databento
├── volume_calculator.py         ← Calculate buy/sell volume
├── run_backtest_with_data.py   ← Full pipeline
├── main.py                      ← Original backtest engine
├── requirements.txt             ← Updated with databento
├── .env.example                 ← API key template
├── .env                         ← Your actual API key (create this)
├── README.md                    ← Full backend docs
└── Data/                        ← CSV storage (auto-created)
    ├── trades_ES.FUT_*.csv
    └── ohlcv_1m_ES.FUT_*.csv
```

## Available Symbols (GLBX.MDP3 Dataset)

Common CME futures:
- **ES.FUT** - E-mini S&P 500 (most liquid)
- **NQ.FUT** - E-mini NASDAQ-100
- **YM.FUT** - E-mini Dow
- **RTY.FUT** - E-mini Russell 2000
- **GC.FUT** - Gold futures
- **CL.FUT** - Crude Oil
- **6E.FUT** - Euro FX
- **ZN.FUT** - 10-Year Treasury Note

## Customization

### Change Symbol
```python
run_full_backtest(
    symbols=['NQ.FUT'],  # Change to NASDAQ
    ...
)
```

### Change Date Range
```python
run_full_backtest(
    days_back=30,  # Last 30 days instead of 7
    ...
)
```

### Change Bar Frequency
```python
run_full_backtest(
    frequency='5min',  # 5-minute bars instead of 1-minute
    ...
)
```

### Adjust Strategy Parameters
```python
run_full_backtest(
    threshold=1000,      # Higher delta threshold
    position_size=0.2,   # 20% position size
    initial_capital=50000,  # $50k starting capital
    ...
)
```

## CSV Data Format

### trades_ES.FUT_2024-01-01_2024-01-07.csv
```
timestamp,price,size,side,...
2024-01-01 09:30:00.123456,4500.25,10,B
2024-01-01 09:30:00.234567,4500.50,5,A
...
```

### Processed bars (after volume_calculator)
```
timestamp,close,buy_volume,sell_volume,delta,cumulative_delta
2024-01-01 09:30:00,4500.25,150,120,30,30
2024-01-01 09:31:00,4500.75,180,100,80,110
...
```

## Integration with Frontend

The frontend Next.js app is already set up. Next steps:

1. Modify `frontend/pages/api/backtest.js` to call Python scripts
2. Return real data instead of mock data
3. Charts will automatically visualize the results

## What to Do Next

### Immediate:
1. ✅ Get Databento API key
2. ✅ Create `.env` file with your key
3. ✅ Run `pip install -r requirements.txt`
4. ✅ Test: `python run_backtest_with_data.py`

### After Testing:
5. Integrate with frontend API
6. Add more symbols
7. Optimize strategy parameters
8. Add additional schemas as needed (we can add MBO, MBP later)

## Cost Considerations

Databento pricing:
- **trades** schema: Most expensive (tick data)
- **ohlcv-1m**: Less expensive (aggregated)
- **Tip**: Use cached data (`use_cached=True`) to avoid re-downloading

## Questions?

Check the documentation:
- `backend/README.md` - Detailed backend docs
- `SETUP.md` - Full project setup
- [Databento Docs](https://docs.databento.com/)

---

**Status**: Ready for testing! 🚀

Focus: **trades** + **ohlcv-1m** schemas only (as requested)

All data stored as CSV in `backend/Data/` folder
