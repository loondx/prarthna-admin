'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export interface AdminSession {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextValue {
  session: AdminSession | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const API_BASE = `${(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001').replace(/\/$/, '')}/api/v1`;
const COOKIE_NAME = 'prarthna_admin_token';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, hours = 8) {
  const exp = new Date(Date.now() + hours * 3600 * 1000).toUTCString();
  // Secure is added automatically when served over HTTPS (production).
  const secure =
    typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${exp}; path=/; SameSite=Strict${secure}`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from cookie on mount
  useEffect(() => {
    const savedToken = getCookie(COOKIE_NAME);
    if (!savedToken) { setLoading(false); return; }

    fetch(`${API_BASE}/admin/me`, {
      headers: { Authorization: `Bearer ${savedToken}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.sub) {
          setToken(savedToken);
          setSession({ id: data.sub, email: data.email, name: data.name, role: data.role });
        } else {
          deleteCookie(COOKIE_NAME);
        }
      })
      .catch(() => deleteCookie(COOKIE_NAME))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message ?? 'Invalid credentials');
    }

    const data = await res.json();
    setCookie(COOKIE_NAME, data.token, 8);
    setToken(data.token);
    setSession(data.admin);
  }, []);

  const logout = useCallback(() => {
    deleteCookie(COOKIE_NAME);
    setToken(null);
    setSession(null);
    window.location.href = '/login';
  }, []);

  return (
    <AuthContext.Provider value={{ session, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
