'use client';

import { useState, useEffect, useRef } from 'react';
import Layout from '@/components/layout/layout';
import AuthGuard from '@/components/auth/auth-guard';
import {
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
  GlobeAltIcon,
  CreditCardIcon,
  ChevronRightIcon,
  CameraIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/toaster';

type SettingsTab = 'profile' | 'notifications' | 'appearance' | 'system';

export default function SettingsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Settings State
  const [profile, setProfile] = useState({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@ecotracker.com',
    avatar: null as string | null
  });

  const [notifications, setNotifications] = useState({
    emailSummaries: true,
    pushAlerts: true,
    systemUpdates: false
  });

  const [system, setSystem] = useState({
    currencySymbol: '$',
    taxRate: '15',
    defaultBranch: 'Main Branch',
    lowStockThreshold: '10'
  });

  // Load from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('settings_profile');
    const savedNotifications = localStorage.getItem('settings_notifications');
    const savedSystem = localStorage.getItem('settings_system');

    if (savedProfile) setProfile(JSON.parse(savedProfile));
    if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
    if (savedSystem) setSystem(JSON.parse(savedSystem));
  }, []);

  const handleSave = () => {
    localStorage.setItem('settings_profile', JSON.stringify(profile));
    localStorage.setItem('settings_notifications', JSON.stringify(notifications));
    localStorage.setItem('settings_system', JSON.stringify(system));

    toast({
      title: 'Settings Saved',
      description: 'Your preferences have been updated successfully.',
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'appearance', name: 'Appearance', icon: PaintBrushIcon },
    { id: 'system', name: 'System', icon: GlobeAltIcon },
  ];

  return (
    <AuthGuard>
      <Layout>
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black text-primary tracking-tight">Settings</h1>
              <p className="text-text-secondary font-medium">Manage your account and system preferences</p>
            </div>
            <Button className="px-8 shadow-xl shadow-primary/20" onClick={handleSave}>Save All Changes</Button>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Navigation */}
            <aside className="w-full md:w-64">
              <div className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 no-scrollbar md:space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as SettingsTab)}
                    className={`flex-shrink-0 flex items-center justify-between p-3 px-5 md:px-3 rounded-xl transition-all duration-200 group ${activeTab === tab.id
                      ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02] md:scale-[1.05]'
                      : 'text-text-secondary hover:bg-surface hover:text-primary whitespace-nowrap'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? 'text-white' : 'text-text-secondary group-hover:text-primary'}`} />
                      <span className="font-bold text-sm">{tab.name}</span>
                    </div>
                    {activeTab === tab.id && <ChevronRightIcon className="hidden md:block h-4 w-4" />}
                  </button>
                ))}
              </div>
            </aside>

            {/* Content Area */}
            <main className="flex-1">
              <div className="card p-8 min-h-[550px] animate-in fade-in slide-in-from-right-4 duration-500">
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-6">
                      <div className="relative group">
                        <div className="h-24 w-24 rounded-2xl bg-surface border-2 border-divider flex items-center justify-center overflow-hidden shadow-inner">
                          {profile.avatar ? (
                            <img src={profile.avatar} alt="Avatar" className="h-full w-full object-cover" />
                          ) : (
                            <UserIcon className="h-12 w-12 text-text-secondary/30" />
                          )}
                        </div>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute -bottom-2 -right-2 p-2 bg-primary text-white rounded-lg shadow-lg hover:scale-110 transition-transform"
                        >
                          <CameraIcon className="h-4 w-4" />
                        </button>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
                      </div>
                      <div>
                        <h3 className="font-bold text-primary text-lg">{profile.firstName} {profile.lastName}</h3>
                        <p className="text-sm text-text-secondary">{profile.email}</p>
                        <p className="text-xs text-text-secondary mt-1">Administrator Account</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={profile.firstName}
                          onChange={e => setProfile({ ...profile, firstName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={profile.lastName}
                          onChange={e => setProfile({ ...profile, lastName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profile.email}
                          onChange={e => setProfile({ ...profile, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                      <h4 className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
                        <ShieldCheckIcon className="h-4 w-4 text-primary" />
                        Security Level: Standard
                      </h4>
                      <p className="text-xs text-text-secondary leading-relaxed">Your account is protected by standard JWT authentication.</p>
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-black text-primary">Notification Channels</h3>
                      <p className="text-sm text-text-secondary">Configure how the system communicates critical alerts to you.</p>
                    </div>

                    <div className="space-y-4">
                      {[
                        { id: 'emailSummaries', title: 'Daily Business Reports', desc: 'Detailed PDF summaries of sales performance across all branches' },
                        { id: 'pushAlerts', title: 'Real-time Stock Alerts', desc: 'Instant push notifications when items fall below threshold' },
                        { id: 'systemUpdates', title: 'System Announcements', desc: 'Maintenance notices and platform feature updates' }
                      ].map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-5 bg-surface rounded-2xl border border-divider hover:border-primary/30 transition-colors">
                          <div className="pr-4">
                            <p className="font-bold text-primary">{item.title}</p>
                            <p className="text-xs text-text-secondary mt-0.5">{item.desc}</p>
                          </div>
                          <button
                            onClick={() => setNotifications({ ...notifications, [item.id]: !notifications[item.id as keyof typeof notifications] })}
                            className={`h-7 w-12 rounded-full relative transition-colors duration-300 flex-shrink-0 ${notifications[item.id as keyof typeof notifications] ? 'bg-primary' : 'bg-divider'}`}
                          >
                            <div className={`h-5 w-5 bg-white rounded-full absolute top-1 transition-all duration-300 ${notifications[item.id as keyof typeof notifications] ? 'left-6' : 'left-1'}`}></div>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'appearance' && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-black text-primary">Interface Styling</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3 cursor-pointer group">
                        <div className="aspect-video bg-slate-900 border-2 border-primary rounded-2xl relative overflow-hidden shadow-2xl shadow-primary/10">
                          <div className="absolute top-0 left-0 w-8 h-full bg-slate-800 border-r border-slate-700"></div>
                          <div className="absolute top-2 left-10 right-2 h-2 bg-slate-800 rounded-full"></div>
                        </div>
                        <p className="text-center text-sm font-bold text-primary">Premium Dark (Active)</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'system' && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-black text-primary">Global Parameters</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <Label className="font-bold">Currency Symbol</Label>
                        <Input
                          value={system.currencySymbol}
                          className="font-mono text-lg"
                          onChange={e => setSystem({ ...system, currencySymbol: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold">VAT Rate (%)</Label>
                        <Input
                          type="number"
                          value={system.taxRate}
                          onChange={e => setSystem({ ...system, taxRate: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold">Default Management Branch</Label>
                        <Input
                          value={system.defaultBranch}
                          onChange={e => setSystem({ ...system, defaultBranch: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold">Low Stock Warning Threshold</Label>
                        <Input
                          type="number"
                          value={system.lowStockThreshold}
                          onChange={e => setSystem({ ...system, lowStockThreshold: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="pt-6">
                      <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">System</h4>
                      <Button variant="outline" size="sm" className="rounded-xl text-error border-error/20 hover:bg-error/5">
                        Clear Cache
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </Layout>
    </AuthGuard>
  );
}
