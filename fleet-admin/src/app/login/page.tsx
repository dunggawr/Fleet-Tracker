'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/Button';
import { Truck, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[radial-gradient(circle_at_top_right,_#1e1b4b,_#020617)] p-8">
      <div className="w-full max-w-[420px] bg-surface-low/50 backdrop-blur-2xl border border-white/10 rounded-xl p-12 shadow-lg">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-glow">
              <Truck size={28} className="text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-text tracking-tight m-0 leading-none">Fleet Tracker</h1>
          </div>
          <p className="text-text-dim text-[11px] font-bold uppercase tracking-[0.2em]">Admin Control Center</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {error && (
            <div className="flex items-center gap-2 p-4 bg-danger/10 border border-danger/20 rounded-lg text-danger text-[13px]">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-2.5">
            <label htmlFor="email" className="text-[11px] font-bold text-text-dim uppercase tracking-wider ml-1">
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Mail size={18} className="text-text-dim transition-colors duration-200 group-focus-within:text-primary" />
              </div>
              <input
                id="email"
                type="email"
                placeholder="admin@fleettracker.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-950/40 border border-white/10 rounded-lg pl-12 pr-5 h-[54px] text-text text-[15px] outline-none transition-all duration-200 focus:border-primary focus:bg-slate-950/60 focus:ring-4 focus:ring-primary/10 placeholder:text-white/20"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <label htmlFor="password" className="text-[11px] font-bold text-text-dim uppercase tracking-wider ml-1">
              Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Lock size={18} className="text-text-dim transition-colors duration-200 group-focus-within:text-primary" />
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-950/40 border border-white/10 rounded-lg pl-12 pr-5 h-[54px] text-text text-[15px] outline-none transition-all duration-200 focus:border-primary focus:bg-slate-950/60 focus:ring-4 focus:ring-primary/10 placeholder:text-white/20"
              />
            </div>
          </div>

          <div className="mt-2">
            <Button 
              variant="primary" 
              type="submit" 
              fullWidth
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign In to Dashboard'
              )}
            </Button>
          </div>
        </form>

        <div className="mt-12 text-center">
          <p className="text-[11px] text-text-dim tracking-wide">&copy; 2024 Fleet Tracker Systems. All rights reserved.</p>
        </div>
      </div>
    </div>

  );
}
