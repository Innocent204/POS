'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/layout/layout';
import AuthGuard from '@/components/auth/auth-guard';
import StatCard from '@/components/dashboard/stat-card';
import RecentActivity from '@/components/dashboard/recent-activity';
import { ExclamationTriangleIcon, ExclamationCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import { DashboardSummaryResponse, AlertResponse } from '@/types';
import { formatCurrency, formatNumber, getInitials, calculatePercentageChange, getErrorMessage } from '@/lib/utils';

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [activities, setActivities] = useState<AlertResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.dashboard.getSummary();

      if (response.success && response.data) {
        setSummary(response.data);
        setActivities(response.data.activeAlerts || []);
      } else {
        setError(response.message || 'Failed to load dashboard data');
      }
    } catch (err: any) {
      console.error('Fetch dashboard data error:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-surface rounded w-1/4"></div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-surface rounded-lg h-32"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-surface rounded-lg h-32"></div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !summary) {
    return (
      <Layout>
        <div className="bg-error-light border border-error/20 rounded-lg p-6 text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-error mx-auto mb-4" />
          <div className="text-error font-bold text-lg mb-2">Connection Error</div>
          <div className="text-text-secondary mb-6">{error || 'Something went wrong'}</div>
          <button
            onClick={() => fetchDashboardData()}
            className="px-6 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-colors flex items-center gap-2 mx-auto"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <AuthGuard>
      <Layout>
        <div className="space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-primary tracking-tight">Dashboard</h1>
              <p className="text-sm text-text-secondary mt-1">Welcome back! Here&apos;s what&apos;s happening with your store today.</p>
            </div>
            <button
              onClick={() => fetchDashboardData()}
              className="p-2 hover:bg-surface rounded-full transition-colors"
              title="Refresh data"
            >
              <ArrowPathIcon className={`h-6 w-6 text-primary ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              title="Total Products"
              value={summary.totalProducts}
              change={0}
              icon="products"
            />
            <StatCard
              title="Total Branches"
              value={summary.totalBranches}
              change={0}
              icon="branches"
            />
            <StatCard
              title="Sales Today"
              value={summary.todaySalesCount}
              change={0}
              icon="revenue"
            />
            <StatCard
              title="Revenue Today"
              value={`$${summary.todaySalesTotal.toLocaleString()}`}
              change={0}
              icon="revenue"
            />
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="card p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-secondary">Low Stock Items</p>
                  <p className="text-2xl sm:text-3xl font-bold text-warning">{summary.totalLowStockItems}</p>
                </div>
                <div className="p-3 bg-warning/10 rounded-xl">
                  <span className="text-2xl">⚠️</span>
                </div>
              </div>
            </div>

            <div className="card p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-secondary">Out of Stock</p>
                  <p className="text-2xl sm:text-3xl font-bold text-error">{summary.totalOutOfStockItems}</p>
                </div>
                <div className="p-3 bg-error/10 rounded-xl">
                  <span className="text-2xl">🚫</span>
                </div>
              </div>
            </div>

            <div className="card p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-secondary">Inventory Value</p>
                  <p className="text-2xl sm:text-3xl font-bold text-info">${summary.totalInventoryValue.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-info/10 rounded-xl">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Alerts Section */}
          {summary.totalLowStockItems > 0 || summary.totalOutOfStockItems > 0 ? (
            <div className="card p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-primary flex items-center gap-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-error" />
                  Active Alerts
                </h2>
                <span className="px-3 py-1 bg-error/10 text-error text-sm font-bold rounded-full">
                  {(summary.totalLowStockItems || 0) + (summary.totalOutOfStockItems || 0)}
                </span>
              </div>
              <div className="space-y-3">
                {summary.totalOutOfStockItems > 0 && (
                  <div className="flex items-center justify-between p-4 bg-error/5 border border-error/20 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-error/10 rounded-lg">
                        <ExclamationCircleIcon className="h-5 w-5 text-error" />
                      </div>
                      <div>
                        <p className="font-bold text-primary">Out of Stock Items</p>
                        <p className="text-sm text-text-secondary">{summary.totalOutOfStockItems} products need restocking</p>
                      </div>
                    </div>
                    <button
                      onClick={() => window.location.href = '/inventory?status=Out+of+Stock'}
                      className="text-sm font-medium text-error hover:underline"
                    >
                      View Items →
                    </button>
                  </div>
                )}
                {summary.totalLowStockItems > 0 && (
                  <div className="flex items-center justify-between p-4 bg-warning/5 border border-warning/20 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-warning/10 rounded-lg">
                        <ExclamationTriangleIcon className="h-5 w-5 text-warning" />
                      </div>
                      <div>
                        <p className="font-bold text-primary">Low Stock Items</p>
                        <p className="text-sm text-text-secondary">{summary.totalLowStockItems} products are running low</p>
                      </div>
                    </div>
                    <button
                      onClick={() => window.location.href = '/inventory?status=Low+Stock'}
                      className="text-sm font-medium text-warning hover:underline"
                    >
                      View Items →
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : null}


        </div>
      </Layout>
    </AuthGuard>
  );
}
