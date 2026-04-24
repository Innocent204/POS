'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isTokenExpired } from '@/lib/utils';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleLogout = () => {
      localStorage.clear();
      document.cookie = 'access_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      setAuthenticated(false);
      router.push('/login');
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token' && !e.newValue) {
        handleLogout();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    const checkAuth = () => {
      const token = localStorage.getItem('access_token');
      
      if (!token || isTokenExpired(token)) {
        handleLogout();
        return;
      }

      setAuthenticated(true);
      setLoading(false);
    };

    checkAuth();

    // Proactive check every 30 seconds
    const interval = setInterval(checkAuth, 30000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return authenticated ? <>{children}</> : null;
}
