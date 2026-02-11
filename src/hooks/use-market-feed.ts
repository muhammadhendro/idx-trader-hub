import { useEffect, useMemo, useState } from 'react';
import { MOCK_NEWS, MOCK_STOCKS, type NewsItem, type StockData } from '@/data/mockStocks';

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

export function useMarketFeed() {
  const [stocks, setStocks] = useState<StockData[]>(MOCK_STOCKS);
  const [news, setNews] = useState<NewsItem[]>(shiftNews(MOCK_NEWS));
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString());

  useEffect(() => {
    const timer = window.setInterval(() => {
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
    }, 6000);

    return () => window.clearInterval(timer);
  }, []);

  const stockMap = useMemo(() => {
    return Object.fromEntries(stocks.map(stock => [stock.ticker, stock]));
  }, [stocks]);

  return { stocks, stockMap, news, lastUpdated };
}
