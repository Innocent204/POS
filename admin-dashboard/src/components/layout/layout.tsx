'use client';

import { useState } from 'react';
import Sidebar from './sidebar';
import Header from './header';
import AuthGuard from '@/components/auth/auth-guard';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex h-screen">
        {/* Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 h-screen
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${sidebarMinimized ? 'lg:w-16' : 'lg:w-64'}
          w-64
        `}>
          <Sidebar 
            onClose={() => setSidebarOpen(false)} 
            onToggleMinimize={() => setSidebarMinimized(!sidebarMinimized)}
            isMinimized={sidebarMinimized}
          />
        </div>

        {/* Main content */}
        <div className="flex-1 lg:ml-0 min-w-0 overflow-y-auto">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
    </AuthGuard>
  );
}
