import { useEffect, useRef, useState, useCallback } from 'react';
import { createChart } from 'lightweight-charts';

export default function PriceChart({ data, deltaData }) {
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const candlestickSeriesRef = useRef();
  const cumulativeDeltaSeriesRef = useRef();
  const [indicatorHeight, setIndicatorHeight] = useState(30);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef();

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart with both left and right price scales
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 700,
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
        visible: true,
      },
      leftPriceScale: {
        borderColor: '#2B2B43',
        visible: true,
      },
      timeScale: {
        borderColor: '#2B2B43',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // Add candlestick series (main chart) - shows price on RIGHT y-axis
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderUpColor: '#26a69a',
      borderDownColor: '#ef5350',
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
      priceScaleId: 'right', // Explicitly use the right price scale
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    });

    // Add cumulative delta line series (indicator at bottom) - shows volume/contracts on LEFT scale
    const cumulativeDeltaSeries = chart.addLineSeries({
      color: '#2962ff',
      lineWidth: 2,
      priceScaleId: 'left', // Use the left price scale for volume/contracts
      title: 'Cumulative Delta (Contracts)',
      priceFormat: {
        type: 'volume',
        precision: 0, // Show whole numbers for contracts
      },
    });

    // Delta histogram removed - only showing cumulative delta line

    // Configure the left scale (for volume indicators in bottom section)
    // This scale shows volume/contract size values
    chart.priceScale('left').applyOptions({
      scaleMargins: {
        top: 0.7, // Start at 70% down (30% height for indicator)
        bottom: 0.01,
      },
      borderColor: '#2B2B43',
      borderVisible: true,
      visible: true,
      autoScale: true,
      mode: 0, // Normal scale mode for volume/contracts
    });

    // Configure the main price scale (for candlesticks in top section)
    // Must end EXACTLY where the indicator window starts to prevent overlap
    chart.priceScale('right').applyOptions({
      scaleMargins: {
        top: 0.01,
        bottom: 0.31, // Must align with delta top margin (1 - 0.7 = 0.3, plus small gap)
      },
      borderColor: '#2B2B43',
      borderVisible: true,
      visible: true,
      autoScale: true,
      mode: 0, // Normal price scale mode for showing price values
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;
    cumulativeDeltaSeriesRef.current = cumulativeDeltaSeries;

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

  // Update indicator height when dragging
  useEffect(() => {
    if (!chartRef.current) return;

    const indicatorHeightDecimal = indicatorHeight / 100;
    // The indicator starts at (1 - indicatorHeightDecimal) from the top
    const indicatorStartPosition = 1 - indicatorHeightDecimal;

    // The main chart must end before the indicator starts (with a 1% gap)
    // If indicator is 30% (0.3), it starts at 0.7
    // Main chart should end at 0.69 (1% gap), so bottom margin = 0.31
    const mainChartBottomMargin = indicatorHeightDecimal + 0.01; // Add 1% gap for separation

    // Update left scale margins for the indicator (bottom section) - for volume/contracts
    chartRef.current.priceScale('left').applyOptions({
      borderColor: '#2B2B43',
      borderVisible: true,
      visible: true,
      scaleMargins: {
        top: indicatorStartPosition,
        bottom: 0.01,
      },
      autoScale: true,
      mode: 0, // Normal scale mode for volume/contracts
    });

    // Update main price scale margins (top section) - for price display on RIGHT
    chartRef.current.priceScale('right').applyOptions({
      scaleMargins: {
        top: 0.01,
        bottom: mainChartBottomMargin,
      },
      borderColor: '#2B2B43',
      borderVisible: true,
      visible: true,
      autoScale: true,
      mode: 0, // Normal price scale mode for showing price values
    });
  }, [indicatorHeight]);

  useEffect(() => {
    if (!candlestickSeriesRef.current || !data) return;

    // Set candlestick data
    if (data.candlestick) {
      candlestickSeriesRef.current.setData(data.candlestick);
    }

    // Fit content to view
    chartRef.current.timeScale().fitContent();
  }, [data]);

  useEffect(() => {
    if (!cumulativeDeltaSeriesRef.current || !deltaData) return;

    // Format cumulative delta data (line)
    const cumulativeData = deltaData.map(item => ({
      time: item.time,
      value: item.cumulativeDelta,
    }));

    cumulativeDeltaSeriesRef.current.setData(cumulativeData);

    // Fit content to view
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, [deltaData]);

  // Handle dragging
  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const chartHeight = 700;
    const mouseY = e.clientY - rect.top;

    // Calculate percentage from bottom (indicator height)
    const percentageFromTop = (mouseY / chartHeight) * 100;
    const newIndicatorHeight = 100 - percentageFromTop;

    // Clamp between 15% and 50%
    const clampedHeight = Math.max(15, Math.min(50, newIndicatorHeight));
    setIndicatorHeight(clampedHeight);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    e.preventDefault();
    e.stopPropagation();
  };

  const dividerPosition = (100 - indicatorHeight);

  return (
    <div ref={containerRef} style={{ position: 'relative', height: '700px', userSelect: 'none' }}>
      {/* Draggable divider */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          position: 'absolute',
          top: `calc(${dividerPosition}% - 10px)`,
          left: 0,
          right: 0,
          height: '20px',
          cursor: 'ns-resize',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{
          width: '100%',
          height: '4px',
          background: isDragging ? '#2962ff' : 'rgba(41, 98, 255, 0.3)',
          transition: isDragging ? 'none' : 'background 0.2s',
        }} />
        {isDragging && (
          <div style={{
            position: 'absolute',
            width: '60px',
            height: '24px',
            background: '#2962ff',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            color: '#ffffff',
            fontWeight: '600',
          }}>
            {Math.round(indicatorHeight)}%
          </div>
        )}
      </div>

      <div ref={chartContainerRef} className="chart-container" style={{ height: '700px', width: '100%' }} />
    </div>
  );
}
