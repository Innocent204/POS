'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/layout/layout';
import { ArrowTrendingUpIcon, ChartBarIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { formatCurrency, formatNumber, getErrorMessage } from '@/lib/utils';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DashboardSummaryResponse,
  TopProductResponse,
  BranchStockSummary
} from '@/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area
} from 'recharts';

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [topProducts, setTopProducts] = useState<TopProductResponse[]>([]);
  const [branchData, setBranchData] = useState<BranchStockSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryRes, topProdsRes, branchRes] = await Promise.all([
        api.dashboard.getSummary(),
        api.dashboard.getTopProducts(),
        api.dashboard.getBranchComparison()
      ]);

      if (summaryRes.success && summaryRes.data) {
        setSummary(summaryRes.data);
      }
      if (topProdsRes.success && topProdsRes.data) {
        setTopProducts(topProdsRes.data || []);
      }
      if (branchRes.success && branchRes.data) {
        setBranchData(branchRes.data || []);
      }
    } catch (err: any) {
      console.error('Fetch analytics error:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const COLORS = ['var(--primary)', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <Layout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-primary">Analytics Dashboard</h1>
              <p className="mt-1 text-sm text-text-secondary">
                Real-time business intelligence and performance tracking
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
              <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {error && (
            <div className="bg-error-light border border-error/20 rounded-lg p-4 flex items-center justify-between">
              <p className="text-error text-sm">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchData}>Retry</Button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-3 bg-success/10 rounded-lg">
                  <ChartBarIcon className="h-6 w-6 text-success" />
                </div>
                <div className="ml-4">
                  <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">Today's Revenue</p>
                  <p className="text-2xl font-black text-primary">
                    {loading ? '...' : formatCurrency(summary?.todaySalesTotal || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <ArrowTrendingUpIcon className="h-6 w-6 text-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">Today's Sales</p>
                  <p className="text-2xl font-black text-primary">
                    {loading ? '...' : formatNumber(summary?.todaySalesCount || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-3 bg-info/10 rounded-lg">
                  <ChartBarIcon className="h-6 w-6 text-info" />
                </div>
                <div className="ml-4">
                  <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">Avg Order Value</p>
                  <p className="text-2xl font-black text-primary">
                    {loading ? '...' : formatCurrency((summary?.todaySalesTotal || 0) / (summary?.todaySalesCount || 1))}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6 bg-error/5 border-error/10">
              <div className="flex items-center">
                <div className="p-3 bg-error/10 rounded-lg">
                  <Badge variant="error" className="animate-pulse h-6 w-6 rounded-full p-0 flex items-center justify-center">!</Badge>
                </div>
                <div className="ml-4">
                  <p className="text-xs font-bold text-error uppercase tracking-wider">Issue Alerts</p>
                  <p className="text-2xl font-black text-error">
                    {loading ? '...' : (summary?.totalLowStockItems || 0) + (summary?.totalOutOfStockItems || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-lg font-black text-primary mb-6 flex items-center gap-2">
                Inventory Distribution by Branch
                <Badge variant="info" className="text-[10px] ml-auto">Real-time Snapshot</Badge>
              </h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={branchData}>
                    <defs>
                      <linearGradient id="colorInventory" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--divider)" />
                    <XAxis dataKey="branchName" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--divider)', borderRadius: '12px' }}
                      itemStyle={{ color: 'var(--primary)', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="totalStockValue" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorInventory)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-black text-primary mb-6">Top Performing Products</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts} layout="vertical" margin={{ left: 20 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="productName" type="category" stroke="var(--text-secondary)" fontSize={10} width={100} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--divider)', borderRadius: '12px' }}
                    />
                    <Bar dataKey="totalQuantitySold" radius={[0, 4, 4, 0]} barSize={20}>
                      {topProducts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="p-6 border-b border-divider flex justify-between items-center">
              <h3 className="text-lg font-black text-primary">Performance by Branch</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-divider">
                <thead className="bg-surface">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-widest">Branch Name</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-widest">Stock Units</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-widest">Inventory Value</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-widest">Stock Alerts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-divider">
                  {branchData.map((branch) => (
                    <tr key={branch.branchId} className="hover:bg-surface transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary">{branch.branchName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{formatNumber(branch.totalUnits)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-primary">{formatCurrency(branch.totalStockValue)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2 items-center">
                          {branch.outOfStockCount > 0 && (
                            <Badge variant="error" className="px-2 py-0.5 text-[10px]">
                              {branch.outOfStockCount} Out
                            </Badge>
                          )}
                          {branch.lowStockCount > 0 && (
                            <Badge variant="warning" className="px-2 py-0.5 text-[10px]">
                              {branch.lowStockCount} Low
                            </Badge>
                          )}
                          {branch.lowStockCount === 0 && branch.outOfStockCount === 0 && (
                            <Badge variant="success" className="px-2 py-0.5 text-[10px]">
                              Healthy
                            </Badge>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Layout>
  );
}
