import { useMemo, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { type JournalEntry } from '@/data/mockStocks';

export default function RiskPage() {
  const [capital, setCapital] = useLocalStorage('idxpulse:risk:capital', '100000000');
  const [riskPct, setRiskPct] = useLocalStorage('idxpulse:risk:riskPct', '1');
  const [entry, setEntry] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [journal] = useLocalStorage<JournalEntry[]>('idxpulse:journal', []);

  const size = useMemo(() => {
    const cap = Number(capital);
    const risk = Number(riskPct) / 100;
    const en = Number(entry);
    const sl = Number(stopLoss);
    if (!cap || !risk || !en || !sl || en <= sl) return null;
    const riskAmount = cap * risk;
    const perShareRisk = en - sl;
    const qty = Math.floor(riskAmount / perShareRisk);
    const value = qty * en;
    return { riskAmount, perShareRisk, qty, value, exposurePct: (value / cap) * 100 };
  }, [capital, riskPct, entry, stopLoss]);

  const openTrades = journal.filter(item => item.status === 'open');

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
        <ShieldAlert className="w-5 h-5 text-primary" />
        Risk & Position Sizing
      </h1>

      <div className="glass-card p-4 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Kalkulator Position Size</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <input value={capital} onChange={e => setCapital(e.target.value)} type="number" placeholder="Modal" className="px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm" />
          <input value={riskPct} onChange={e => setRiskPct(e.target.value)} type="number" placeholder="Risk %" className="px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm" />
          <input value={entry} onChange={e => setEntry(e.target.value)} type="number" placeholder="Entry" className="px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm" />
          <input value={stopLoss} onChange={e => setStopLoss(e.target.value)} type="number" placeholder="Stop Loss" className="px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm" />
        </div>

        {size ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="glass-card p-3"><p className="text-muted-foreground text-xs">Risk Amount</p><p>Rp {Math.round(size.riskAmount).toLocaleString()}</p></div>
            <div className="glass-card p-3"><p className="text-muted-foreground text-xs">Qty</p><p>{size.qty.toLocaleString()} lembar</p></div>
            <div className="glass-card p-3"><p className="text-muted-foreground text-xs">Nilai Posisi</p><p>Rp {Math.round(size.value).toLocaleString()}</p></div>
            <div className="glass-card p-3"><p className="text-muted-foreground text-xs">Exposure</p><p>{size.exposurePct.toFixed(2)}%</p></div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Isi modal, risk, entry, dan stop loss (entry harus di atas stop loss).</p>
        )}
      </div>

      <div className="glass-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-2">Open Trades Exposure Snapshot</h3>
        <p className="text-xs text-muted-foreground">Jumlah posisi open saat ini: {openTrades.length}</p>
      </div>
    </div>
  );
}
