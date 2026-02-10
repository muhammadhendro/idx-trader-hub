import { useEffect, useRef, useState } from 'react';
import { createChart, CandlestickSeries, HistogramSeries, LineSeries, type IChartApi } from 'lightweight-charts';
import { CandleData } from '@/data/mockStocks';

interface StockChartProps {
  data: CandleData[];
  ticker: string;
}

function calcMA(data: CandleData[], period: number) {
  return data.map((d, i) => {
    if (i < period - 1) return null;
    const slice = data.slice(i - period + 1, i + 1);
    const avg = slice.reduce((s, c) => s + c.close, 0) / period;
    return { time: d.time, value: Math.round(avg) };
  }).filter(Boolean) as { time: string; value: number }[];
}

function calcRSI(data: CandleData[], period: number = 14) {
  const rsi: { time: string; value: number }[] = [];
  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? -change : 0);

    if (i >= period) {
      const avgGain = gains.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsi.push({ time: data[i].time, value: Math.round(100 - 100 / (1 + rs)) });
    }
  }
  return rsi;
}

function calcMACD(data: CandleData[]) {
  const ema = (arr: number[], period: number) => {
    const result: number[] = [];
    const k = 2 / (period + 1);
    result[0] = arr[0];
    for (let i = 1; i < arr.length; i++) {
      result[i] = arr[i] * k + result[i - 1] * (1 - k);
    }
    return result;
  };

  const closes = data.map(d => d.close);
  const ema12 = ema(closes, 12);
  const ema26 = ema(closes, 26);
  const macdLine = ema12.map((v, i) => v - ema26[i]);
  const signal = ema(macdLine.slice(25), 9);

  const result: { time: string; macd: number; signal: number; histogram: number }[] = [];
  for (let i = 33; i < data.length; i++) {
    const mIdx = i;
    const sIdx = i - 33;
    if (sIdx >= 0 && sIdx < signal.length) {
      result.push({
        time: data[i].time,
        macd: Math.round(macdLine[mIdx]),
        signal: Math.round(signal[sIdx]),
        histogram: Math.round(macdLine[mIdx] - signal[sIdx]),
      });
    }
  }
  return result;
}

