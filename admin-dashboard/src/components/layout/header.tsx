'use client';

import {
  Bars3Icon,
  BellIcon,
  SunIcon,
  MoonIcon,
  ClockIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { useTheme } from '@/hooks/use-theme';
import { useNotifications } from '@/hooks/use-notifications';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const [userProfile, setUserProfile] = useState({ firstName: 'Admin', lastName: 'User', email: 'admin@pos.com' });
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('settings_profile');
    if (saved) setUserProfile(JSON.parse(saved));
  }, []);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  const initials = `${userProfile.firstName[0]}${userProfile.lastName[0]}`;

  return (
    <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-divider/60 shadow-sm shadow-primary/5">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">

        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl text-text-secondary hover:text-primary hover:bg-surface transition-colors lg:hidden"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>

        {/* Brand / Breadcrumb area */}
        <div className="flex-1 min-w-0 ml-2 lg:ml-0 flex items-center gap-3">
          <div className="hidden lg:flex flex-col">
            <span className="text-lg font-black text-primary tracking-tight leading-none">Taura</span>
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.15em] leading-none mt-0.5">Admin Console</span>
          </div>
          {/* Live clock (desktop only) */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface border border-divider/60 ml-4">
            <ClockIcon className="h-3.5 w-3.5 text-text-secondary" />
            <span className="text-xs font-bold text-text-secondary tabular-nums">{currentTime}</span>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-1 sm:gap-2">

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 sm:p-2.5 rounded-xl text-text-secondary hover:text-primary hover:bg-surface/80 border border-transparent hover:border-divider/60 transition-all active:scale-95 group"
            title="Toggle theme"
          >
            {theme === 'dark' ? (
              <SunIcon className="h-5 w-5 transition-transform group-hover:rotate-45" />
            ) : (
              <MoonIcon className="h-5 w-5 transition-transform group-hover:-rotate-12" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 sm:p-2.5 rounded-xl text-text-secondary hover:text-primary hover:bg-surface/80 border border-transparent hover:border-divider/60 transition-all active:scale-95 relative group"
            >
              <BellIcon className="h-5 w-5 transition-transform group-hover:rotate-12" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-gradient-to-br from-error to-error/80 text-[9px] font-black text-white rounded-full flex items-center justify-center border-2 border-card">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 mt-3 w-96 bg-card rounded-2xl shadow-2xl border border-divider z-50 overflow-hidden origin-top-right">
                  <div className="p-4 bg-gradient-to-r from-primary/5 to-transparent border-b border-divider flex items-center justify-between">
                    <div>
                      <h3 className="font-black text-primary text-sm">Notifications</h3>
                      <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold mt-0.5">Latest Alerts</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-7 text-[10px] px-2 font-bold" onClick={markAllAsRead}>Mark all read</Button>
                      <Button variant="ghost" size="sm" className="h-7 text-[10px] px-2 font-bold text-error hover:bg-error/5" onClick={clearAll}>Clear</Button>
                    </div>
                  </div>

                  <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-10 text-center">
                        <BellIcon className="h-10 w-10 text-text-secondary/30 mx-auto mb-3" />
                        <p className="text-sm italic text-text-secondary">You're all caught up!</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markAsRead(n.id)}
                          className={`p-4 border-b border-divider/50 hover:bg-surface/60 transition-colors cursor-pointer ${!n.isRead ? 'border-l-2 border-l-primary bg-primary/[0.03]' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${n.type === 'error' ? 'bg-error' :
                              n.type === 'warning' ? 'bg-warning' :
                                n.type === 'success' ? 'bg-success' : 'bg-primary'
                              } ${!n.isRead ? 'animate-pulse' : 'opacity-30'}`} />
                            <div className="space-y-0.5 pr-4 min-w-0">
                              <p className={`text-sm font-bold truncate ${!n.isRead ? 'text-primary' : 'text-text-secondary'}`}>{n.title}</p>
                              <p className="text-xs text-text-secondary leading-relaxed">{n.message}</p>
                              <div className="flex items-center gap-1.5 pt-0.5 opacity-50">
                                <ClockIcon className="h-3 w-3" />
                                <span className="text-[10px] font-medium">{formatDate(n.timestamp)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-divider/80 mx-1" />

          {/* User profile pill */}
          <div className="flex items-center gap-2.5 pl-1 group cursor-pointer select-none rounded-xl px-2 py-1 hover:bg-surface/80 border border-transparent hover:border-divider/60 transition-all">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="h-9 w-9 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center shadow-md shadow-primary/25 group-hover:scale-105 transition-transform">
                <span className="text-xs font-black text-white tracking-wide">{initials}</span>
              </div>
              {/* Online status dot */}
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-success rounded-full border-2 border-card" />
            </div>
            {/* Name + role */}
            <div className="text-left hidden sm:block">
              <p className="text-sm font-black text-primary leading-tight group-hover:text-primary-light transition-colors">
                {userProfile.firstName} {userProfile.lastName}
              </p>
              <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider leading-tight">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
