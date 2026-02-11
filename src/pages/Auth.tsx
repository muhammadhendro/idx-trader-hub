import { useState } from 'react';
import { ShieldCheck, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function AuthPage() {
  const { loggedIn, user, login, logout } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-primary" />
        Auth & Profil Pengguna
      </h1>

      <div className="glass-card p-4 space-y-4">
        <div className="text-sm text-muted-foreground">
          Mode demo: autentikasi disimpan lokal untuk memisahkan sesi pengguna sebelum integrasi backend.
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nama"
            className="px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm"
          />
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            className="px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => login(name, email)}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm inline-flex items-center gap-2"
          >
            <LogIn className="w-4 h-4" /> Login Demo
          </button>
          <button
            onClick={logout}
            className="px-4 py-2 rounded-lg border border-border text-sm inline-flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      <div className="glass-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-2">Status Session</h3>
        <div className="space-y-1 text-sm">
          <p><span className="text-muted-foreground">Status:</span> {loggedIn ? 'Login' : 'Belum login'}</p>
          <p><span className="text-muted-foreground">Nama:</span> {user.name}</p>
          <p><span className="text-muted-foreground">Email:</span> {user.email}</p>
          <p><span className="text-muted-foreground">Role:</span> {user.role}</p>
        </div>
      </div>
    </div>
  );
}
