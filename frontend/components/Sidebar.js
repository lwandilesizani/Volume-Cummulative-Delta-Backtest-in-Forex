import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Sidebar() {
  const router = useRouter();

  const menuItems = [
    { name: 'Start', path: '/', icon: '🏠' },
    { name: 'Charts', path: '/charts', icon: '📊' },
    { name: 'Backtest', path: '/backtest', icon: '⚡' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">Volume Delta</h2>
        <p className="sidebar-subtitle">Trading System</p>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`sidebar-link ${router.pathname === item.path ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-text">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-info">
          <p className="info-label">Market</p>
          <p className="info-value">Gold (GC)</p>
        </div>
        <div className="sidebar-info">
          <p className="info-label">Data Range</p>
          <p className="info-value">2020-2023</p>
        </div>
      </div>
    </div>
  );
}
