import { useMemo, useState } from 'react';
import NewsPanel from '@/components/NewsPanel';
import { Newspaper, BellPlus, Trash2 } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useMarketFeed } from '@/hooks/use-market-feed';

export default function NewsPage() {
  const [query, setQuery] = useLocalStorage('idxpulse:news:query', '');
  const [sentiment, setSentiment] = useLocalStorage<'all' | 'positif' | 'netral' | 'negatif'>('idxpulse:news:sentiment', 'all');
  const [keywordAlerts, setKeywordAlerts] = useLocalStorage<string[]>('idxpulse:news:keyword-alerts', []);
  const [keywordInput, setKeywordInput] = useState('');
  const { news } = useMarketFeed();

  const triggeredAlerts = useMemo(() => {
    return keywordAlerts
      .map(keyword => {
        const hit = news.find(item =>
          item.title.toLowerCase().includes(keyword.toLowerCase()) ||
          item.summary.toLowerCase().includes(keyword.toLowerCase()) ||
          item.tickers.some(t => t.toLowerCase() === keyword.toLowerCase())
        );
        return { keyword, hit };
      })
      .filter(item => item.hit);
  }, [keywordAlerts, news]);

  const addKeywordAlert = () => {
    const keyword = keywordInput.trim();
    if (!keyword) return;
    setKeywordAlerts(current => (current.includes(keyword) ? current : [keyword, ...current].slice(0, 15)));
    setKeywordInput('');
  };

  const removeKeywordAlert = (keyword: string) => {
    setKeywordAlerts(current => current.filter(item => item !== keyword));
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
        <Newspaper className="w-5 h-5 text-primary" />
        News & Sentiment IDX
      </h1>

      <div className="glass-card p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Cari judul, ringkasan, atau ticker..."
          className="sm:col-span-2 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <select
          value={sentiment}
          onChange={e => setSentiment(e.target.value as 'all' | 'positif' | 'netral' | 'negatif')}
          className="px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="all">Semua Sentimen</option>
          <option value="positif">Positif</option>
          <option value="netral">Netral</option>
          <option value="negatif">Negatif</option>
        </select>
      </div>

      <div className="glass-card p-4 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Keyword/Event Alert</h3>
        <div className="flex flex-wrap gap-2">
          <input
            value={keywordInput}
            onChange={e => setKeywordInput(e.target.value)}
            placeholder="contoh: dividen, BBCA, buyback"
            className="flex-1 min-w-[220px] px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm"
          />
          <button onClick={addKeywordAlert} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm inline-flex items-center gap-1"><BellPlus className="w-4 h-4" /> Tambah</button>
        </div>

        <div className="flex flex-wrap gap-2">
          {keywordAlerts.length === 0 && <span className="text-xs text-muted-foreground">Belum ada keyword alert.</span>}
          {keywordAlerts.map(keyword => (
            <span key={keyword} className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-border text-xs bg-secondary/30">
              {keyword}
              <button onClick={() => removeKeywordAlert(keyword)} className="text-muted-foreground hover:text-foreground"><Trash2 className="w-3 h-3" /></button>
            </span>
          ))}
        </div>

        <div className="text-xs text-muted-foreground">
          Triggered: {triggeredAlerts.length} keyword aktif terdeteksi pada news terbaru.
        </div>
      </div>

      <NewsPanel query={query} sentiment={sentiment} />
    </div>
  );
}
