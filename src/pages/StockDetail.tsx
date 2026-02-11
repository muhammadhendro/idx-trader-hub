import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { MOCK_STOCKS, getCandleData, formatRupiah, formatVolume } from '@/data/mockStocks';
import StockChart from '@/components/StockChart';
import { ArrowLeft, ArrowUpRight, ArrowDownRight, TrendingUp, Star } from 'lucide-react';

const TIMEFRAMES = [
  { key: '15m', label: '15m', lookbackDays: 30 },
  { key: '1H', label: '1H', lookbackDays: 90 },
  { key: '1D', label: '1D', lookbackDays: 200 },
] as const;

type Timeframe = (typeof TIMEFRAMES)[number]['key'];

export default function StockDetail() {
  const { ticker } = useParams<{ ticker: string }>();
  const stock = MOCK_STOCKS.find(s => s.ticker === ticker);

  const [timeframe, setTimeframe] = useLocalStorage<Timeframe>('idxpulse:chart:timeframe', '1D');
  const [chartProvider, setChartProvider] = useLocalStorage<'lightweight' | 'tradingview'>('idxpulse:chart:provider', 'lightweight');
  const selectedTimeframe = TIMEFRAMES.find(tf => tf.key === timeframe) ?? TIMEFRAMES[2];
  const candleData = getCandleData(ticker || 'BBCA', selectedTimeframe.lookbackDays);

  if (!stock) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-muted-foreground">Saham {ticker} tidak ditemukan.</p>
        <Link to="/" className="text-primary text-sm hover:underline">← Kembali ke Dashboard</Link>
      </div>
    );
  }

  const [watchlist, setWatchlist] = useLocalStorage<string[]>('idxpulse:watchlist', ['BBCA', 'BMRI', 'TLKM']);
  const inWatchlist = watchlist.includes(stock.ticker);

  const toggleWatchlist = () => {
    setWatchlist(current =>
      current.includes(stock.ticker)
        ? current.filter(t => t !== stock.ticker)
        : [stock.ticker, ...current]
    );
  };


  const tvSymbol = useMemo(() => `IDX:${ticker ?? 'BBCA'}`, [ticker]);

  const bullish = stock.change >= 0;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/" className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-mono text-foreground">{stock.ticker}</h1>
            <button
              onClick={toggleWatchlist}
              className={`p-1.5 rounded-md border transition-colors ${inWatchlist ? 'bg-primary/10 border-primary text-primary' : 'bg-secondary/50 border-border text-muted-foreground hover:text-foreground'}`}
              aria-label="Toggle watchlist"
            >
              <Star className="w-4 h-4" fill={inWatchlist ? 'currentColor' : 'none'} />
            </button>
            <span className="text-sm text-muted-foreground">{stock.name}</span>
            <span className="status-badge bg-secondary text-muted-foreground border border-border">{stock.sector}</span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-2xl font-mono font-bold text-foreground">Rp {stock.price.toLocaleString()}</span>
            <span className={`flex items-center gap-1 data-cell ${bullish ? 'ticker-bullish' : 'ticker-bearish'}`}>
              {bullish ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {bullish ? '+' : ''}{stock.change} ({bullish ? '+' : ''}{stock.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Price Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { label: 'Open', value: stock.open.toLocaleString() },
          { label: 'High', value: stock.high.toLocaleString() },
          { label: 'Low', value: stock.low.toLocaleString() },
          { label: 'Prev Close', value: stock.prevClose.toLocaleString() },
          { label: 'Volume', value: formatVolume(stock.volume) },
          { label: '52W Range', value: `${stock.low52w.toLocaleString()} - ${stock.high52w.toLocaleString()}` },
        ].map(({ label, value }) => (
          <div key={label} className="glass-card p-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-mono text-sm font-semibold text-foreground mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="glass-card p-3 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">Timeframe chart (simulasi data):</p>
        <div className="flex items-center gap-2">
          {TIMEFRAMES.map(tf => (
            <button
              key={tf.key}
              onClick={() => setTimeframe(tf.key)}
              className={`px-2.5 py-1 rounded text-xs border transition-colors ${
                timeframe === tf.key
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-secondary/40 border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card p-3 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">Chart provider:</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setChartProvider('lightweight')}
            className={`px-2.5 py-1 rounded text-xs border ${chartProvider === 'lightweight' ? 'bg-primary/10 border-primary text-primary' : 'bg-secondary/40 border-border text-muted-foreground hover:text-foreground'}`}
          >
            Lightweight
          </button>
          <button
            onClick={() => setChartProvider('tradingview')}
            className={`px-2.5 py-1 rounded text-xs border ${chartProvider === 'tradingview' ? 'bg-primary/10 border-primary text-primary' : 'bg-secondary/40 border-border text-muted-foreground hover:text-foreground'}`}
          >
            TradingView
          </button>
        </div>
      </div>

      {/* Chart */}
      {chartProvider === 'lightweight' ? (
        <StockChart data={candleData} ticker={`${stock.ticker} · ${selectedTimeframe.label}`} />
      ) : (
        <div className="glass-card p-4 space-y-2">
          <h3 className="text-sm font-semibold text-foreground">TradingView Embed (Preview)</h3>
          <p className="text-xs text-muted-foreground">Jika simbol tidak tersedia, gunakan mode Lightweight chart.</p>
          <iframe
            title="TradingView"
            src={`https://s.tradingview.com/widgetembed/?symbol=${encodeURIComponent(tvSymbol)}&interval=D&theme=dark&style=1&withdateranges=1&hide_side_toolbar=0&allow_symbol_change=1&saveimage=0&studies=[]`}
            className="w-full h-[520px] rounded border border-border"
          />
        </div>
      )}

      {/* Fundamentals */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Data Fundamental
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'PER', value: stock.per.toFixed(1), highlight: stock.per > 0 && stock.per < 15 },
            { label: 'PBV', value: stock.pbv.toFixed(1) + 'x', highlight: stock.pbv < 1 },
            { label: 'ROE', value: stock.roe.toFixed(1) + '%', highlight: stock.roe > 15 },
            { label: 'EPS', value: `Rp ${stock.eps.toLocaleString()}` },
            { label: 'Market Cap', value: formatRupiah(stock.marketCap) },
            { label: 'Volume', value: formatVolume(stock.volume) },
          ].map(({ label, value, highlight }) => (
            <div key={label}>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className={`font-mono text-lg font-bold mt-1 ${highlight ? 'text-bullish' : 'text-foreground'}`}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Corporate Actions */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Aksi Korporasi Terakhir</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-2 px-3 rounded bg-secondary/30">
            <div>
              <p className="text-sm text-foreground font-medium">Dividen Interim 2025</p>
              <p className="text-xs text-muted-foreground">Rp 120/lembar · Cum date: 15 Jan 2026</p>
            </div>
            <span className="status-badge bg-bullish/10 text-bullish border border-bullish">Dividen</span>
          </div>
          <div className="flex items-center justify-between py-2 px-3 rounded bg-secondary/30">
            <div>
              <p className="text-sm text-foreground font-medium">Laporan Keuangan Q3 2025</p>
              <p className="text-xs text-muted-foreground">Laba bersih naik 12% YoY</p>
            </div>
            <span className="status-badge bg-primary/10 text-primary border border-primary">LK</span>
          </div>
        </div>
      </div>
    </div>
  );
}
