import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MOCK_STOCKS, IDX_SECTORS, formatVolume, type StockData } from '@/data/mockStocks';
import { Search, Filter, ArrowUpRight, ArrowDownRight, ChevronDown } from 'lucide-react';

export default function ScreenerPage() {
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
  const [filters, setFilters] = useState({
    volumeAboveMA: false,
    breakoutMA50: false,
    rsiAbove50: false,
    perLow: false,
    pbvBelow1: false,
  });

  let filtered = [...MOCK_STOCKS];

  if (search) {
    const q = search.toUpperCase();
    filtered = filtered.filter(s => s.ticker.includes(q) || s.name.toUpperCase().includes(q));
  }
  if (sectorFilter) {
    filtered = filtered.filter(s => s.sector === sectorFilter);
  }
  if (filters.perLow) filtered = filtered.filter(s => s.per > 0 && s.per < 15);
  if (filters.pbvBelow1) filtered = filtered.filter(s => s.pbv < 1);
  if (filters.rsiAbove50) filtered = filtered.filter(s => s.changePercent > 0);
  if (filters.breakoutMA50) filtered = filtered.filter(s => s.price > s.prevClose * 1.01);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Screener Saham IDX</h1>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari ticker atau nama..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <select
            value={sectorFilter}
            onChange={e => setSectorFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Semua Sektor</option>
            {IDX_SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { key: 'perLow', label: 'PER < 15' },
            { key: 'pbvBelow1', label: 'PBV < 1' },
            { key: 'rsiAbove50', label: 'Bullish today' },
            { key: 'breakoutMA50', label: 'Breakout' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilters(f => ({ ...f, [key]: !f[key as keyof typeof f] }))}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                filters[key as keyof typeof filters]
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-secondary/50 border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Ticker', 'Harga', 'Chg%', 'Volume', 'Mkt Cap', 'PER', 'PBV', 'ROE', 'Sektor'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.ticker} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/stock/${s.ticker}`} className="flex items-center gap-2 group">
                      <span className="font-mono font-semibold text-foreground group-hover:text-primary transition-colors">{s.ticker}</span>
                      <ArrowUpRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                    </Link>
                  </td>
                  <td className="px-4 py-3 data-cell text-foreground">{s.price.toLocaleString()}</td>
                  <td className={`px-4 py-3 data-cell ${s.changePercent >= 0 ? 'ticker-bullish' : 'ticker-bearish'}`}>
                    <span className="flex items-center gap-1">
                      {s.changePercent >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {s.changePercent >= 0 ? '+' : ''}{s.changePercent.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 data-cell text-muted-foreground">{formatVolume(s.volume)}</td>
                  <td className="px-4 py-3 data-cell text-muted-foreground">{s.marketCap >= 1e15 ? `${(s.marketCap / 1e12).toFixed(0)}T` : `${(s.marketCap / 1e12).toFixed(1)}T`}</td>
                  <td className={`px-4 py-3 data-cell ${s.per < 0 ? 'text-bearish' : s.per < 15 ? 'text-bullish' : 'text-foreground'}`}>{s.per.toFixed(1)}</td>
                  <td className={`px-4 py-3 data-cell ${s.pbv < 1 ? 'text-bullish' : 'text-foreground'}`}>{s.pbv.toFixed(1)}</td>
                  <td className={`px-4 py-3 data-cell ${s.roe > 15 ? 'text-bullish' : 'text-foreground'}`}>{s.roe.toFixed(1)}%</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{s.sector}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm">Tidak ada saham yang cocok dengan filter.</div>
        )}
      </div>
    </div>
  );
}
