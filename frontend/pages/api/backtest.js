import { spawn } from 'child_process';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Path to the Python script
    const pythonScript = path.join(process.cwd(), '..', 'backend', 'main.py');

    // Spawn Python process
    const pythonProcess = spawn('python3', [pythonScript]);

    let dataString = '';
    let errorString = '';

    // Collect data from Python script
    pythonProcess.stdout.on('data', (data) => {
      dataString += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorString += data.toString();
    });

    // Handle process completion
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('Python process error:', errorString);
        return res.status(500).json({
          error: 'Backtest execution failed',
          details: errorString
        });
      }

      try {
        // For now, we'll return mock data since the Python script
        // doesn't output JSON yet. We'll modify it next.
        const mockData = generateMockData();
        return res.status(200).json(mockData);
      } catch (error) {
        console.error('Error parsing backtest results:', error);
        return res.status(500).json({
          error: 'Failed to parse backtest results',
          details: error.message
        });
      }
    });

  } catch (error) {
    console.error('Error running backtest:', error);
    return res.status(500).json({
      error: 'Failed to run backtest',
      details: error.message
    });
  }
}

// Temporary mock data generator until we modify Python script
function generateMockData() {
  const now = Date.now() / 1000;
  const data = [];
  const signals = [];
  const equityCurve = [];

  let equity = 10000;
  let cumulativeDelta = 0;

  for (let i = 0; i < 720; i++) {
    const time = now - (720 - i) * 3600;
    const price = 1.1000 + Math.sin(i / 50) * 0.01 + (Math.random() - 0.5) * 0.0005;
    const delta = (Math.random() - 0.5) * 200;
    cumulativeDelta += delta;

    data.push({
      time: Math.floor(time),
      close: price,
      cumulative_delta: cumulativeDelta,
    });

    // Add some signals
    if (i % 50 === 0 && i > 0) {
      signals.push({
        time: Math.floor(time),
        type: i % 100 === 0 ? 'entry' : 'exit',
      });
    }

    // Simulate equity changes
    if (i % 50 === 0) {
      equity += (Math.random() - 0.4) * 500;
    }

    equityCurve.push({
      time: Math.floor(time),
      equity: equity,
    });
  }

  return {
    price_data: data.map(d => ({ time: d.time, close: d.close })),
    delta_data: data.map(d => ({ time: d.time, cumulative_delta: d.cumulative_delta })),
    equity_curve: equityCurve,
    signals: signals,
    metrics: {
      total_return: 15.34,
      total_trades: 14,
      win_rate: 57.14,
      profit_factor: 1.42,
      avg_win: 156.23,
      avg_loss: 98.45,
      final_capital: 11534.00,
      winning_trades: 8,
      losing_trades: 6,
    },
  };
}
