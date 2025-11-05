import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  try {
    // Read the OHLCV data
    const ohlcvPath = path.join(process.cwd(), '../backend/Data/ohlcv_1m_GC.c.0_2020-01-01_2023-12-31.csv');
    const processedPath = path.join(process.cwd(), '../backend/Data/processed-data.csv');

    const ohlcvData = fs.readFileSync(ohlcvPath, 'utf-8');
    const processedData = fs.readFileSync(processedPath, 'utf-8');

    // Parse OHLCV CSV
    const ohlcvLines = ohlcvData.trim().split('\n');
    const ohlcvHeaders = ohlcvLines[0].split(',');

    const candlestickData = [];
    const volumeData = [];

    for (let i = 1; i < ohlcvLines.length; i++) {
      const values = ohlcvLines[i].split(',');
      const timestamp = new Date(values[0]).getTime() / 1000; // Convert to seconds

      candlestickData.push({
        time: timestamp,
        open: parseFloat(values[4]),
        high: parseFloat(values[5]),
        low: parseFloat(values[6]),
        close: parseFloat(values[7]),
      });

      volumeData.push({
        time: timestamp,
        value: parseFloat(values[8]),
        color: parseFloat(values[7]) >= parseFloat(values[4]) ? '#26a69a' : '#ef5350',
      });
    }

    // Parse processed data for delta
    const processedLines = processedData.trim().split('\n');
    const deltaData = [];

    for (let i = 1; i < processedLines.length; i++) {
      const values = processedLines[i].split(',');
      const timestamp = new Date(values[0]).getTime() / 1000;
      const delta = parseFloat(values[5]); // Use pre-calculated delta from column 5
      const cumulativeDelta = parseFloat(values[6]);

      deltaData.push({
        time: timestamp,
        value: delta,
        color: delta >= 0 ? '#26a69a' : '#ef5350',
        cumulativeDelta: cumulativeDelta,
      });
    }

    // Return the data
    res.status(200).json({
      candlestickData: candlestickData,
      volumeData: volumeData,
      deltaData: deltaData,
      stats: {
        totalBars: candlestickData.length,
        startDate: candlestickData[0]?.time,
        endDate: candlestickData[candlestickData.length - 1]?.time,
      }
    });
  } catch (error) {
    console.error('Error reading chart data:', error);
    res.status(500).json({ error: 'Failed to load chart data', message: error.message });
  }
}
