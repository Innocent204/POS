'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  BuildingOfficeIcon,
  ShoppingCartIcon,
  AdjustmentsHorizontalIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserGroupIcon,
  CubeIcon,
  BanknotesIcon,
  ArrowsRightLeftIcon,
  ClipboardDocumentCheckIcon,
  ShieldCheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  TableCellsIcon,
  PresentationChartBarIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

const navigationGroups = [
  {
    title: 'Main',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
      { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
      {
        name: 'Reports',
        icon: ClipboardDocumentCheckIcon,
        children: [
          { name: 'Dashboard Reports', href: '/reports/dashboard', icon: PresentationChartBarIcon },
          { name: 'Advanced Reports', href: '/reports/advanced', icon: TableCellsIcon },
        ]
      },
    ]
  },
  {
    title: 'Sales & Operations',
    items: [
      { name: 'Point of Sale', href: '/pos', icon: ShoppingCartIcon },
      { name: 'Sales History', href: '/sales', icon: BanknotesIcon },
    ]
  },
  {
    title: 'Inventory',
    items: [
      { name: 'Products', href: '/products', icon: CubeIcon },
      { name: 'Stock Levels', href: '/inventory', icon: AdjustmentsHorizontalIcon },
      { name: 'Transfers', href: '/transfers', icon: ArrowsRightLeftIcon },
    ]
  },
  {
    title: 'Management',
    items: [
      { name: 'Users (Staff)', href: '/users', icon: UserGroupIcon },
      { name: 'Branches', href: '/branches', icon: BuildingOfficeIcon },
      //  { name: 'Audit Logs', href: '/audit', icon: ShieldCheckIcon },
      { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
    ]
  },
];

interface SidebarProps {
  onClose?: () => void;
  onToggleMinimize?: () => void;
  isMinimized?: boolean;
}

export default function Sidebar({ onClose, onToggleMinimize, isMinimized = false }: SidebarProps) {
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    document.cookie = 'access_token=; path=/; max-age=0';
    document.cookie = 'refresh_token=; path=/; max-age=0';
    window.location.href = '/login';
  };

  return (
    <div className="flex flex-col h-screen bg-surface border-r border-divider/60">

      {/* ─── Logo / Brand ─────────────────────────────────────────── */}
      <div className={cn(
        "flex items-center h-16 px-4 bg-card border-b border-divider/60 shrink-0",
        isMinimized ? "justify-center" : "justify-between"
      )}>
        <div className="flex items-center gap-3">
          {/* Logo image */}
          <div className="relative flex-shrink-0 w-9 h-9">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/taura-brand.jpeg"
              alt="Taura Logo"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>

          {/* Brand text */}
          {!isMinimized && (
            <div className="hidden sm:block leading-none">
              <p className="text-base font-black text-primary tracking-tight">Taura</p>
              <p className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.18em] mt-0.5">Inventory Management</p>
            </div>
          )}
        </div>

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={onToggleMinimize}
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg hover:bg-surface transition-colors text-text-secondary hover:text-primary"
          title={isMinimized ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isMinimized ? (
            <ChevronRightIcon className="w-4 h-4" />
          ) : (
            <ChevronLeftIcon className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* ─── Navigation ───────────────────────────────────────────── */}
      <nav className="flex-1 px-2.5 py-4 space-y-6 overflow-y-auto no-scrollbar">
        {navigationGroups.map((group) => (
          <div key={group.title} className="space-y-0.5">
            {/* Section header */}
            {!isMinimized && (
              <p className="px-3 mb-2 text-[9px] font-black text-text-secondary/40 uppercase tracking-[0.25em]">
                {group.title}
              </p>
            )}

            {group.items.map((item) => {
              if (item.children) {
                const isChildActive = item.children.some(child => pathname === child.href);
                const isOpen = isChildActive; // Simple logic, could use state for manual toggle

                return (
                  <div key={item.name} className="space-y-0.5">
                    <div
                      className={cn(
                        'relative group flex items-center px-3 py-2.5 text-sm font-bold rounded-xl transition-all duration-200',
                        isChildActive
                          ? 'text-primary'
                          : 'text-text-secondary hover:bg-surface hover:text-primary',
                        isMinimized ? 'justify-center' : 'justify-start gap-3',
                        !isMinimized && "cursor-default"
                      )}
                    >
                      <item.icon
                        className={cn(
                          'shrink-0 h-5 w-5 transition-colors',
                          isChildActive ? 'text-primary' : 'text-text-secondary group-hover:text-primary'
                        )}
                      />
                      {!isMinimized && (
                        <>
                          <span className="truncate flex-1">{item.name}</span>
                          <ChevronDownIcon className={cn("w-3.5 h-3.5 transition-transform duration-200", isChildActive ? "rotate-0" : "-rotate-90")} />
                        </>
                      )}
                    </div>

                    {!isMinimized && (
                      <div className="pl-9 space-y-0.5">
                        {item.children.map((child) => {
                          const isSubActive = pathname === child.href;
                          return (
                            <Link
                              key={child.name}
                              href={child.href}
                              onClick={onClose}
                              className={cn(
                                'relative group flex items-center px-3 py-2 text-xs font-bold rounded-lg transition-all duration-200',
                                isSubActive
                                  ? 'bg-primary/5 text-primary'
                                  : 'text-text-secondary/70 hover:bg-surface hover:text-primary',
                                'gap-2.5'
                              )}
                            >
                              <child.icon className={cn("w-4 h-4", isSubActive ? "text-primary" : "text-text-secondary/50 group-hover:text-primary")} />
                              <span className="truncate">{child.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  title={isMinimized ? item.name : undefined}
                  className={cn(
                    'relative group flex items-center px-3 py-2.5 text-sm font-bold rounded-xl transition-all duration-200',
                    isActive
                      ? 'bg-primary/10 text-primary shadow-sm'
                      : 'text-text-secondary hover:bg-surface hover:text-primary',
                    isMinimized ? 'justify-center' : 'justify-start gap-3'
                  )}
                >
                  {/* Active left accent */}
                  {isActive && !isMinimized && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
                  )}

                  <item.icon
                    className={cn(
                      'shrink-0 h-5 w-5 transition-colors',
                      isActive ? 'text-primary' : 'text-text-secondary group-hover:text-primary'
                    )}
                    aria-hidden="true"
                  />

                  {!isMinimized && (
                    <span className="truncate">{item.name}</span>
                  )}

                  {/* Active dot for minimized mode */}
                  {isActive && isMinimized && (
                    <span className="absolute bottom-1.5 right-1.5 h-1.5 w-1.5 bg-primary rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ─── Logout ───────────────────────────────────────────────── */}
      <div className="p-3 border-t border-divider/60 shrink-0 bg-card/50">
        <button
          onClick={handleLogout}
          className={cn(
            "group flex items-center w-full px-3 py-2.5 text-xs font-black text-text-secondary/70 uppercase tracking-widest rounded-xl hover:bg-error/8 hover:text-error transition-all duration-200",
            isMinimized ? "justify-center" : "gap-3"
          )}
          title={isMinimized ? "Log Out" : undefined}
        >
          <ArrowRightOnRectangleIcon className="shrink-0 h-5 w-5 text-text-secondary/60 group-hover:text-error transition-colors" />
          {!isMinimized && <span>Log Out</span>}
        </button>
      </div>
    </div>
  );
}
