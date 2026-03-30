'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LockClosedIcon,
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightOnRectangleIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getErrorMessage } from '@/lib/utils';

import { api } from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // For entrance animation and auth check
  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('access_token');
    if (token) {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.auth.login({ email, password });

      if (response.success && response.data) {
        const { accessToken, refreshToken, fullName, role } = response.data;

        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        localStorage.setItem('user_name', fullName);
        localStorage.setItem('user_role', role);

        // Set cookie for middleware
        document.cookie = `access_token=${accessToken}; path=/; max-age=86400`;

        router.push('/dashboard');
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-dark via-primary to-[#0f172a] overflow-hidden p-6 relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-primary-light/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[10%] right-[5%] w-96 h-96 bg-accent/20 rounded-full blur-[120px]" />
      </div>

      <div className={`max-w-md w-full space-y-8 transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
        {/* Branding Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-[2rem] flex items-center justify-center shadow-2xl relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CubeIcon className="h-10 w-10 text-white relative z-10" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-white tracking-tighter">POS Admin</h1>
            <p className="text-white/70 font-medium">Real-Time Inventory Dashboard</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="card p-8 bg-surface border-none shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary-light" />

          <div className="mb-8">
            <h2 className="text-2xl font-black text-primary tracking-tight">Welcome back</h2>
            <p className="text-text-secondary text-sm font-medium">Sign in to your administrative account</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-bold text-primary">Email Address</Label>
                <div className="relative group">
                  <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="!pl-12 h-12 bg-white/50 border-divider focus:border-primary focus:ring-primary/20 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="font-bold text-primary">Password</Label>
                </div>
                <div className="relative group">
                  <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="!pl-12 !pr-12 h-12 bg-white/50 border-divider focus:border-primary focus:ring-primary/20 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-error/5 border border-error/10 rounded-xl animate-shake">
                <p className="text-center text-sm font-bold text-error leading-relaxed">
                  {error}
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-primary hover:bg-primary-dark text-white rounded-2xl font-black text-lg shadow-lg hover:shadow-primary/30 transition-all active:scale-[0.98] mt-2 relative overflow-hidden group/btn"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span>Sign In</span>
                </div>
              )}
            </Button>
          </form>

          {/* Card Footer */}
          <div className="mt-8 pt-6 border-t border-divider text-center">
            <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest leading-loose">
              EcoTracker POS Web <br />
              &copy; 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
