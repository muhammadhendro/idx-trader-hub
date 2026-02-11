import { useEffect, useMemo, useState } from 'react';
import { MOCK_NEWS, MOCK_STOCKS, type NewsItem, type StockData } from '@/data/mockStocks';

const YAHOO_SYMBOLS = MOCK_STOCKS.map(stock => `${stock.ticker}.JK`).join(',');
const YAHOO_URL = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${YAHOO_SYMBOLS}`;
const STOOQ_SYMBOLS = MOCK_STOCKS.map(stock => `${stock.ticker.toLowerCase()}.jk`).join(',');
const STOOQ_URL = `https://stooq.com/q/l/?s=${STOOQ_SYMBOLS}&f=sd2t2ohlcv&h&e=csv`;

function jitter(value: number, pct: number) {
  const delta = value * pct * (Math.random() - 0.5);
  return Math.max(1, Math.round(value + delta));
}

function shiftNews(news: NewsItem[]): NewsItem[] {
  return news.map((item, idx) => ({
    ...item,
    time: `${idx + 1} jam lalu`,
  }));
}

function symbolToTicker(symbol?: string) {
  if (!symbol) return null;
  return symbol.replace('.JK', '').toUpperCase();
}

function parseStooqCsv(csv: string) {
  const lines = csv.trim().split('\n').filter(Boolean);
  if (lines.length <= 1) return [];
  const rows = lines.slice(1).map(line => {
    const [symbol, date, time, open, high, low, close, volume] = line.split(',');
    return {
      symbol,
      date,
      time,
      open: Number(open),
      high: Number(high),
      low: Number(low),
      close: Number(close),
      volume: Number(volume),
    };
  });

  return rows.filter(row => row.symbol && Number.isFinite(row.close) && row.close > 0);
}

export function useMarketFeed() {
  const [stocks, setStocks] = useState<StockData[]>(MOCK_STOCKS);
  const [news, setNews] = useState<NewsItem[]>(shiftNews(MOCK_NEWS));
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString());
  const [source, setSource] = useState<'api-yahoo' | 'api-stooq' | 'simulated'>('simulated');

  useEffect(() => {
    let mounted = true;

    const simulateTick = () => {
      setStocks(current =>
        current.map(stock => {
          const price = jitter(stock.price, 0.01);
          const change = price - stock.prevClose;
          const changePercent = (change / stock.prevClose) * 100;

          return {
            ...stock,
            price,
            change,
            changePercent,
            volume: jitter(stock.volume, 0.08),
            high: Math.max(stock.high, price),
            low: Math.min(stock.low, price),
          };
        })
      );

      setNews(current => {
        if (Math.random() < 0.35) {
          const randomStock = MOCK_STOCKS[Math.floor(Math.random() * MOCK_STOCKS.length)];
          const sentiment: NewsItem['sentiment'] = Math.random() > 0.6 ? 'negatif' : 'positif';
          const title = sentiment === 'positif'
            ? `${randomStock.ticker} Diminati Investor Asing pada Sesi Siang`
            : `${randomStock.ticker} Tertekan Aksi Profit Taking`;

          const newItem: NewsItem = {
            id: `${Date.now()}`,
            title,
            source: Math.random() > 0.5 ? 'Kontan' : 'Bisnis Indonesia',
            time: 'baru saja',
            tickers: [randomStock.ticker],
            sentiment,
            summary: sentiment === 'positif'
              ? `Pergerakan ${randomStock.ticker} didukung volume transaksi yang meningkat.`
              : `Pelaku pasar mencatat aksi jual jangka pendek pada ${randomStock.ticker}.`,
          };
          return [newItem, ...shiftNews(current)].slice(0, 20);
        }

        return shiftNews(current);
      });

      setLastUpdated(new Date().toISOString());
      setSource('simulated');
    };

    const applyQuotes = (byTicker: Record<string, { price: number; change?: number; changePercent?: number; volume?: number; high?: number; low?: number }>, feedSource: 'api-yahoo' | 'api-stooq') => {
      setStocks(current =>
        current.map(stock => {
          const quote = byTicker[stock.ticker];
          if (!quote || !quote.price) return stock;

          return {
            ...stock,
            price: Math.round(quote.price),
            change: Math.round(quote.change ?? stock.change),
            changePercent: quote.changePercent ?? stock.changePercent,
            volume: Math.round(quote.volume ?? stock.volume),
            high: Math.round(quote.high ?? stock.high),
            low: Math.round(quote.low ?? stock.low),
          };
        })
      );
      setLastUpdated(new Date().toISOString());
      setSource(feedSource);
    };

    const refreshFromApi = async () => {
      try {
        const response = await fetch(YAHOO_URL);
        if (!response.ok) throw new Error(`Yahoo HTTP ${response.status}`);
        const payload = await response.json();
        const results = payload?.quoteResponse?.result as Array<{
          symbol?: string;
          regularMarketPrice?: number;
          regularMarketChange?: number;
          regularMarketChangePercent?: number;
          regularMarketVolume?: number;
          regularMarketDayHigh?: number;
          regularMarketDayLow?: number;
        }>;

        if (!Array.isArray(results) || results.length === 0) throw new Error('Yahoo empty payload');

        const byTicker = Object.fromEntries(
          results
            .map(item => [symbolToTicker(item.symbol), {
              price: item.regularMarketPrice ?? 0,
              change: item.regularMarketChange,
              changePercent: item.regularMarketChangePercent,
              volume: item.regularMarketVolume,
              high: item.regularMarketDayHigh,
              low: item.regularMarketDayLow,
            }] as const)
            .filter(([ticker, quote]) => Boolean(ticker) && quote.price > 0)
        ) as Record<string, { price: number; change?: number; changePercent?: number; volume?: number; high?: number; low?: number }>;

        if (!mounted) return;
        if (Object.keys(byTicker).length === 0) throw new Error('Yahoo parsed empty');

        applyQuotes(byTicker, 'api-yahoo');
        return;
      } catch {
        try {
          const response = await fetch(STOOQ_URL);
          if (!response.ok) throw new Error(`Stooq HTTP ${response.status}`);
          const csv = await response.text();
          const rows = parseStooqCsv(csv);
          if (!rows.length) throw new Error('Stooq empty');

          const byTicker = Object.fromEntries(
            rows.map(row => [row.symbol.replace('.JK', '').toUpperCase(), {
              price: row.close,
              volume: row.volume,
              high: row.high,
              low: row.low,
            }])
          ) as Record<string, { price: number; volume?: number; high?: number; low?: number }>;

          if (!mounted) return;
          applyQuotes(byTicker, 'api-stooq');
          return;
        } catch {
          if (mounted) simulateTick();
        }
      }
    };

    refreshFromApi();
    const timer = window.setInterval(refreshFromApi, 10000);

    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  const stockMap = useMemo(() => {
    return Object.fromEntries(stocks.map(stock => [stock.ticker, stock]));
  }, [stocks]);

  return { stocks, stockMap, news, lastUpdated, source };
}
