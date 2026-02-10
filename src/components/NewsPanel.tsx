import { MOCK_NEWS, type NewsItem } from '@/data/mockStocks';
import { Newspaper, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const sentimentConfig = {
  positif: { label: 'Positif', className: 'bg-bullish/10 text-bullish border-bullish' },
  netral: { label: 'Netral', className: 'bg-secondary text-muted-foreground border-border' },
  negatif: { label: 'Negatif', className: 'bg-bearish/10 text-bearish border-bearish' },
};

export default function NewsPanel({ limit }: { limit?: number }) {
  const news = limit ? MOCK_NEWS.slice(0, limit) : MOCK_NEWS;

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Newspaper className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">News & Sentiment</h3>
      </div>
      <div className="space-y-3">
        {news.map(n => {
          const sc = sentimentConfig[n.sentiment];
          return (
            <div key={n.id} className="p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground leading-snug">{n.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{n.summary}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-xs text-muted-foreground">{n.source} · {n.time}</span>
                    <span className={`status-badge border ${sc.className}`}>{sc.label}</span>
                    {n.tickers.map(t => (
                      <Link key={t} to={`/stock/${t}`} className="text-xs font-mono text-primary hover:underline">${t}</Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
