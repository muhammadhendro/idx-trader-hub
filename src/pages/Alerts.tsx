import { useMemo, useState } from 'react';
import { Bell, ExternalLink, Trash2 } from 'lucide-react';
import { MOCK_STOCKS, type PriceAlert } from '@/data/mockStocks';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Link } from 'react-router-dom';

export default function AlertsPage() {
  const [alerts, setAlerts] = useLocalStorage<PriceAlert[]>('idxpulse:alerts', []);
  const [ticker, setTicker] = useState('BBCA');
  const [direction, setDirection] = useState<'above' | 'below'>('above');
  const [targetPrice, setTargetPrice] = useState('');

  const alertsWithStatus = useMemo(() => {
    return alerts.map(alert => {
      const stock = MOCK_STOCKS.find(s => s.ticker === alert.ticker);
      const currentPrice = stock?.price ?? 0;
      const triggered =
        alert.direction === 'above'
          ? currentPrice >= alert.targetPrice
          : currentPrice <= alert.targetPrice;

      return { ...alert, currentPrice, triggered, stockName: stock?.name ?? '-' };
    });
  }, [alerts]);

  const addAlert = () => {
    const target = Number(targetPrice);
    if (!ticker || Number.isNaN(target) || target <= 0) return;

    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      ticker,
      direction,
      targetPrice: target,
      createdAt: new Date().toISOString(),
    };

    setAlerts(current => [newAlert, ...current]);
    setTargetPrice('');
  };

  const removeAlert = (id: string) => {
    setAlerts(current => current.filter(alert => alert.id !== id));
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
        <Bell className="w-5 h-5 text-primary" />
        Alert Harga & Data Cross-check
      </h1>

      <div className="glass-card p-4 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Buat Alert Harga</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <select
            value={ticker}
            onChange={e => setTicker(e.target.value)}
            className="px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {MOCK_STOCKS.map(stock => (
              <option key={stock.ticker} value={stock.ticker}>{stock.ticker}</option>
            ))}
          </select>
          <select
            value={direction}
            onChange={e => setDirection(e.target.value as 'above' | 'below')}
            className="px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="above">Harga di atas</option>
            <option value="below">Harga di bawah</option>
          </select>
          <input
            value={targetPrice}
            onChange={e => setTargetPrice(e.target.value)}
            type="number"
            placeholder="Target harga"
            className="px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={addAlert}
            className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
          >
            Simpan Alert
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Ticker', 'Target', 'Harga Saat Ini', 'Status', 'Aksi'].map(header => (
                  <th key={header} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {alertsWithStatus.map(alert => (
                <tr key={alert.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/stock/${alert.ticker}`} className="font-mono font-semibold text-foreground hover:text-primary">{alert.ticker}</Link>
                    <p className="text-xs text-muted-foreground">{alert.stockName}</p>
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {alert.direction === 'above' ? '≥' : '≤'} Rp {alert.targetPrice.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-foreground">Rp {alert.currentPrice.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`status-badge border ${alert.triggered ? 'bg-bullish/10 text-bullish border-bullish' : 'bg-secondary text-muted-foreground border-border'}`}>
                      {alert.triggered ? 'Triggered' : 'Monitoring'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => removeAlert(alert.id)}
                      className="p-1.5 rounded border border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {alertsWithStatus.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">Belum ada alert. Tambahkan alert harga terlebih dahulu.</div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-4 space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Cross-check Data Resmi IDX</h3>
          <p className="text-xs text-muted-foreground">Untuk validasi laporan keuangan, aksi korporasi, UMA/suspensi gunakan sumber resmi.</p>
          <a href="https://www.idx.co.id" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
            Buka Website IDX <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <div className="glass-card p-4 space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Sumber Analisis Tambahan</h3>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
            <li>RTI Business (valuasi, laporan, dividen)</li>
            <li>Kontan & Bisnis Indonesia (news flow)</li>
            <li>Cross-check sebelum eksekusi order di broker</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
