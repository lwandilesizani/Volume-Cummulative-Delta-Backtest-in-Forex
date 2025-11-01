import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json

class VolumeCumulativeDeltaBacktest:
    """
    A backtesting engine for analyzing the impact of futures volume 
    on market price movements using cumulative delta.
    """
    
    def __init__(self, initial_capital=10000):
        self.initial_capital = initial_capital
        self.capital = initial_capital
        self.positions = []
        self.trades = []
        self.equity_curve = []
        
    def calculate_cumulative_delta(self, data):
        """
        Calculate cumulative delta from volume data.
        Cumulative delta = sum of (buy_volume - sell_volume)
        """
        data['delta'] = data['buy_volume'] - data['sell_volume']
        data['cumulative_delta'] = data['delta'].cumsum()
        return data
    
    def generate_signals(self, data, threshold=1000):
        """
        Generate trading signals based on cumulative delta.
        Buy when cumulative delta crosses above threshold
        Sell when cumulative delta crosses below -threshold
        """
        data['signal'] = 0
        
        # Buy signal when cumulative delta increases above threshold
        data.loc[data['cumulative_delta'] > threshold, 'signal'] = 1
        
        # Sell signal when cumulative delta drops below -threshold
        data.loc[data['cumulative_delta'] < -threshold, 'signal'] = -1
        
        return data
    
    def backtest(self, data, position_size=0.1):
        """
        Execute backtest with the given data and position size.
        position_size: fraction of capital to risk per trade (0.1 = 10%)
        """
        position = 0
        entry_price = 0
        
        for i in range(1, len(data)):
            current_price = data['close'].iloc[i]
            signal = data['signal'].iloc[i]
            prev_signal = data['signal'].iloc[i-1]
            
            # Enter long position
            if signal == 1 and prev_signal != 1 and position == 0:
                position = (self.capital * position_size) / current_price
                entry_price = current_price
                self.positions.append({
                    'type': 'LONG',
                    'entry_price': entry_price,
                    'entry_time': data.index[i],
                    'size': position
                })
            
            # Exit long position
            elif signal == -1 and position > 0:
                pnl = (current_price - entry_price) * position
                self.capital += pnl
                self.trades.append({
                    'entry_price': entry_price,
                    'exit_price': current_price,
                    'pnl': pnl,
                    'return': (current_price - entry_price) / entry_price * 100,
                    'exit_time': data.index[i]
                })
                position = 0
                entry_price = 0
            
            # Track equity
            if position > 0:
                unrealized_pnl = (current_price - entry_price) * position
                current_equity = self.capital + unrealized_pnl
            else:
                current_equity = self.capital
            
            self.equity_curve.append({
                'time': data.index[i],
                'equity': current_equity
            })
    
    def get_performance_metrics(self):
        """Calculate and return performance metrics."""
        if not self.trades:
            return {
                'total_trades': 0,
                'final_capital': self.capital,
                'total_return': 0,
                'win_rate': 0,
                'avg_win': 0,
                'avg_loss': 0,
                'profit_factor': 0
            }
        
        trades_df = pd.DataFrame(self.trades)
        winning_trades = trades_df[trades_df['pnl'] > 0]
        losing_trades = trades_df[trades_df['pnl'] < 0]
        
        total_return = ((self.capital - self.initial_capital) / self.initial_capital) * 100
        win_rate = len(winning_trades) / len(trades_df) * 100 if len(trades_df) > 0 else 0
        
        avg_win = winning_trades['pnl'].mean() if len(winning_trades) > 0 else 0
        avg_loss = abs(losing_trades['pnl'].mean()) if len(losing_trades) > 0 else 0
        
        total_wins = winning_trades['pnl'].sum() if len(winning_trades) > 0 else 0
        total_losses = abs(losing_trades['pnl'].sum()) if len(losing_trades) > 0 else 1
        profit_factor = total_wins / total_losses if total_losses > 0 else 0
        
        return {
            'total_trades': len(trades_df),
            'winning_trades': len(winning_trades),
            'losing_trades': len(losing_trades),
            'final_capital': round(self.capital, 2),
            'total_return': round(total_return, 2),
            'win_rate': round(win_rate, 2),
            'avg_win': round(avg_win, 2),
            'avg_loss': round(avg_loss, 2),
            'profit_factor': round(profit_factor, 2)
        }


