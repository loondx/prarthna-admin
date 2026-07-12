'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function LoginPage() {
  const { login, session, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState('admin@prarthna.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!loading && session) {
      const from = searchParams.get('from') ?? '/dashboard';
      router.replace(from);
    }
  }, [session, loading, router, searchParams]);

  useEffect(() => {
    setMounted(true);
    emailRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please enter email and password.'); return; }

    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      const from = searchParams.get('from') ?? '/dashboard';
      router.replace(from);
    } catch (err: any) {
      setError(err.message ?? 'Login failed. Check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1A100A] via-[#2D1E17] to-[#4A2E1E] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A100A] via-[#2D1E17] to-[#4A2E1E] flex items-center justify-center p-4">
      {/* Decorative background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#8C5A3C]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo card */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#8C5A3C] to-[#D99B26] shadow-2xl shadow-amber-600/20 mb-4">
            <span className="text-3xl">🕉️</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            PRARTHNA
          </h1>
          <p className="text-amber-200/50 text-xs mt-1 uppercase tracking-widest font-semibold">
            Admin Portal
          </p>
        </div>

        {/* Login form card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white">Sign in to continue</h2>
            <p className="text-white/40 text-xs mt-1">
              Access restricted to authorized administrators only.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">
                Email address
              </label>
              <input
                ref={emailRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
                className="w-full bg-[#1A100A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-400/60 focus:bg-black/50 transition-all"
                placeholder="admin@prarthna.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="w-full bg-[#1A100A] border border-white/10 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-400/60 focus:bg-black/50 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors text-xs"
                  tabIndex={-1}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <span className="text-red-400 text-xs">⚠️</span>
                <p className="text-red-300 text-xs">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-[#8C5A3C] to-[#D99B26] hover:from-[#764C32] hover:to-[#C48B1F] disabled:opacity-60 text-white font-bold text-sm py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-amber-900/30 mt-2 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                <>Sign In →</>
              )}
            </button>
          </form>

          {/* Hint */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <p className="text-[10px] text-white/25 text-center leading-relaxed">
              Default credentials are seeded from environment variables.<br />
              Contact your system administrator if you need access.
            </p>
          </div>
        </div>

        {/* Version footer */}
        <p className="text-center text-white/20 text-[10px] mt-6 uppercase tracking-widest">
          Prarthna Platform v1.0 · Admin Panel
        </p>
      </div>
    </div>
  );
}