export default function StockChart({ data, ticker }: StockChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const rsiRef = useRef<HTMLDivElement>(null);
  const macdRef = useRef<HTMLDivElement>(null);
  const [showMA20, setShowMA20] = useState(true);
  const [showMA50, setShowMA50] = useState(true);
  const [showMA200, setShowMA200] = useState(false);

  useEffect(() => {
    if (!chartRef.current || !rsiRef.current || !macdRef.current) return;

    // Main chart
    const chart = createChart(chartRef.current, {
      layout: { background: { color: 'transparent' }, textColor: '#8a919e' },
      grid: { vertLines: { color: '#1e2330' }, horzLines: { color: '#1e2330' } },
      crosshair: { mode: 0 },
      rightPriceScale: { borderColor: '#2a2e39' },
      timeScale: { borderColor: '#2a2e39', timeVisible: true },
      width: chartRef.current.clientWidth,
      height: 400,
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });
    candleSeries.setData(data.map(d => ({ time: d.time, open: d.open, high: d.high, low: d.low, close: d.close })));

    const volSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'vol',
    });
    chart.priceScale('vol').applyOptions({ scaleMargins: { top: 0.85, bottom: 0 } });
    volSeries.setData(data.map(d => ({
      time: d.time,
      value: d.volume,
      color: d.close >= d.open ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)',
    })));

    // MAs
    if (showMA20) {
      const ma20 = chart.addSeries(LineSeries, { color: '#f59e0b', lineWidth: 1, priceLineVisible: false });
      ma20.setData(calcMA(data, 20));
    }
    if (showMA50) {
      const ma50 = chart.addSeries(LineSeries, { color: '#3b82f6', lineWidth: 1, priceLineVisible: false });
      ma50.setData(calcMA(data, 50));
    }
    if (showMA200) {
      const ma200 = chart.addSeries(LineSeries, { color: '#a855f7', lineWidth: 1, priceLineVisible: false });
      ma200.setData(calcMA(data, 200));
    }

    chart.timeScale().fitContent();

    // RSI chart
    const rsiChart = createChart(rsiRef.current, {
      layout: { background: { color: 'transparent' }, textColor: '#8a919e' },
      grid: { vertLines: { color: '#1e2330' }, horzLines: { color: '#1e2330' } },
      rightPriceScale: { borderColor: '#2a2e39' },
      timeScale: { borderColor: '#2a2e39', visible: false },
      width: rsiRef.current.clientWidth,
      height: 120,
      crosshair: { mode: 0 },
    });

    const rsiSeries = rsiChart.addSeries(LineSeries, { color: '#f59e0b', lineWidth: 2, priceLineVisible: false });
    rsiSeries.setData(calcRSI(data));

    // Overbought / oversold lines
    const rsiOverbought = rsiChart.addSeries(LineSeries, { color: '#ef4444', lineWidth: 1, lineStyle: 2, priceLineVisible: false });
    const rsiOversold = rsiChart.addSeries(LineSeries, { color: '#22c55e', lineWidth: 1, lineStyle: 2, priceLineVisible: false });
    const rsiTimes = calcRSI(data).map(d => d.time);
    rsiOverbought.setData(rsiTimes.map(t => ({ time: t, value: 70 })));
    rsiOversold.setData(rsiTimes.map(t => ({ time: t, value: 30 })));

    rsiChart.timeScale().fitContent();

    // MACD chart
    const macdChart = createChart(macdRef.current, {
      layout: { background: { color: 'transparent' }, textColor: '#8a919e' },
      grid: { vertLines: { color: '#1e2330' }, horzLines: { color: '#1e2330' } },
      rightPriceScale: { borderColor: '#2a2e39' },
      timeScale: { borderColor: '#2a2e39', visible: false },
      width: macdRef.current.clientWidth,
      height: 120,
      crosshair: { mode: 0 },
    });

    const macdData = calcMACD(data);
    const macdLineSeries = macdChart.addSeries(LineSeries, { color: '#3b82f6', lineWidth: 2, priceLineVisible: false });
    macdLineSeries.setData(macdData.map(d => ({ time: d.time, value: d.macd })));

    const signalSeries = macdChart.addSeries(LineSeries, { color: '#f59e0b', lineWidth: 1, priceLineVisible: false });
    signalSeries.setData(macdData.map(d => ({ time: d.time, value: d.signal })));

    const histSeries = macdChart.addSeries(HistogramSeries, { priceLineVisible: false });
    histSeries.setData(macdData.map(d => ({
      time: d.time,
      value: d.histogram,
      color: d.histogram >= 0 ? 'rgba(34,197,94,0.6)' : 'rgba(239,68,68,0.6)',
    })));

    macdChart.timeScale().fitContent();

    // Sync timescales
    chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
      if (range) {
        rsiChart.timeScale().setVisibleLogicalRange(range);
        macdChart.timeScale().setVisibleLogicalRange(range);
      }
    });

    const handleResize = () => {
      if (chartRef.current) chart.applyOptions({ width: chartRef.current.clientWidth });
      if (rsiRef.current) rsiChart.applyOptions({ width: rsiRef.current.clientWidth });
      if (macdRef.current) macdChart.applyOptions({ width: macdRef.current.clientWidth });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      rsiChart.remove();
      macdChart.remove();
    };
  }, [data, showMA20, showMA50, showMA200]);

  return (
    <div className="glass-card p-4 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{ticker} — Candlestick</h3>
        <div className="flex items-center gap-2">
          {[
            { label: 'MA20', active: showMA20, toggle: () => setShowMA20(!showMA20), color: 'bg-warning' },
            { label: 'MA50', active: showMA50, toggle: () => setShowMA50(!showMA50), color: 'bg-primary' },
            { label: 'MA200', active: showMA200, toggle: () => setShowMA200(!showMA200), color: 'bg-purple-500' },
          ].map(({ label, active, toggle, color }) => (
            <button
              key={label}
              onClick={toggle}
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono transition-colors ${
                active ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className={`w-2.5 h-0.5 rounded ${active ? color : 'bg-muted-foreground'}`} />
              {label}
            </button>
          ))}
        </div>
      </div>
      <div ref={chartRef} />
      <div className="flex items-center gap-2 pt-1">
        <span className="text-xs text-muted-foreground font-mono">RSI (14)</span>
      </div>
      <div ref={rsiRef} />
      <div className="flex items-center gap-2 pt-1">
        <span className="text-xs text-muted-foreground font-mono">MACD (12,26,9)</span>
      </div>
      <div ref={macdRef} />
    </div>
  );
}
