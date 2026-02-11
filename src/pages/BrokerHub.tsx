import { Landmark, ExternalLink, PlugZap } from 'lucide-react';

const BROKERS = [
  { name: 'Stockbit', note: 'Chart + komunitas + broker integration' },
  { name: 'Ajaib', note: 'UI simpel untuk investor retail' },
  { name: 'MOST', note: 'Mandiri Sekuritas' },
  { name: 'IPOT', note: 'Indo Premier Online Technology' },
];

export default function BrokerHubPage() {
  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
        <Landmark className="w-5 h-5 text-primary" />
        Broker Hub (Integration Scaffold)
      </h1>

      <div className="glass-card p-4 space-y-2">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><PlugZap className="w-4 h-4 text-primary" /> Status Integrasi</h3>
        <p className="text-xs text-muted-foreground">Belum ada koneksi API broker untuk order placement. Halaman ini disiapkan sebagai fondasi integrasi login broker dan eksekusi order.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {BROKERS.map(broker => (
          <div key={broker.name} className="glass-card p-4 space-y-2">
            <p className="text-sm font-semibold text-foreground">{broker.name}</p>
            <p className="text-xs text-muted-foreground">{broker.note}</p>
            <a href="https://www.idx.co.id" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
              Riset & cross-check dulu di IDX <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
