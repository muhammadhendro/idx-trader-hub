import { Link } from 'react-router-dom';
import { MOCK_STOCKS, formatRupiah, formatVolume } from '@/data/mockStocks';
import { TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';

export default function MarketOverview() {
  const topGainers = [...MOCK_STOCKS].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
  const topLosers = [...MOCK_STOCKS].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);
  const topVolume = [...MOCK_STOCKS].sort((a, b) => b.volume - a.volume).slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Top Gainers */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-bullish" />
          <h3 className="text-sm font-semibold text-foreground">Top Gainers</h3>
        </div>
        <div className="space-y-2">
          {topGainers.map(s => (
            <Link key={s.ticker} to={`/stock/${s.ticker}`} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-secondary/50 transition-colors group">
              <div>
                <span className="font-mono font-semibold text-sm text-foreground">{s.ticker}</span>
                <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">{s.name.split(' ')[0]}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="data-cell text-foreground">{s.price.toLocaleString()}</span>
                <span className="data-cell ticker-bullish text-xs">+{s.changePercent.toFixed(2)}%</span>
                <ArrowUpRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Top Losers */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingDown className="w-4 h-4 text-bearish" />
          <h3 className="text-sm font-semibold text-foreground">Top Losers</h3>
        </div>
        <div className="space-y-2">
          {topLosers.map(s => (
            <Link key={s.ticker} to={`/stock/${s.ticker}`} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-secondary/50 transition-colors group">
              <div>
                <span className="font-mono font-semibold text-sm text-foreground">{s.ticker}</span>
                <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">{s.name.split(' ')[0]}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="data-cell text-foreground">{s.price.toLocaleString()}</span>
                <span className="data-cell ticker-bearish text-xs">{s.changePercent.toFixed(2)}%</span>
                <ArrowUpRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Top Volume */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Top Volume</h3>
        </div>
        <div className="space-y-2">
          {topVolume.map(s => (
            <Link key={s.ticker} to={`/stock/${s.ticker}`} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-secondary/50 transition-colors group">
              <div>
                <span className="font-mono font-semibold text-sm text-foreground">{s.ticker}</span>
                <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">{s.name.split(' ')[0]}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`data-cell text-xs ${s.change >= 0 ? 'ticker-bullish' : 'ticker-bearish'}`}>
                  {s.change >= 0 ? '+' : ''}{s.changePercent.toFixed(2)}%
                </span>
                <span className="data-cell text-muted-foreground text-xs">{formatVolume(s.volume)}</span>
                <ArrowUpRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
