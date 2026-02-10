import { ReactNode } from 'react';
import Navbar from './Navbar';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 p-4 max-w-[1600px] w-full mx-auto">
        {children}
      </main>
      <footer className="border-t border-border py-3 px-4">
        <p className="text-xs text-muted-foreground text-center">
          ⚠️ Disclaimer: IDX Pulse bukan rekomendasi investasi. Lakukan riset sendiri sebelum mengambil keputusan investasi.
        </p>
      </footer>
    </div>
  );
}
