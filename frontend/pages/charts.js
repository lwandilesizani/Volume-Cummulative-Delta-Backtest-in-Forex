import { useState } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';

// Dynamically import charts to avoid SSR issues
const PriceChart = dynamic(() => import('@/components/PriceChart'), {
  ssr: false,
});
const DeltaChart = dynamic(() => import('@/components/DeltaChart'), {
  ssr: false,
});

export default function Charts() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [priceData, setPriceData] = useState(null);
  const [deltaData, setDeltaData] = useState(null);

  const loadChartData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chart-data');

      if (!response.ok) {
        throw new Error('Failed to fetch chart data');
      }

      const data = await response.json();

      setPriceData(data.price_data);
      setDeltaData(data.delta_data);

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
        <div className="page-header">
          <div>
            <h1>Trading Charts</h1>
            <p className="page-description">
              Visualize Gold futures price action and cumulative volume delta
            </p>
          </div>
          <button
            className="btn"
            onClick={loadChartData}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load Data'}
          </button>
        </div>

        {error && (
          <div className="error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading && (
          <div className="loading">
            Loading chart data...
          </div>
        )}

        {!loading && priceData && (
          <div className="charts-grid">
            <div className="chart-section">
              <h2>Price Chart</h2>
              <PriceChart data={priceData} signals={[]} />
            </div>

            <div className="chart-section">
              <h2>Cumulative Delta</h2>
              <DeltaChart data={deltaData} />
            </div>
          </div>
        )}

        {!loading && !priceData && !error && (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>No Data Loaded</h3>
            <p>Click "Load Data" to visualize Gold futures charts</p>
          </div>
        )}
      </div>
    </>
  );
}
