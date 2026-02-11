import { useMemo } from 'react';
import { Newspaper } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMarketFeed } from '@/hooks/use-market-feed';

type SentimentType = 'positif' | 'netral' | 'negatif';

const sentimentConfig: Record<SentimentType, { label: string; className: string; score: number }> = {
  positif: { label: 'Positif', className: 'bg-bullish/10 text-bullish border-bullish', score: 2 },
  netral: { label: 'Netral', className: 'bg-secondary text-muted-foreground border-border', score: 1 },
  negatif: { label: 'Negatif', className: 'bg-bearish/10 text-bearish border-bearish', score: -2 },
};

function normalizeTitle(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
}

export default function NewsPanel({
  limit,
  query,
  sentiment = 'all',
  ticker,
}: {
  limit?: number;
  query?: string;
  sentiment?: 'all' | SentimentType;
  ticker?: string;
}) {
  const { news, source, lastUpdated } = useMarketFeed();
  const normalizedQuery = (query ?? '').trim().toLowerCase();

  const dedupedNews = useMemo(() => {
    const seen = new Set<string>();
    return news.filter(item => {
      const key = `${normalizeTitle(item.title)}|${item.source}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [news]);

  const filteredNews = dedupedNews.filter(item => {
    const sentimentMatch = sentiment === 'all' || item.sentiment === sentiment;
    const queryMatch =
      normalizedQuery.length === 0 ||
      item.title.toLowerCase().includes(normalizedQuery) ||
      item.summary.toLowerCase().includes(normalizedQuery) ||
      item.tickers.some(t => t.toLowerCase().includes(normalizedQuery));
    const tickerMatch = !ticker || item.tickers.includes(ticker);

    return sentimentMatch && queryMatch && tickerMatch;
  });

  const tickerImpact = useMemo(() => {
    const scores: Record<string, number> = {};
    filteredNews.forEach(item => {
      const score = sentimentConfig[item.sentiment].score;
      item.tickers.forEach(t => {
        scores[t] = (scores[t] ?? 0) + score;
      });
    });
    return Object.entries(scores)
      .map(([symbol, score]) => ({ symbol, score }))
      .sort((a, b) => Math.abs(b.score) - Math.abs(a.score))
      .slice(0, 5);
  }, [filteredNews]);

  const newsToRender = limit ? filteredNews.slice(0, limit) : filteredNews;

  return (
    <div className="glass-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Newspaper className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">News & Sentiment</h3>
        <span className="text-[10px] text-muted-foreground">{source === 'api-yahoo' ? 'Yahoo API + simulasi news' : source === 'api-stooq' ? 'Stooq API + simulasi news' : 'simulasi'} · {new Date(lastUpdated).toLocaleTimeString('id-ID')}</span>
      </div>

      {tickerImpact.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">Impact Score (timeline ringkas per ticker)</p>
          <div className="flex flex-wrap gap-2">
            {tickerImpact.map(item => (
              <Link
                key={item.symbol}
                to={`/stock/${item.symbol}`}
                className={`px-2.5 py-1 rounded text-xs border ${
                  item.score > 0
                    ? 'bg-bullish/10 border-bullish text-bullish'
                    : item.score < 0
                      ? 'bg-bearish/10 border-bearish text-bearish'
                      : 'bg-secondary border-border text-muted-foreground'
                }`}
              >
                ${item.symbol} {item.score > 0 ? '+' : ''}{item.score}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {newsToRender.length === 0 && (
          <div className="text-sm text-muted-foreground p-4 rounded-lg bg-secondary/30">
            Tidak ada berita yang cocok dengan filter.
          </div>
        )}

        {newsToRender.map(item => {
          const config = sentimentConfig[item.sentiment];
          const impact = item.tickers.reduce((sum, t) => sum + (tickerImpact.find(x => x.symbol === t)?.score ?? 0), 0);
          return (
            <div key={item.id} className="p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
              <h4 className="text-sm font-medium text-foreground leading-snug">{item.title}</h4>
              <p className="text-xs text-muted-foreground mt-1">{item.summary}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="text-xs text-muted-foreground">{item.source} · {item.time}</span>
                <span className={`status-badge border ${config.className}`}>{config.label}</span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-card border border-border text-muted-foreground">
                  Impact {impact > 0 ? '+' : ''}{impact}
                </span>
                {item.tickers.map(t => (
                  <Link key={t} to={`/stock/${t}`} className="text-xs font-mono text-primary hover:underline">${t}</Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
