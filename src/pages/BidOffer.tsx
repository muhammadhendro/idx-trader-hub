import { useEffect, useMemo, useState } from 'react';
import { Activity, TrendingUp, TrendingDown, Flame, AlertTriangle } from 'lucide-react';

interface BidOfferRow {
  price: number;
  bidLot: number;
  offerLot: number;
}

const INITIAL_DATA: BidOfferRow[] = [
  { price: 9900, bidLot: 0, offerLot: 250 },
  { price: 9875, bidLot: 0, offerLot: 180 },
  { price: 9850, bidLot: 0, offerLot: 120 },
  { price: 9825, bidLot: 150, offerLot: 0 },
  { price: 9800, bidLot: 320, offerLot: 0 },
  { price: 9775, bidLot: 480, offerLot: 0 },
  { price: 9750, bidLot: 200, offerLot: 0 },
];

interface RunningTrade {
  time: string;
  price: number;
  lot: number;
  type: 'buy' | 'sell';
  broker: string;
}

const INITIAL_RUNNING: RunningTrade[] = [
  { time: '14:32:15', price: 9850, lot: 50, type: 'buy', broker: 'YP' },
  { time: '14:31:42', price: 9850, lot: 30, type: 'sell', broker: 'CC' },
  { time: '14:31:10', price: 9825, lot: 120, type: 'buy', broker: 'PD' },
  { time: '14:30:55', price: 9850, lot: 80, type: 'buy', broker: 'AK' },
  { time: '14:30:22', price: 9875, lot: 45, type: 'sell', broker: 'XC' },
  { time: '14:29:58', price: 9825, lot: 200, type: 'buy', broker: 'RX' },
  { time: '14:29:30', price: 9825, lot: 60, type: 'sell', broker: 'PD' },
  { time: '14:28:45', price: 9800, lot: 150, type: 'buy', broker: 'AK' },
];

const BROKERS = ['YP', 'PD', 'AK', 'CC', 'XC', 'RX'];

