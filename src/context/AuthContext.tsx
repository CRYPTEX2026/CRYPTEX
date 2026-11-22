import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (arg1: string, arg2: string | User) => void | boolean;
  register: (userData: { fullName: string; email: string; password: string; btcWalletAddress?: string }) => { success: boolean; error?: string };
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('cryptex_user');
    if (savedUser) {
      try { return JSON.parse(savedUser); } catch (e) { return null; }
    }
    if (localStorage.getItem('cryptex_admin') === 'true') {
      return {
        id: 'usr_admin',
        email: 'Cryptex2026',
        fullName: 'System Administrator',
        role: 'admin',
        mfaEnabled: true,
        kycStatus: 'approved',
        createdAt: new Date().toISOString()
      };
    }
    return null;
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem('cryptex_token'));
  const [loading] = useState<boolean>(false);

  useEffect(() => {
    const savedUsers = localStorage.getItem('cryptex_users');
    if (savedUsers) {
      try {
        const parsed: User[] = JSON.parse(savedUsers);
        const migrated = parsed.map(u => {
          if (!u.balances) {
            const oldBal = u.balance || 0;
            return {
              ...u,
              balance: oldBal,
              balances: { USDT: oldBal, USDC: 0, BTC: 0, ETH: 0, SOL: 0 }
            };
          }
          return u;
        });
        localStorage.setItem('cryptex_users', JSON.stringify(migrated));
      } catch (e) {}
    } else {
      const initialUsers: User[] = [
        {
          id: 'usr_admin',
          email: 'Cryptex2026',
          fullName: 'System Administrator',
          role: 'admin',
          mfaEnabled: true,
          kycStatus: 'approved',
          createdAt: new Date().toISOString(),
          balance: 0,
          balances: { USDT: 0, USDC: 0, BTC: 0, ETH: 0, SOL: 0 }
        }
      ];
      localStorage.setItem('cryptex_users', JSON.stringify(initialUsers));
    }
  }, []);

  const login = (arg1: string, arg2: string | User) => {
    if (typeof arg2 === 'object' && arg2 !== null) {
      // Called as login(token, user)
      const token = arg1;
      const usr = arg2 as User;
      localStorage.setItem('cryptex_token', token);
      localStorage.setItem('cryptex_user', JSON.stringify(usr));
      if (usr.role === 'admin') {
        localStorage.setItem('cryptex_admin', 'true');
      }
      setToken(token);
      setUser(usr);
      return true;
    } else {
      // Called as login(email, password)
      const email = arg1;
      const pass = arg2 as string;
      if (email === 'Cryptex2026' && pass === 'CRYP_tex26@') {
        const adminUser: User = {
          id: 'usr_admin',
          email: 'Cryptex2026',
          fullName: 'System Administrator',
          role: 'admin',
          mfaEnabled: true,
          kycStatus: 'approved',
          createdAt: new Date().toISOString()
        };
        const t = 'tok_' + Math.random().toString(36).substring(2) + Date.now();
        localStorage.setItem('cryptex_token', t);
        localStorage.setItem('cryptex_user', JSON.stringify(adminUser));
        localStorage.setItem('cryptex_admin', 'true');
        setToken(t);
        setUser(adminUser);
        return true;
      }

      try {
        const stored = localStorage.getItem('cryptex_users');
        const users: User[] = stored ? JSON.parse(stored) : [];
        const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (!found) {
          throw new Error('User not found. Please register or check your credentials.');
        }
        const t = 'tok_' + Math.random().toString(36).substring(2) + Date.now();
        localStorage.setItem('cryptex_token', t);
        localStorage.setItem('cryptex_user', JSON.stringify(found));
        localStorage.removeItem('cryptex_admin');
        setToken(t);
        setUser(found);
        return true;
      } catch (err: any) {
        throw err;
      }
    }
  };

  const register = (userData: { fullName: string; email: string; password: string; btcWalletAddress?: string }) => {
    try {
      const stored = localStorage.getItem('cryptex_users');
      const users: User[] = stored ? JSON.parse(stored) : [];
      if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
        return { success: false, error: 'Email already registered.' };
      }

      const newUser: User = {
        id: 'usr_' + Date.now(),
        email: userData.email,
        fullName: userData.fullName,
        btcWalletAddress: userData.btcWalletAddress || undefined,
        role: 'customer',
        mfaEnabled: false,
        kycStatus: 'not_started',
        createdAt: new Date().toISOString(),
        balance: 0,
        balances: { USDT: 0, USDC: 0, BTC: 0, ETH: 0, SOL: 0 }
      };

      users.push(newUser);
      localStorage.setItem('cryptex_users', JSON.stringify(users));

      const t = 'tok_' + Math.random().toString(36).substring(2) + Date.now();
      localStorage.setItem('cryptex_token', t);
      localStorage.setItem('cryptex_user', JSON.stringify(newUser));
      localStorage.removeItem('cryptex_admin');
      setToken(t);
      setUser(newUser);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('cryptex_token');
    localStorage.removeItem('cryptex_user');
    localStorage.removeItem('cryptex_admin');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    localStorage.setItem('cryptex_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
