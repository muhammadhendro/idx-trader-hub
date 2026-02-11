import { useMemo } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';

export interface UserProfile {
  name: string;
  email: string;
  role: 'trader' | 'admin';
}

const defaultUser: UserProfile = {
  name: 'Guest Trader',
  email: 'guest@idxpulse.app',
  role: 'trader',
};

export function useAuth() {
  const [session, setSession] = useLocalStorage<{ loggedIn: boolean; user: UserProfile }>('idxpulse:session', {
    loggedIn: false,
    user: defaultUser,
  });

  const login = (name: string, email: string) => {
    setSession({
      loggedIn: true,
      user: { name: name || defaultUser.name, email: email || defaultUser.email, role: 'trader' },
    });
  };

  const logout = () => {
    setSession({ loggedIn: false, user: defaultUser });
  };

  return useMemo(
    () => ({
      loggedIn: session.loggedIn,
      user: session.user,
      login,
      logout,
    }),
    [session]
  );
}
