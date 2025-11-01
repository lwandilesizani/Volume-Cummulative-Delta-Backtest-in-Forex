import { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';

export default function PriceChart({ data, signals }) {
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const seriesRef = useRef();
  const markersRef = useRef([]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: '#131722' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: '#1e222d' },
        horzLines: { color: '#1e222d' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#2B2B43',
      },
      timeScale: {
        borderColor: '#2B2B43',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // Add candlestick series
    const series = chart.addLineSeries({
      color: '#2962FF',
      lineWidth: 2,
    });

    chartRef.current = chart;
    seriesRef.current = series;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current || !data) return;

    // Convert data to lightweight-charts format
    const formattedData = data.map(item => ({
      time: item.time,
      value: item.close,
    }));

    seriesRef.current.setData(formattedData);

    // Add markers for entry/exit signals
    if (signals && signals.length > 0) {
      const markers = signals.map(signal => ({
        time: signal.time,
        position: signal.type === 'entry' ? 'belowBar' : 'aboveBar',
        color: signal.type === 'entry' ? '#26a69a' : '#ef5350',
        shape: signal.type === 'entry' ? 'arrowUp' : 'arrowDown',
        text: signal.type === 'entry' ? 'Entry' : 'Exit',
      }));

      seriesRef.current.setMarkers(markers);
      markersRef.current = markers;
    }

    chartRef.current.timeScale().fitContent();
  }, [data, signals]);

  return <div ref={chartContainerRef} className="chart-container" />;
}