def generate_sample_data(days=30):
    """Generate sample forex data with volume for testing."""
    np.random.seed(42)
    
    dates = pd.date_range(end=datetime.now(), periods=days*24, freq='h')
    
    # Generate price data with some trend
    price = 1.1000
    prices = [price]
    
    for _ in range(len(dates) - 1):
        change = np.random.normal(0, 0.0005)
        price += change
        prices.append(price)
    
    # Generate volume data
    volumes = np.random.randint(1000, 10000, len(dates))
    
    # Simulate buy/sell volume split with some correlation to price movement
    buy_volume = []
    sell_volume = []
    
    for i in range(len(dates)):
        total_vol = volumes[i]
        if i > 0:
            price_change = prices[i] - prices[i-1]
            # More buying when price goes up, more selling when price goes down
            buy_ratio = 0.5 + (price_change / 0.001) * 0.1
            buy_ratio = max(0.3, min(0.7, buy_ratio))
        else:
            buy_ratio = 0.5
        
        buy_vol = int(total_vol * buy_ratio)
        sell_vol = total_vol - buy_vol
        
        buy_volume.append(buy_vol)
        sell_volume.append(sell_vol)
    
    data = pd.DataFrame({
        'close': prices,
        'volume': volumes,
        'buy_volume': buy_volume,
        'sell_volume': sell_volume
    }, index=dates)
    
    return data


def main():
    print("=" * 60)
    print("Volume Cumulative Delta Backtest Engine")
    print("=" * 60)
    print()
    
    # Generate sample data
    print("Generating sample forex data...")
    data = generate_sample_data(days=30)
    print(f"Generated {len(data)} data points (30 days of hourly data)")
    print()
    
    # Initialize backtest engine
    initial_capital = 10000
    backtest = VolumeCumulativeDeltaBacktest(initial_capital=initial_capital)
    
    # Calculate cumulative delta
    print("Calculating cumulative delta...")
    data = backtest.calculate_cumulative_delta(data)
    print(f"Cumulative delta range: {data['cumulative_delta'].min():.0f} to {data['cumulative_delta'].max():.0f}")
    print()
    
    # Generate signals
    print("Generating trading signals...")
    threshold = 500
    data = backtest.generate_signals(data, threshold=threshold)
    signals_count = data[data['signal'] != 0].shape[0]
    print(f"Generated {signals_count} trading signals (threshold: ±{threshold})")
    print()
    
    # Run backtest
    print("Running backtest...")
    backtest.backtest(data, position_size=0.1)
    print("Backtest complete!")
    print()
    
    # Display results
    print("=" * 60)
    print("PERFORMANCE METRICS")
    print("=" * 60)
    metrics = backtest.get_performance_metrics()
    
    print(f"Initial Capital:    ${metrics.get('final_capital', initial_capital) - (metrics.get('final_capital', initial_capital) - initial_capital):.2f}")
    print(f"Final Capital:      ${metrics['final_capital']:.2f}")
    print(f"Total Return:       {metrics['total_return']:.2f}%")
    print(f"Total Trades:       {metrics['total_trades']}")
    print(f"Winning Trades:     {metrics['winning_trades']}")
    print(f"Losing Trades:      {metrics['losing_trades']}")
    print(f"Win Rate:           {metrics['win_rate']:.2f}%")
    print(f"Average Win:        ${metrics['avg_win']:.2f}")
    print(f"Average Loss:       ${metrics['avg_loss']:.2f}")
    print(f"Profit Factor:      {metrics['profit_factor']:.2f}")
    print("=" * 60)
    print()
    
    # Show sample trades
    if backtest.trades:
        print("Sample Trades (first 5):")
        print("-" * 60)
        for i, trade in enumerate(backtest.trades[:5]):
            print(f"Trade {i+1}:")
            print(f"  Entry: ${trade['entry_price']:.5f} | Exit: ${trade['exit_price']:.5f}")
            print(f"  P&L: ${trade['pnl']:.2f} ({trade['return']:.2f}%)")
        print()
    
    print("Backtest completed successfully!")
    print()


if __name__ == "__main__":
    main()
