import { Link } from 'react-router-dom';
import { MOCK_STOCKS, IDX_SECTORS, formatVolume, getCandleData } from '@/data/mockStocks';
import { Search, ArrowUpRight, ArrowDownRight, Save } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';

type SortKey = 'ticker' | 'price' | 'changePercent' | 'volume' | 'marketCap' | 'per' | 'pbv' | 'roe';

type ScreenerState = {
  search: string;
  sectorFilter: string;
  filters: {
    volumeAboveMA: boolean;
    breakoutMA50: boolean;
    rsiAbove50: boolean;
    perLow: boolean;
    pbvBelow1: boolean;
  };
  sort: { key: SortKey; direction: 'asc' | 'desc' };
};

type ScreenerPreset = {
  id: string;
  name: string;
  state: ScreenerState;
};

function getLatestMA50(ticker: string) {
  const candles = getCandleData(ticker, 120);
  if (candles.length < 50) return null;
  const recent = candles.slice(-50);
  return recent.reduce((sum, candle) => sum + candle.close, 0) / 50;
}

export default function ScreenerPage() {
  const [search, setSearch] = useLocalStorage('idxpulse:screener:search', '');
  const [sectorFilter, setSectorFilter] = useLocalStorage('idxpulse:screener:sector', '');
  const [filters, setFilters] = useLocalStorage('idxpulse:screener:filters', {
    volumeAboveMA: false,
    breakoutMA50: false,
    rsiAbove50: false,
    perLow: false,
    pbvBelow1: false,
  });
  const [sort, setSort] = useLocalStorage<{ key: SortKey; direction: 'asc' | 'desc' }>('idxpulse:screener:sort', {
    key: 'changePercent',
    direction: 'desc',
  });
  const [presets, setPresets] = useLocalStorage<ScreenerPreset[]>('idxpulse:screener:presets', []);

  let filtered = [...MOCK_STOCKS];
  const avgVolume = MOCK_STOCKS.reduce((sum, stock) => sum + stock.volume, 0) / MOCK_STOCKS.length;

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
  if (filters.breakoutMA50) filtered = filtered.filter(stock => {
    const ma50 = getLatestMA50(stock.ticker);
    return ma50 !== null && stock.price > ma50;
  });
  if (filters.volumeAboveMA) filtered = filtered.filter(s => s.volume > avgVolume);

  filtered = filtered.sort((a, b) => {
    const aValue = a[sort.key];
    const bValue = b[sort.key];
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sort.direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    const diff = Number(aValue) - Number(bValue);
    return sort.direction === 'asc' ? diff : -diff;
  });

  const toggleSort = (key: SortKey) => {
    setSort(current => {
      if (current.key === key) {
        return { ...current, direction: current.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'desc' };
    });
  };

  const resetFilters = () => {
    setSearch('');
    setSectorFilter('');
    setFilters({
      volumeAboveMA: false,
      breakoutMA50: false,
      rsiAbove50: false,
      perLow: false,
      pbvBelow1: false,
    });
    setSort({ key: 'changePercent', direction: 'desc' });
  };

  const savePreset = () => {
    const name = window.prompt('Nama preset screener:');
    if (!name) return;

    const state: ScreenerState = { search, sectorFilter, filters, sort };
    const newPreset: ScreenerPreset = {
      id: Date.now().toString(),
      name,
      state,
    };

    setPresets(current => [newPreset, ...current].slice(0, 8));
  };

  const applyPreset = (preset: ScreenerPreset) => {
    setSearch(preset.state.search);
    setSectorFilter(preset.state.sectorFilter);
    setFilters(preset.state.filters);
    setSort(preset.state.sort);
  };

  const deletePreset = (id: string) => {
    setPresets(current => current.filter(preset => preset.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Screener Saham IDX</h1>
        <span className="text-xs text-muted-foreground">{filtered.length} hasil</span>
      </div>

      <div className="glass-card p-3 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground">Preset Screener</h3>
          <button onClick={savePreset} className="px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-secondary/50 inline-flex items-center gap-1">
            <Save className="w-3 h-3" /> Simpan Preset
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {presets.length === 0 && <span className="text-xs text-muted-foreground">Belum ada preset tersimpan.</span>}
          {presets.map(preset => (
            <div key={preset.id} className="inline-flex items-center rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => applyPreset(preset)}
                className="px-2.5 py-1.5 text-xs bg-secondary/30 hover:bg-secondary/60"
              >
                {preset.name}
              </button>
              <button
                onClick={() => deletePreset(preset.id)}
                className="px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground border-l border-border"
              >
                ×
              </button>
            </div>
          ))}
        </div>
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
            { key: 'breakoutMA50', label: 'Breakout MA50' },
            { key: 'volumeAboveMA', label: 'Volume > Rata-rata' },
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
          <button
            onClick={resetFilters}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border bg-secondary/50 border-border text-muted-foreground hover:text-foreground"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {[
                  { key: 'ticker', label: 'Ticker', sortable: true },
                  { key: 'price', label: 'Harga', sortable: true },
                  { key: 'changePercent', label: 'Chg%', sortable: true },
                  { key: 'volume', label: 'Volume', sortable: true },
                  { key: 'marketCap', label: 'Mkt Cap', sortable: true },
                  { key: 'per', label: 'PER', sortable: true },
                  { key: 'pbv', label: 'PBV', sortable: true },
                  { key: 'roe', label: 'ROE', sortable: true },
                  { key: 'sector', label: 'Sektor', sortable: false },
                ].map(h => (
                  <th key={h.key} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {h.sortable ? (
                      <button
                        onClick={() => toggleSort(h.key as SortKey)}
                        className="inline-flex items-center gap-1 hover:text-foreground"
                      >
                        {h.label}
                        {sort.key === h.key && <span>{sort.direction === 'asc' ? '↑' : '↓'}</span>}
                      </button>
                    ) : h.label}
                  </th>
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