export default function BidOfferPage() {
  const [data, setData] = useState(INITIAL_DATA);
  const [running, setRunning] = useState(INITIAL_RUNNING);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setData(current =>
        current.map(row => ({
          ...row,
          bidLot: Math.max(0, row.bidLot + Math.round((Math.random() - 0.5) * 60)),
          offerLot: Math.max(0, row.offerLot + Math.round((Math.random() - 0.5) * 60)),
        }))
      );

      setRunning(current => {
        const last = current[0];
        const step = Math.random() > 0.7 ? 25 : Math.random() > 0.5 ? -25 : 0;
        const newPrice = Math.max(9400, last.price + step);
        const trade: RunningTrade = {
          time: new Date().toLocaleTimeString('id-ID', { hour12: false }),
          price: newPrice,
          lot: Math.max(5, Math.round(Math.random() * 220)),
          type: Math.random() > 0.45 ? 'buy' : 'sell',
          broker: BROKERS[Math.floor(Math.random() * BROKERS.length)],
        };
        return [trade, ...current].slice(0, 20);
      });
    }, 4500);

    return () => window.clearInterval(timer);
  }, []);

  const totalBid = data.reduce((s, r) => s + r.bidLot, 0);
  const totalOffer = data.reduce((s, r) => s + r.offerLot, 0);
  const maxLot = Math.max(...data.map(r => Math.max(r.bidLot, r.offerLot)), 1);
  const bidRatio = totalBid / (totalBid + totalOffer || 1) * 100;

  const buyVol = running.filter(t => t.type === 'buy').reduce((s, t) => s + t.lot, 0);
  const sellVol = running.filter(t => t.type === 'sell').reduce((s, t) => s + t.lot, 0);

  let signal = 'Netral';
  let signalColor = 'text-muted-foreground';
  if (bidRatio > 60 && buyVol > sellVol * 1.5) {
    signal = 'Akumulasi';
    signalColor = 'text-bullish';
  } else if (bidRatio < 40 && sellVol > buyVol * 1.5) {
    signal = 'Distribusi';
    signalColor = 'text-bearish';
  } else if (totalOffer > totalBid * 2 && buyVol > sellVol) {
    signal = 'Fake Breakout?';
    signalColor = 'text-warning';
  }

  const anomalyTrades = running.filter(t => t.lot >= 180).slice(0, 5);

  const brokerSummary = useMemo(() => {
    const map: Record<string, number> = {};
    running.forEach(trade => {
      map[trade.broker] = (map[trade.broker] ?? 0) + (trade.type === 'buy' ? trade.lot : -trade.lot);
    });
    return Object.entries(map).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])).slice(0, 6);
  }, [running]);

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
        <Activity className="w-5 h-5 text-primary" />
        Bid-Offer & Bandar Reading
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass-card p-4 lg:col-span-1">
          <h3 className="text-sm font-semibold text-foreground mb-3">Order Book — BBCA (simulasi live)</h3>
          <div className="space-y-1">
            {data.map((row, i) => (
              <div key={i} className="relative flex items-center text-xs font-mono h-7 rounded overflow-hidden">
                {row.bidLot > 0 && (
                  <div className="absolute right-1/2 h-full bg-bullish/15 rounded-l" style={{ width: `${(row.bidLot / maxLot) * 50}%` }} />
                )}
                {row.offerLot > 0 && (
                  <div className="absolute left-1/2 h-full bg-bearish/15 rounded-r" style={{ width: `${(row.offerLot / maxLot) * 50}%` }} />
                )}
                <div className="relative flex items-center w-full px-2">
                  <span className="w-16 text-right text-bullish">{row.bidLot > 0 ? row.bidLot : ''}</span>
                  <span className="flex-1 text-center text-foreground font-semibold">{row.price.toLocaleString()}</span>
                  <span className="w-16 text-left text-bearish">{row.offerLot > 0 ? row.offerLot : ''}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Total Bid</span><span className="font-mono text-bullish">{totalBid} lot</span></div>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Total Offer</span><span className="font-mono text-bearish">{totalOffer} lot</span></div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden flex">
              <div className="h-full bg-bullish" style={{ width: `${bidRatio}%` }} />
              <div className="h-full bg-bearish" style={{ width: `${100 - bidRatio}%` }} />
            </div>
            <p className="text-xs text-muted-foreground text-center">Bid {bidRatio.toFixed(0)}% : Offer {(100 - bidRatio).toFixed(0)}%</p>
          </div>
        </div>

        <div className="glass-card p-4 lg:col-span-1">
          <h3 className="text-sm font-semibold text-foreground mb-3">Running Trade (Time & Sales)</h3>
          <div className="space-y-1">
            {running.map((t, i) => (
              <div key={i} className="flex items-center justify-between text-xs font-mono py-1.5 px-2 rounded hover:bg-secondary/30">
                <span className="text-muted-foreground">{t.time}</span>
                <span className="text-foreground">{t.price.toLocaleString()}</span>
                <span className={t.type === 'buy' ? 'text-bullish' : 'text-bearish'}>{t.type === 'buy' ? 'B' : 'S'} {t.lot}</span>
                <span className="text-muted-foreground">{t.broker}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-4 lg:col-span-1 space-y-4">
          <div className="p-3 rounded-lg bg-secondary/30">
            <p className="text-xs text-muted-foreground">Bandar Signal</p>
            <p className={`text-xl font-bold font-mono mt-1 ${signalColor}`}>{signal}</p>
            <p className="text-xs text-muted-foreground mt-1">based on bid ratio + running trade flow</p>
          </div>

          <div className="p-3 rounded-lg bg-secondary/30 space-y-2">
            <p className="text-xs font-medium text-foreground">Broker Summary (net lot)</p>
            {brokerSummary.map(([broker, net]) => (
              <div key={broker} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{broker}</span>
                <span className={net >= 0 ? 'text-bullish font-mono' : 'text-bearish font-mono'}>{net >= 0 ? '+' : ''}{net}</span>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-secondary/30 space-y-2">
            <p className="text-xs font-medium text-foreground flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-warning" /> Anomaly Marker</p>
            {anomalyTrades.length === 0 ? (
              <p className="text-xs text-muted-foreground">Belum ada transaksi lot besar.</p>
            ) : anomalyTrades.map((trade, idx) => (
              <div key={idx} className="text-xs flex justify-between">
                <span className="text-muted-foreground">{trade.time} {trade.broker}</span>
                <span className={trade.type === 'buy' ? 'text-bullish' : 'text-bearish'}>{trade.type.toUpperCase()} {trade.lot}</span>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-secondary/30 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground flex items-center gap-1"><TrendingUp className="w-3 h-3 text-bullish" /> Buy Volume</span>
              <span className="font-mono text-sm text-bullish">{buyVol} lot</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground flex items-center gap-1"><TrendingDown className="w-3 h-3 text-bearish" /> Sell Volume</span>
              <span className="font-mono text-sm text-bearish">{sellVol} lot</span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden flex">
              <div className="h-full bg-bullish" style={{ width: `${buyVol / (buyVol + sellVol || 1) * 100}%` }} />
              <div className="h-full bg-bearish" style={{ width: `${sellVol / (buyVol + sellVol || 1) * 100}%` }} />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-secondary/30 space-y-2">
            <p className="text-xs font-medium text-foreground flex items-center gap-1"><Flame className="w-3 h-3 text-warning" /> Lot Heatmap</p>
            <div className="grid grid-cols-7 gap-1">
              {data.map((r, i) => {
                const total = r.bidLot + r.offerLot;
                const intensity = total / maxLot;
                return (
                  <div key={i} className="aspect-square rounded-sm flex items-center justify-center text-[9px] font-mono"
                    style={{
                      backgroundColor: r.bidLot > r.offerLot
                        ? `rgba(34,197,94,${0.15 + intensity * 0.6})`
                        : `rgba(239,68,68,${0.15 + intensity * 0.6})`,
                    }}>
                    {r.price % 100 === 0 ? (r.price / 1000).toFixed(1) + 'K' : ''}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
