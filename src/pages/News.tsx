import NewsPanel from '@/components/NewsPanel';
import { Newspaper } from 'lucide-react';

export default function NewsPage() {
  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
        <Newspaper className="w-5 h-5 text-primary" />
        News & Sentiment IDX
      </h1>
      <NewsPanel />
    </div>
  );
}
