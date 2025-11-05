import { useState } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';

const EquityChart = dynamic(() => import('@/components/EquityChart'), {
  ssr: false,
});

export default function Backtest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [equityData, setEquityData] = useState(null);
  const [metrics, setMetrics] = useState(null);

  const runBacktest = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/backtest');

      if (!response.ok) {
        throw new Error('Failed to run backtest');
      }

      const data = await response.json();

      setEquityData(data.equity_curve);
      setMetrics(data.metrics);

    } catch (err) {
      setError(err.message);
      console.error('Error running backtest:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Backtest - Volume Delta Trading</title>
        <meta name="description" content="Backtest results" />
      </Head>

      <div className="page-container">
        <div className="page-header">
          <div>
            <h1>Backtest Results</h1>
            <p className="page-description">
              Test Volume Cumulative Delta strategy on historical Gold data
            </p>
          </div>
          <button
            className="btn"
            onClick={runBacktest}
            disabled={loading}
          >
            {loading ? 'Running...' : 'Run Backtest'}
          </button>
        </div>

        {error && (
          <div className="error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading && (
          <div className="loading">
            Running backtest...
          </div>
        )}

        {!loading && equityData && (
          <>
            <div className="chart-section">
              <h2>Equity Curve</h2>
              <EquityChart data={equityData} />
            </div>

            {metrics && (
              <div className="metrics-section">
                <h2>Performance Metrics</h2>
                <div className="metrics-grid">
                  <div className="metric">
                    <span className="metric-label">Total Return</span>
                    <span className={`metric-value ${metrics.total_return >= 0 ? 'positive' : 'negative'}`}>
                      {metrics.total_return >= 0 ? '+' : ''}{metrics.total_return}%
                    </span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Total Trades</span>
                    <span className="metric-value">{metrics.total_trades}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Win Rate</span>
                    <span className="metric-value">{metrics.win_rate}%</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Profit Factor</span>
                    <span className="metric-value">{metrics.profit_factor}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Average Win</span>
                    <span className="metric-value positive">${metrics.avg_win}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Average Loss</span>
                    <span className="metric-value negative">${metrics.avg_loss}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Final Capital</span>
                    <span className="metric-value">${metrics.final_capital}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Winning Trades</span>
                    <span className="metric-value positive">{metrics.winning_trades}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Losing Trades</span>
                    <span className="metric-value negative">{metrics.losing_trades}</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {!loading && !equityData && !error && (
          <div className="empty-state">
            <div className="empty-icon">⚡</div>
            <h3>No Backtest Run</h3>
            <p>Click &quot;Run Backtest&quot; to test the strategy</p>
          </div>
        )}
      </div>
    </>
  );
}
