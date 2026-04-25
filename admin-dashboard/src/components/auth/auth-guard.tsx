'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const isTokenExpired = (token: string) => {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (!payload.exp) return false;
        return (payload.exp * 1000) < (Date.now() + 10000);
      } catch (e) {
        return false; // If not a JWT, don't proactively expire it here
      }
    };

    const validateSession = async () => {
      try {
        // Make a lightweight call to check if the session is still valid on the server
        await api.dashboard.getSummary();
        return true;
      } catch (err: any) {
        // If 401, the interceptor in api.ts will handle the logout
        return false;
      }
    };

    const checkAuth = async (verifyWithServer = false) => {
      const token = localStorage.getItem('access_token');
      
      if (!token || isTokenExpired(token)) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        document.cookie = 'access_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        setAuthenticated(false);
        setLoading(false);
        router.replace('/login');
        return;
      }
      
      setAuthenticated(true);
      setLoading(false);

      if (verifyWithServer) {
        await validateSession();
      }
    };

    // Initial check
    checkAuth(true);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token' && !e.newValue) {
        checkAuth();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    const handleFocus = () => {
      checkAuth(true); // Verify with server when tab is refocused
    };
    window.addEventListener('focus', handleFocus);

    // Heartbeat: Check with server every 1 minute
    const interval = setInterval(() => {
      checkAuth(true);
    }, 60000); 

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
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
