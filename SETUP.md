# Volume Cumulative Delta Backtest - Setup Guide

## Project Structure

```
/
├── backend/              # Python backtesting engine
│   ├── main.py          # Backtest logic and calculations
│   ├── requirements.txt # Python dependencies
│   └── Data/            # Backend data output (separate from frontend)
├── frontend/            # Next.js web application
│   ├── pages/           # Next.js pages
│   │   ├── index.js     # Main dashboard
│   │   ├── _app.js      # App wrapper
│   │   ├── _document.js # Document wrapper
│   │   └── api/         # API routes
│   │       └── backtest.js  # Python integration endpoint
│   ├── components/      # React components
│   │   ├── PriceChart.js    # Price chart with signals
│   │   ├── DeltaChart.js    # Cumulative delta chart
│   │   └── EquityChart.js   # Equity curve chart
│   ├── styles/          # CSS styles
│   │   └── globals.css
│   ├── package.json
│   └── jsconfig.json
├── Charts/              # (Available for additional chart components)
└── Data/                # (Old data folder, can be removed)
```

## Features

### Frontend (Next.js + TradingView Lightweight Charts)
- **Pages Router** architecture
- **TradingView Lightweight Charts** for professional trading visualizations
- **Three main charts:**
  1. Price Chart with Entry/Exit signals
  2. Cumulative Delta histogram
  3. Equity Curve area chart
- **Performance metrics dashboard**
- **Dark theme** optimized for trading
- **API Routes** to integrate with Python backend

### Backend (Python)
- Volume Cumulative Delta calculation
- Backtesting engine
- Trade signal generation
- Performance metrics calculation

## Getting Started

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python main.py
```

## How It Works

1. User clicks "Run Backtest" button in the web interface
2. Next.js API route (`/api/backtest`) is called
3. API route executes the Python backtest script
4. Results are formatted and returned to the frontend
5. TradingView Lightweight Charts render the data
6. Performance metrics are displayed

## Next Steps (After Approval)

1. **Modify Python script** to output JSON data for the API
2. **Integrate Databento** for real market data
3. **Add more chart features** (volume bars, indicators, etc.)
4. **Add strategy parameters** (adjustable thresholds, position sizing)
5. **Export functionality** (download trades, reports)

## Technology Stack

- **Frontend:** Next.js 14, React 18, Lightweight Charts 4.1
- **Backend:** Python 3, Pandas, NumPy
- **Styling:** CSS3 (Dark theme)
- **Data Integration:** Next.js API Routes

## Chart Components

All chart components use TradingView's Lightweight Charts library:

- **PriceChart:** Line series with trade markers (entry/exit signals)
- **DeltaChart:** Histogram series showing cumulative delta (green/red)
- **EquityChart:** Area series showing portfolio equity over time

Each chart is:
- Fully responsive
- Synchronized time axis
- Interactive (zoom, pan, crosshair)
- Dark themed to match trading platforms
