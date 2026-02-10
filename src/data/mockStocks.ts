export interface StockData {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  per: number;
  pbv: number;
  roe: number;
  eps: number;
  high52w: number;
  low52w: number;
  open: number;
  high: number;
  low: number;
  prevClose: number;
}

export interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  tickers: string[];
  sentiment: 'positif' | 'netral' | 'negatif';
  summary: string;
}

export interface JournalEntry {
  id: string;
  ticker: string;
  entryPrice: number;
  exitPrice: number | null;
  entryDate: string;
  exitDate: string | null;
  timeframe: string;
  reasons: string[];
  rrPlan: string;
  emotion: string;
  pnl: number | null;
  status: 'open' | 'closed';
}

export const IDX_SECTORS = [
  'Finance', 'Mining', 'Consumer', 'Infrastructure', 'Property',
  'Technology', 'Healthcare', 'Energy', 'Telecom', 'Industrial',
];

export const MOCK_STOCKS: StockData[] = [
  { ticker: 'BBCA', name: 'Bank Central Asia Tbk', sector: 'Finance', price: 9875, change: 125, changePercent: 1.28, volume: 15234000, marketCap: 1215000000000000, per: 24.5, pbv: 4.8, roe: 19.6, eps: 403, high52w: 10450, low52w: 8200, open: 9750, high: 9900, low: 9700, prevClose: 9750 },
  { ticker: 'BBRI', name: 'Bank Rakyat Indonesia Tbk', sector: 'Finance', price: 4850, change: -50, changePercent: -1.02, volume: 45678000, marketCap: 735000000000000, per: 12.8, pbv: 2.4, roe: 18.8, eps: 379, high52w: 5525, low52w: 4100, open: 4900, high: 4920, low: 4830, prevClose: 4900 },
  { ticker: 'TLKM', name: 'Telkom Indonesia Tbk', sector: 'Telecom', price: 3450, change: 30, changePercent: 0.88, volume: 32100000, marketCap: 341000000000000, per: 15.2, pbv: 3.1, roe: 20.4, eps: 227, high52w: 4150, low52w: 3050, open: 3420, high: 3480, low: 3400, prevClose: 3420 },
  { ticker: 'ASII', name: 'Astra International Tbk', sector: 'Industrial', price: 5225, change: -75, changePercent: -1.42, volume: 12890000, marketCap: 211000000000000, per: 8.5, pbv: 1.2, roe: 14.1, eps: 615, high52w: 6200, low52w: 4500, open: 5300, high: 5325, low: 5200, prevClose: 5300 },
  { ticker: 'UNVR', name: 'Unilever Indonesia Tbk', sector: 'Consumer', price: 3780, change: 60, changePercent: 1.61, volume: 8900000, marketCap: 144000000000000, per: 32.1, pbv: 28.5, roe: 88.8, eps: 118, high52w: 4500, low52w: 3100, open: 3720, high: 3800, low: 3700, prevClose: 3720 },
  { ticker: 'BMRI', name: 'Bank Mandiri Tbk', sector: 'Finance', price: 6350, change: 100, changePercent: 1.60, volume: 22450000, marketCap: 592000000000000, per: 10.2, pbv: 2.1, roe: 20.6, eps: 622, high52w: 7250, low52w: 5200, open: 6250, high: 6375, low: 6225, prevClose: 6250 },
  { ticker: 'GOTO', name: 'GoTo Gojek Tokopedia Tbk', sector: 'Technology', price: 76, change: 2, changePercent: 2.70, volume: 982340000, marketCap: 89000000000000, per: -15.2, pbv: 0.8, roe: -5.3, eps: -5, high52w: 108, low52w: 52, open: 74, high: 78, low: 73, prevClose: 74 },
  { ticker: 'ADRO', name: 'Adaro Energy Tbk', sector: 'Mining', price: 2870, change: -30, changePercent: -1.03, volume: 28900000, marketCap: 91000000000000, per: 5.8, pbv: 0.9, roe: 15.5, eps: 495, high52w: 3500, low52w: 2100, open: 2900, high: 2920, low: 2850, prevClose: 2900 },
  { ticker: 'ICBP', name: 'Indofood CBP Tbk', sector: 'Consumer', price: 11200, change: 200, changePercent: 1.82, volume: 5670000, marketCap: 131000000000000, per: 18.7, pbv: 3.9, roe: 20.8, eps: 599, high52w: 12800, low52w: 9500, open: 11000, high: 11250, low: 10950, prevClose: 11000 },
  { ticker: 'ANTM', name: 'Aneka Tambang Tbk', sector: 'Mining', price: 1645, change: 45, changePercent: 2.81, volume: 67800000, marketCap: 39500000000000, per: 9.3, pbv: 1.5, roe: 16.1, eps: 177, high52w: 2100, low52w: 1200, open: 1600, high: 1660, low: 1590, prevClose: 1600 },
  { ticker: 'BRIS', name: 'Bank Syariah Indonesia Tbk', sector: 'Finance', price: 2540, change: 20, changePercent: 0.79, volume: 18900000, marketCap: 103000000000000, per: 16.4, pbv: 2.8, roe: 17.1, eps: 155, high52w: 3050, low52w: 2100, open: 2520, high: 2560, low: 2510, prevClose: 2520 },
  { ticker: 'EMTK', name: 'Elang Mahkota Teknologi Tbk', sector: 'Technology', price: 490, change: -10, changePercent: -2.00, volume: 14500000, marketCap: 27000000000000, per: -8.2, pbv: 0.6, roe: -7.3, eps: -60, high52w: 720, low52w: 380, open: 500, high: 505, low: 485, prevClose: 500 },
];

