import Head from 'next/head';
import Link from 'next/link';

export default function Start() {
  return (
    <>
      <Head>
        <title>Start - Volume Delta Trading</title>
        <meta name="description" content="Volume Cumulative Delta Trading System" />
      </Head>

      <div className="page-container">
        <div className="start-page">
          <div className="hero-section">
            <h1 className="hero-title">Volume Cumulative Delta</h1>
            <p className="hero-subtitle">
              Advanced order flow analysis for Gold futures trading
            </p>
            <div className="hero-stats">
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <h3>219,916</h3>
                  <p>Trade Ticks</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📈</div>
                <div className="stat-content">
                  <h3>48,895</h3>
                  <p>1-Min Bars</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-content">
                  <h3>2020-2023</h3>
                  <p>Date Range</p>
                </div>
              </div>
            </div>
          </div>

          <div className="features-section">
            <h2>Get Started</h2>
            <div className="features-grid">
              <Link href="/charts" className="feature-card">
                <div className="feature-icon">📊</div>
                <h3>View Charts</h3>
                <p>Visualize price action and cumulative volume delta for Gold futures</p>
                <span className="feature-arrow">→</span>
              </Link>

              <Link href="/backtest" className="feature-card">
                <div className="feature-icon">⚡</div>
                <h3>Run Backtest</h3>
                <p>Test the Volume Delta strategy on historical data and analyze performance</p>
                <span className="feature-arrow">→</span>
              </Link>
            </div>
          </div>

          <div className="info-section">
            <h2>About This System</h2>
            <div className="info-grid">
              <div className="info-card">
                <h4>📡 Data Source</h4>
                <p>Real tick-by-tick trade data from Databento (GLBX.MDP3)</p>
              </div>
              <div className="info-card">
                <h4>💹 Market</h4>
                <p>Gold Futures (GC.c.0) continuous contract</p>
              </div>
              <div className="info-card">
                <h4>⚙️ Strategy</h4>
                <p>Volume Cumulative Delta with threshold-based signals</p>
              </div>
              <div className="info-card">
                <h4>📊 Charts</h4>
                <p>TradingView Lightweight Charts for professional visualization</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
