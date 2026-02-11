import { useState } from 'react';
import { MOCK_JOURNAL, MOCK_STOCKS, type JournalEntry } from '@/data/mockStocks';
import { BookOpen, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLocalStorage } from '@/hooks/use-local-storage';

const EMOTIONS = ['disiplin', 'FOMO', 'ragu', 'serakah'];
const REASONS = ['Breakout MA50', 'Breakout resistance', 'RSI oversold', 'Volume spike', 'Support kuat', 'Bounce support', 'Sektor bullish', 'News catalyst'];

export default function JournalPage() {
  const [entries, setEntries] = useLocalStorage<JournalEntry[]>('idxpulse:journal', MOCK_JOURNAL);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    ticker: '', entryPrice: '', entryDate: '', timeframe: '1D',
    reasons: [] as string[], rrPlan: '1:2', emotion: 'disiplin',
  });

  const closedEntries = entries.filter(e => e.status === 'closed');
  const wins = closedEntries.filter(e => (e.pnl ?? 0) > 0);
  const winRate = closedEntries.length > 0 ? (wins.length / closedEntries.length * 100).toFixed(0) : '0';
  const avgPnl = closedEntries.length > 0
    ? (closedEntries.reduce((s, e) => s + (e.pnl ?? 0), 0) / closedEntries.length).toFixed(0)
    : '0';
  const emotionCount = closedEntries.reduce((acc, e) => {
    acc[e.emotion] = (acc[e.emotion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topEmotion = Object.entries(emotionCount).sort((a, b) => b[1] - a[1])[0];

  const closeTrade = (entryId: string) => {
    setEntries(current =>
      current.map(entry => {
        if (entry.id !== entryId || entry.status === 'closed') return entry;

        const stock = MOCK_STOCKS.find(item => item.ticker === entry.ticker);
        const exitPrice = stock?.price ?? entry.entryPrice;
        return {
          ...entry,
          exitPrice,
          exitDate: new Date().toISOString().split('T')[0],
          pnl: exitPrice - entry.entryPrice,
          status: 'closed' as const,
        };
      })
    );
  };

  const handleSubmit = () => {
    if (!form.ticker || !form.entryPrice) return;
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      ticker: form.ticker.toUpperCase(),
      entryPrice: Number(form.entryPrice),
      exitPrice: null,
      entryDate: form.entryDate || new Date().toISOString().split('T')[0],
      exitDate: null,
      timeframe: form.timeframe,
      reasons: form.reasons,
      rrPlan: form.rrPlan,
      emotion: form.emotion,
      pnl: null,
      status: 'open',
    };
    setEntries([newEntry, ...entries]);
    setShowForm(false);
    setForm({ ticker: '', entryPrice: '', entryDate: '', timeframe: '1D', reasons: [], rrPlan: '1:2', emotion: 'disiplin' });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Trading Journal
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Entry Baru
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Win Rate</p>
          <p className={`text-2xl font-mono font-bold mt-1 ${Number(winRate) >= 50 ? 'text-bullish' : 'text-bearish'}`}>{winRate}%</p>
          <p className="text-xs text-muted-foreground mt-1">{wins.length}W / {closedEntries.length - wins.length}L</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Avg P/L per Trade</p>
          <p className={`text-2xl font-mono font-bold mt-1 ${Number(avgPnl) >= 0 ? 'text-bullish' : 'text-bearish'}`}>
            {Number(avgPnl) >= 0 ? '+' : ''}Rp {Number(avgPnl).toLocaleString()}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Total Trades</p>
          <p className="text-2xl font-mono font-bold text-foreground mt-1">{entries.length}</p>
          <p className="text-xs text-muted-foreground mt-1">{entries.filter(e => e.status === 'open').length} open</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Emosi Dominan</p>
          <p className="text-2xl font-mono font-bold text-warning mt-1">{topEmotion?.[0] ?? '-'}</p>
          <p className="text-xs text-muted-foreground mt-1">{topEmotion?.[1] ?? 0}x muncul</p>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="glass-card p-4 space-y-4 animate-fade-in">
          <h3 className="text-sm font-semibold text-foreground">Tambah Entry</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <input placeholder="Ticker" value={form.ticker} onChange={e => setForm({ ...form, ticker: e.target.value })}
              className="px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono" />
            <input placeholder="Entry Price" type="number" value={form.entryPrice} onChange={e => setForm({ ...form, entryPrice: e.target.value })}
              className="px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono" />
            <input type="date" value={form.entryDate} onChange={e => setForm({ ...form, entryDate: e.target.value })}
              className="px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
            <select value={form.timeframe} onChange={e => setForm({ ...form, timeframe: e.target.value })}
              className="px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="15m">15 Menit</option>
              <option value="1H">1 Jam</option>
              <option value="1D">Harian</option>
            </select>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">Alasan Entry</p>
            <div className="flex flex-wrap gap-2">
              {REASONS.map(r => (
                <button key={r} onClick={() => setForm(f => ({
                  ...f, reasons: f.reasons.includes(r) ? f.reasons.filter(x => x !== r) : [...f.reasons, r]
                }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    form.reasons.includes(r)
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-secondary/50 border-border text-muted-foreground'
                  }`}>{r}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground mb-2">R:R Plan</p>
              <select value={form.rrPlan} onChange={e => setForm({ ...form, rrPlan: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                <option value="1:1">1:1</option>
                <option value="1:2">1:2</option>
                <option value="1:3">1:3</option>
                <option value="1:5">1:5</option>
              </select>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Emosi</p>
              <select value={form.emotion} onChange={e => setForm({ ...form, emotion: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                {EMOTIONS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </div>

          <button onClick={handleSubmit}
            className="px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            Simpan Entry
          </button>
        </div>
      )}

      {/* Journal Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Ticker', 'Entry', 'Exit', 'P/L', 'TF', 'Emosi', 'R:R', 'Status', 'Aksi'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map(e => (
                <tr key={e.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/stock/${e.ticker}`} className="font-mono font-semibold text-foreground hover:text-primary">{e.ticker}</Link>
                    <p className="text-xs text-muted-foreground">{e.entryDate}</p>
                  </td>
                  <td className="px-4 py-3 data-cell text-foreground">Rp {e.entryPrice.toLocaleString()}</td>
                  <td className="px-4 py-3 data-cell text-foreground">{e.exitPrice ? `Rp ${e.exitPrice.toLocaleString()}` : '—'}</td>
                  <td className={`px-4 py-3 data-cell ${e.pnl === null ? 'text-muted-foreground' : (e.pnl ?? 0) >= 0 ? 'ticker-bullish' : 'ticker-bearish'}`}>
                    {e.pnl !== null ? `${e.pnl >= 0 ? '+' : ''}Rp ${e.pnl.toLocaleString()}` : '—'}
                  </td>
                  <td className="px-4 py-3 data-cell text-muted-foreground">{e.timeframe}</td>
                  <td className="px-4 py-3">
                    <span className={`status-badge border ${
                      e.emotion === 'disiplin' ? 'bg-bullish/10 text-bullish border-bullish' :
                      e.emotion === 'FOMO' ? 'bg-bearish/10 text-bearish border-bearish' :
                      'bg-warning/10 text-warning border-warning'
                    }`}>{e.emotion}</span>
                  </td>
                  <td className="px-4 py-3 data-cell text-muted-foreground">{e.rrPlan}</td>
                  <td className="px-4 py-3">
                    <span className={`status-badge border ${
                      e.status === 'open' ? 'bg-primary/10 text-primary border-primary' : 'bg-secondary text-muted-foreground border-border'
                    }`}>{e.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {e.status === 'open' ? (
                      <button
                        onClick={() => closeTrade(e.id)}
                        className="px-2 py-1 rounded-md text-xs border border-primary/40 text-primary hover:bg-primary/10 transition-colors"
                      >
                        Tutup posisi
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
