import { Building2, CalendarDays, FileText, ShieldAlert, ExternalLink } from 'lucide-react';
import { MOCK_STOCKS } from '@/data/mockStocks';

export default function IdxDataHubPage() {
  const bySector = Object.entries(
    MOCK_STOCKS.reduce<Record<string, { count: number; avgPer: number; avgPbv: number }>>((acc, stock) => {
      if (!acc[stock.sector]) acc[stock.sector] = { count: 0, avgPer: 0, avgPbv: 0 };
      acc[stock.sector].count += 1;
      acc[stock.sector].avgPer += stock.per;
      acc[stock.sector].avgPbv += stock.pbv;
      return acc;
    }, {})
  ).map(([sector, item]) => ({
    sector,
    count: item.count,
    avgPer: item.avgPer / item.count,
    avgPbv: item.avgPbv / item.count,
  }));

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
        <Building2 className="w-5 h-5 text-primary" />
        IDX Data Hub (Scaffold)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-4 space-y-2">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Laporan Keuangan & Aksi Korporasi</h3>
          <p className="text-xs text-muted-foreground">Modul ini jadi titik integrasi ke endpoint resmi IDX/RTI untuk financial statement, corporate action, UMA/suspensi.</p>
          <div className="flex flex-wrap gap-2 text-xs">
            <a href="https://www.idx.co.id/id/perusahaan-tercatat/laporan-keuangan-dan-tahunan" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">Laporan Keuangan IDX <ExternalLink className="w-3 h-3" /></a>
            <a href="https://www.idx.co.id/id/produk/saham" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">Info Saham IDX <ExternalLink className="w-3 h-3" /></a>
          </div>
        </div>

        <div className="glass-card p-4 space-y-2">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><CalendarDays className="w-4 h-4 text-primary" /> Kalender Dividen (Mock)</h3>
          <div className="space-y-2 text-xs">
            <div className="p-2 rounded bg-secondary/30 flex justify-between"><span>BBCA</span><span>Cum: 15 Jan 2026</span></div>
            <div className="p-2 rounded bg-secondary/30 flex justify-between"><span>BMRI</span><span>Cum: 18 Jan 2026</span></div>
            <div className="p-2 rounded bg-secondary/30 flex justify-between"><span>TLKM</span><span>Cum: 22 Jan 2026</span></div>
          </div>
        </div>
      </div>

      <div className="glass-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-primary" /> Perbandingan Sektor (Mock)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Sektor', 'Jumlah Emiten', 'Avg PER', 'Avg PBV'].map(h => (
                  <th key={h} className="px-3 py-2 text-left text-xs text-muted-foreground uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bySector.map(item => (
                <tr key={item.sector} className="border-b border-border/50">
                  <td className="px-3 py-2">{item.sector}</td>
                  <td className="px-3 py-2">{item.count}</td>
                  <td className="px-3 py-2">{item.avgPer.toFixed(2)}</td>
                  <td className="px-3 py-2">{item.avgPbv.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
