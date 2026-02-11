import Layout from '@/components/Layout';
import MarketOverview from '@/components/MarketOverview';
import NewsPanel from '@/components/NewsPanel';
import { Link } from 'react-router-dom';
import { MOCK_STOCKS, formatVolume } from '@/data/mockStocks';
import { useMarketFeed } from '@/hooks/use-market-feed';
import { ArrowUpRight, ArrowDownRight, BarChart3, Search, Star } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';

const Index = () => {
  const { stocks: liveStocks, lastUpdated, source } = useMarketFeed();
  const marketStocks = liveStocks.length > 0 ? liveStocks : MOCK_STOCKS;
  const totalVolume = marketStocks.reduce((s, st) => s + st.volume, 0);
  const avgChange = marketStocks.reduce((s, st) => s + st.changePercent, 0) / marketStocks.length;
  const [watchlist] = useLocalStorage<string[]>('idxpulse:watchlist', ['BBCA', 'BMRI', 'TLKM']);
  const watchlistStocks = marketStocks.filter(stock => watchlist.includes(stock.ticker));

  return (
    <Layout>
      <div className="space-y-4 animate-fade-in">
        {/* Market Ticker Strip */}
        <div className="glass-card px-4 py-2 overflow-hidden">
          <div className="flex items-center gap-6 animate-ticker-scroll whitespace-nowrap">
            {[...marketStocks, ...marketStocks].map((s, i) => (
              <Link key={`${s.ticker}-${i}`} to={`/stock/${s.ticker}`}
                className="flex items-center gap-2 text-xs font-mono hover:opacity-80 transition-opacity shrink-0">
                <span className="text-foreground font-semibold">{s.ticker}</span>
                <span className="text-foreground">{s.price.toLocaleString()}</span>
                <span className={s.change >= 0 ? 'text-bullish' : 'text-bearish'}>
                  {s.change >= 0 ? '+' : ''}{s.changePercent.toFixed(2)}%
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="glass-card p-4">
            <p className="text-xs text-muted-foreground">IHSG</p>
            <p className="text-xl font-mono font-bold text-foreground mt-1">7,245.82</p>
            <p className="text-xs text-bullish font-mono mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> +0.45%
            </p>
          </div>
          <div className="glass-card p-4">
            <p className="text-xs text-muted-foreground">Total Volume</p>
            <p className="text-xl font-mono font-bold text-foreground mt-1">{formatVolume(totalVolume)}</p>
            <p className="text-xs text-muted-foreground mt-1">{marketStocks.length} saham</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-xs text-muted-foreground">Avg Change</p>
            <p className={`text-xl font-mono font-bold mt-1 ${avgChange >= 0 ? 'text-bullish' : 'text-bearish'}`}>
              {avgChange >= 0 ? '+' : ''}{avgChange.toFixed(2)}%
            </p>
          </div>
          <div className="glass-card p-4">
            <p className="text-xs text-muted-foreground">USD/IDR</p>
            <p className="text-xl font-mono font-bold text-foreground mt-1">15,650</p>
            <p className="text-xs text-bearish font-mono mt-1 flex items-center gap-1">
              <ArrowDownRight className="w-3 h-3" /> -0.12%
            </p>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground">Update market ({source === 'api-yahoo' ? 'Yahoo API' : source === 'api-stooq' ? 'Stooq API' : 'simulasi fallback'}): {new Date(lastUpdated).toLocaleTimeString('id-ID')}</p>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Link to="/screener" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            <Search className="w-4 h-4" /> Screener
          </Link>
          <Link to="/journal" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors">
            <BarChart3 className="w-4 h-4" /> Journal
          </Link>
        </div>

        <MarketOverview />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <NewsPanel limit={4} />

          {/* Watchlist */}
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" /> Watchlist Saya
            </h3>
            <div className="space-y-2">
              {(watchlistStocks.length > 0 ? watchlistStocks : marketStocks.slice(0, 6)).map(s => (
                <Link key={s.ticker} to={`/stock/${s.ticker}`}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-secondary/50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono font-bold ${
                      s.change >= 0 ? 'bg-bullish/10 text-bullish' : 'bg-bearish/10 text-bearish'
                    }`}>
                      {s.ticker.slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-mono font-semibold text-foreground">{s.ticker}</p>
                      <p className="text-xs text-muted-foreground">{s.sector}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-semibold text-foreground">{s.price.toLocaleString()}</p>
                    <p className={`text-xs font-mono ${s.change >= 0 ? 'text-bullish' : 'text-bearish'}`}>
                      {s.change >= 0 ? '+' : ''}{s.changePercent.toFixed(2)}%
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
