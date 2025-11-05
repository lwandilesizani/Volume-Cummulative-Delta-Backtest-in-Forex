import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';

// Dynamically import chart to avoid SSR issues
const PriceChart = dynamic(() => import('@/components/PriceChart'), {
  ssr: false,
});

export default function Charts() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [priceData, setPriceData] = useState(null);
  const [deltaData, setDeltaData] = useState(null);

  useEffect(() => {
    loadChartData();
  }, []);

  const loadChartData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chart-data');

      if (!response.ok) {
        throw new Error('Failed to fetch chart data');
      }

      const data = await response.json();

      setPriceData({
        candlestick: data.candlestickData,
        volume: data.volumeData,
        stats: data.stats
      });
      setDeltaData(data.deltaData);

    } catch (err) {
      setError(err.message);
      console.error('Error loading chart data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Charts - Volume Delta Trading</title>
        <meta name="description" content="Trading charts visualization" />
      </Head>

      <div className="page-container">
        {error && (
          <div className="error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading && (
          <div className="loading">
            Loading Gold futures chart data (48,895 bars)...
          </div>
        )}

        {!loading && priceData && (
          <>
            <div className="metrics-section" style={{ marginBottom: '24px' }}>
              <h2>Dataset Statistics</h2>
              <div className="metrics-grid">
                <div className="metric">
                  <div className="metric-label">Total Bars</div>
                  <div className="metric-value">{priceData.stats?.totalBars?.toLocaleString() || 'N/A'}</div>
                </div>
                <div className="metric">
                  <div className="metric-label">Start Date</div>
                  <div className="metric-value">
                    {priceData.stats?.startDate ? new Date(priceData.stats.startDate * 1000).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                <div className="metric">
                  <div className="metric-label">End Date</div>
                  <div className="metric-value">
                    {priceData.stats?.endDate ? new Date(priceData.stats.endDate * 1000).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            <div className="chart-section">
              <h2>📊 Gold Futures (GC) - 1-Minute Chart with Cumulative Delta</h2>
              <PriceChart data={priceData} deltaData={deltaData} />
            </div>
          </>
        )}
      </div>
    </>
  );
}
