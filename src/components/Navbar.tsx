import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Newspaper, BookOpen, Search, TrendingUp, Activity, Home } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/screener', label: 'Screener', icon: Search },
  { path: '/journal', label: 'Journal', icon: BookOpen },
  { path: '/news', label: 'News', icon: Newspaper },
  { path: '/bid-offer', label: 'Bid-Offer', icon: Activity },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <header className="h-14 border-b border-border bg-card/90 backdrop-blur-xl sticky top-0 z-50 flex items-center px-4 gap-6">
      <Link to="/" className="flex items-center gap-2 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-bold text-lg tracking-tight text-foreground">
          IDX<span className="text-primary">Pulse</span>
        </span>
      </Link>

      <nav className="flex items-center gap-1 overflow-x-auto">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="ml-auto flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="pulse-dot" />
          <span className="font-mono">IHSG 7,245.82</span>
          <span className="ticker-bullish text-xs">+0.45%</span>
        </div>
      </div>
    </header>
  );
}