function generateCandleData(basePrice: number, days: number): CandleData[] {
  const data: CandleData[] = [];
  let price = basePrice * 0.85;
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const volatility = price * 0.025;
    const open = price + (Math.random() - 0.48) * volatility;
    const close = open + (Math.random() - 0.47) * volatility;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    const volume = Math.floor(5000000 + Math.random() * 30000000);

    price = close;
    data.push({
      time: date.toISOString().split('T')[0],
      open: Math.round(open),
      high: Math.round(high),
      low: Math.round(low),
      close: Math.round(close),
      volume,
    });
  }
  return data;
}

export function getCandleData(ticker: string): CandleData[] {
  const stock = MOCK_STOCKS.find(s => s.ticker === ticker);
  return generateCandleData(stock?.price ?? 5000, 200);
}

export const MOCK_NEWS: NewsItem[] = [
  { id: '1', title: 'BBCA Cetak Laba Bersih Rp 50,2 Triliun di 2025', source: 'Kontan', time: '2 jam lalu', tickers: ['BBCA'], sentiment: 'positif', summary: 'Bank Central Asia membukukan laba bersih yang meningkat 12% YoY.' },
  { id: '2', title: 'IHSG Melemah Tertekan Sentimen Global', source: 'Bisnis Indonesia', time: '3 jam lalu', tickers: [], sentiment: 'negatif', summary: 'Indeks Harga Saham Gabungan ditutup melemah 0.8% di tengah tekanan jual asing.' },
  { id: '3', title: 'GOTO Umumkan Buyback Saham Rp 2 Triliun', source: 'Kontan', time: '4 jam lalu', tickers: ['GOTO'], sentiment: 'positif', summary: 'GoTo Group mengumumkan program buyback saham senilai Rp 2 triliun.' },
  { id: '4', title: 'ADRO Rencana Stock Split 1:5', source: 'Bisnis Indonesia', time: '5 jam lalu', tickers: ['ADRO'], sentiment: 'positif', summary: 'Adaro Energy merencanakan stock split dengan rasio 1:5.' },
  { id: '5', title: 'Sektor Perbankan Tertekan Kebijakan BI', source: 'Kontan', time: '6 jam lalu', tickers: ['BBRI', 'BMRI', 'BBCA'], sentiment: 'negatif', summary: 'Kebijakan suku bunga BI memberi tekanan pada sektor perbankan.' },
  { id: '6', title: 'ANTM Diuntungkan Harga Nikel Global', source: 'Bisnis Indonesia', time: '7 jam lalu', tickers: ['ANTM'], sentiment: 'positif', summary: 'Kenaikan harga nikel global memberi angin segar bagi Aneka Tambang.' },
  { id: '7', title: 'UNVR Luncurkan Produk Baru di Kategori Premium', source: 'Kontan', time: '8 jam lalu', tickers: ['UNVR'], sentiment: 'netral', summary: 'Unilever Indonesia meluncurkan lini produk baru di segmen premium.' },
  { id: '8', title: 'Investor Asing Net Sell Rp 1.2 Triliun Hari Ini', source: 'Bisnis Indonesia', time: '9 jam lalu', tickers: [], sentiment: 'negatif', summary: 'Foreign flow mencatat net sell signifikan di pasar reguler.' },
];

export const MOCK_JOURNAL: JournalEntry[] = [
  { id: '1', ticker: 'BBCA', entryPrice: 9500, exitPrice: 9875, entryDate: '2026-01-20', exitDate: '2026-02-05', timeframe: '1D', reasons: ['Breakout MA50', 'Volume spike'], rrPlan: '1:2', emotion: 'disiplin', pnl: 375, status: 'closed' },
  { id: '2', ticker: 'GOTO', entryPrice: 68, exitPrice: 76, entryDate: '2026-01-28', exitDate: '2026-02-08', timeframe: '1D', reasons: ['RSI oversold', 'Support kuat'], rrPlan: '1:3', emotion: 'ragu', pnl: 8, status: 'closed' },
  { id: '3', ticker: 'ANTM', entryPrice: 1600, exitPrice: null, entryDate: '2026-02-07', exitDate: null, timeframe: '1H', reasons: ['Breakout resistance', 'Sektor mining bullish'], rrPlan: '1:2', emotion: 'FOMO', pnl: null, status: 'open' },
  { id: '4', ticker: 'BBRI', entryPrice: 4950, exitPrice: 4850, entryDate: '2026-01-15', exitDate: '2026-01-22', timeframe: '1D', reasons: ['Bounce support'], rrPlan: '1:2', emotion: 'serakah', pnl: -100, status: 'closed' },
];

export function formatRupiah(num: number): string {
  if (num >= 1e15) return `Rp ${(num / 1e12).toFixed(0)}T`;
  if (num >= 1e12) return `Rp ${(num / 1e12).toFixed(1)}T`;
  if (num >= 1e9) return `Rp ${(num / 1e9).toFixed(1)}M`;
  return `Rp ${num.toLocaleString('id-ID')}`;
}

export function formatVolume(num: number): string {
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toString();
}
