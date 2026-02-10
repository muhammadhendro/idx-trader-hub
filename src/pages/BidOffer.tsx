import { useState } from 'react';
import { Activity, TrendingUp, TrendingDown, Flame } from 'lucide-react';

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
}

const INITIAL_RUNNING: RunningTrade[] = [
  { time: '14:32:15', price: 9850, lot: 50, type: 'buy' },
  { time: '14:31:42', price: 9850, lot: 30, type: 'sell' },
  { time: '14:31:10', price: 9825, lot: 120, type: 'buy' },
  { time: '14:30:55', price: 9850, lot: 80, type: 'buy' },
  { time: '14:30:22', price: 9875, lot: 45, type: 'sell' },
  { time: '14:29:58', price: 9825, lot: 200, type: 'buy' },
  { time: '14:29:30', price: 9825, lot: 60, type: 'sell' },
  { time: '14:28:45', price: 9800, lot: 150, type: 'buy' },
];

export default function BidOfferPage() {
  const [data] = useState(INITIAL_DATA);
  const [running] = useState(INITIAL_RUNNING);

  const totalBid = data.reduce((s, r) => s + r.bidLot, 0);
  const totalOffer = data.reduce((s, r) => s + r.offerLot, 0);
  const maxLot = Math.max(...data.map(r => Math.max(r.bidLot, r.offerLot)));
  const bidRatio = totalBid / (totalBid + totalOffer) * 100;

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

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
        <Activity className="w-5 h-5 text-primary" />
        Bid-Offer & Bandar Reading
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bid-Offer Book */}
        <div className="glass-card p-4 lg:col-span-1">
          <h3 className="text-sm font-semibold text-foreground mb-3">Order Book — BBCA</h3>
          <div className="space-y-1">
            {data.map((row, i) => (
              <div key={i} className="relative flex items-center text-xs font-mono h-7 rounded overflow-hidden">
                {/* Bid bar */}
                {row.bidLot > 0 && (
                  <div
                    className="absolute right-1/2 h-full bg-bullish/15 rounded-l"
                    style={{ width: `${(row.bidLot / maxLot) * 50}%` }}
                  />
                )}
                {/* Offer bar */}
                {row.offerLot > 0 && (
                  <div
                    className="absolute left-1/2 h-full bg-bearish/15 rounded-r"
                    style={{ width: `${(row.offerLot / maxLot) * 50}%` }}
                  />
                )}
                <div className="relative flex items-center w-full px-2">
                  <span className="w-16 text-right text-bullish">{row.bidLot > 0 ? row.bidLot : ''}</span>
                  <span className="flex-1 text-center text-foreground font-semibold">{row.price.toLocaleString()}</span>
                  <span className="w-16 text-left text-bearish">{row.offerLot > 0 ? row.offerLot : ''}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Bid/Offer Summary */}
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Total Bid</span>
              <span className="font-mono text-bullish">{totalBid} lot</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Total Offer</span>
              <span className="font-mono text-bearish">{totalOffer} lot</span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden flex">
              <div className="h-full bg-bullish" style={{ width: `${bidRatio}%` }} />
              <div className="h-full bg-bearish" style={{ width: `${100 - bidRatio}%` }} />
            </div>
            <p className="text-xs text-muted-foreground text-center">Bid {bidRatio.toFixed(0)}% : Offer {(100 - bidRatio).toFixed(0)}%</p>
          </div>
        </div>

        {/* Running Trade */}
        <div className="glass-card p-4 lg:col-span-1">
          <h3 className="text-sm font-semibold text-foreground mb-3">Running Trade</h3>
          <div className="space-y-1">
            {running.map((t, i) => (
              <div key={i} className="flex items-center justify-between text-xs font-mono py-1.5 px-2 rounded hover:bg-secondary/30">
                <span className="text-muted-foreground">{t.time}</span>
                <span className="text-foreground">{t.price.toLocaleString()}</span>
                <span className={t.type === 'buy' ? 'text-bullish' : 'text-bearish'}>{t.lot} lot</span>
                <span className={`status-badge border ${t.type === 'buy' ? 'bg-bullish/10 text-bullish border-bullish' : 'bg-bearish/10 text-bearish border-bearish'}`}>
                  {t.type === 'buy' ? 'BUY' : 'SELL'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Analysis */}
        <div className="glass-card p-4 lg:col-span-1 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Analisis Bandar</h3>

          <div className="p-4 rounded-lg bg-secondary/30 text-center">
            <p className="text-xs text-muted-foreground mb-1">Signal Deteksi</p>
            <p className={`text-2xl font-bold font-mono ${signalColor}`}>{signal}</p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-bullish" /> Buy Volume
              </span>
              <span className="font-mono text-sm text-bullish">{buyVol} lot</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingDown className="w-3 h-3 text-bearish" /> Sell Volume
              </span>
              <span className="font-mono text-sm text-bearish">{sellVol} lot</span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden flex">
              <div className="h-full bg-bullish" style={{ width: `${buyVol / (buyVol + sellVol) * 100}%` }} />
              <div className="h-full bg-bearish" style={{ width: `${sellVol / (buyVol + sellVol) * 100}%` }} />
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
