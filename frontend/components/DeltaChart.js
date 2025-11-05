import { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';

export default function DeltaChart({ data }) {
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const deltaSeriesRef = useRef();
  const cumulativeSeriesRef = useRef();

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

    // Add histogram series for instant delta
    const deltaSeries = chart.addHistogramSeries({
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
      scaleMargins: {
        top: 0.1,
        bottom: 0.5,
      },
    });

    // Add line series for cumulative delta
    const cumulativeSeries = chart.addLineSeries({
      color: '#2962ff',
      lineWidth: 2,
      priceScaleId: 'left',
      title: 'Cumulative Delta',
    });

    chartRef.current = chart;
    deltaSeriesRef.current = deltaSeries;
    cumulativeSeriesRef.current = cumulativeSeries;

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
    if (!deltaSeriesRef.current || !cumulativeSeriesRef.current || !data) return;

    // Format instant delta data (histogram) - using absolute value for histogram height
    // Color indicates direction: green = positive delta (more buy volume), red = negative (more sell volume)
    const deltaData = data.map(item => ({
      time: item.time,
      value: Math.abs(item.value), // Histogram requires positive values
      color: item.value >= 0 ? '#26a69a' : '#ef5350',
    }));

    // Format cumulative delta data (line)
    const cumulativeData = data.map(item => ({
      time: item.time,
      value: item.cumulativeDelta,
    }));

    deltaSeriesRef.current.setData(deltaData);
    cumulativeSeriesRef.current.setData(cumulativeData);
    chartRef.current.timeScale().fitContent();
  }, [data]);

  return <div ref={chartContainerRef} className="chart-container" style={{ height: '400px' }} />;
}
