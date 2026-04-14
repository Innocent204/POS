'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/layout/layout';
import {
  BuildingOfficeIcon,
  ArchiveBoxIcon,
  ArrowDownTrayIcon,
  DocumentChartBarIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { formatCurrency, formatNumber, cn, formatDate } from '@/lib/utils';
import { DashboardSummaryResponse, BranchResponse, StockLevelResponse } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export default function DashboardReportsPage() {
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [stock, setStock] = useState<StockLevelResponse[]>([]);
  const [loadingStock, setLoadingStock] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [productPrices, setProductPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [summaryRes, branchesRes, productsRes] = await Promise.all([
          api.dashboard.getSummary(),
          api.branches.getAll(),
          api.products.getAll({ size: 2000 })
        ]);

        if (summaryRes.success) setSummary(summaryRes.data);
        if (branchesRes.success) setBranches(branchesRes.data);
        if (productsRes.success && productsRes.data?.content) {
          const prices: Record<string, number> = {};
          productsRes.data.content.forEach(p => {
            prices[p.id] = p.price;
          });
          setProductPrices(prices);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchPreviewData = async () => {
      if (selectedBranchId === 'all') {
        setStock([]);
        return;
      }
      try {
        setLoadingStock(true);
        const res = await api.stock.getByBranch(selectedBranchId);
        if (res.success) {
          setStock(res.data || []);
        }
      } catch (error) {
        console.error('Error fetching stock for preview:', error);
      } finally {
        setLoadingStock(false);
      }
    };
    fetchPreviewData();
  }, [selectedBranchId]);

  const currentBranch = branches.find(b => b.id === selectedBranchId);
  const currentBranchSummary = selectedBranchId === 'all'
    ? null
    : summary?.branchSummaries.find(b => b.branchId === selectedBranchId);

  return (
          <Layout>
        <div className="space-y-6 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-black text-primary tracking-tight flex items-center gap-2">
                <DocumentChartBarIcon className="w-8 h-8 text-primary/40" />
                Branch Report Preview
              </h1>
              <p className="text-sm font-medium text-text-secondary">Generate a live preview of specific branch inventory data</p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <Input
                  className="pl-9 h-10 w-full sm:w-[240px] rounded-2xl bg-card border-divider/40 shadow-sm"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3 bg-card p-1.5 rounded-2xl border border-divider/40 shadow-sm">
                <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-3 hidden md:inline-block">Select Branch:</span>
                <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
                  <SelectTrigger className="w-full sm:w-[200px] h-9 border-none bg-surface/50 font-bold focus:ring-0">
                    <SelectValue placeholder="Select Branch" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-divider/60">
                    <SelectItem value="all" className="font-bold">Select a Branch to Preview</SelectItem>
                    {branches.map(branch => (
                      <SelectItem key={branch.id} value={branch.id} className="font-medium">{branch.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="h-[600px] bg-surface animate-pulse rounded-3xl" />
          ) : selectedBranchId === 'all' ? (
            <div className="flex flex-col items-center justify-center py-20 bg-card rounded-3xl border border-dashed border-divider/60 space-y-6">
              <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center">
                <BuildingOfficeIcon className="w-12 h-12 text-primary/30" />
              </div>
              <div className="text-center max-w-md">
                <h3 className="text-xl font-black text-primary">No Branch Selected</h3>
                <p className="text-sm text-text-secondary font-medium mt-2">
                  Please select a specific branch from the dropdown above to generate a live inventory report preview.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Report Canvas */}
              <div className="bg-card text-primary shadow-2xl rounded-xl border border-divider/60 min-h-[800px] flex flex-col mx-auto max-w-[850px] overflow-hidden">
                {/* PDF Header Mockup */}
                <div className="p-10 border-b-4 border-primary/20 bg-surface/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-3xl font-black tracking-tighter text-primary uppercase">INVENTORY REPORT</h2>
                      <p className="text-sm font-bold text-text-secondary mt-1 uppercase tracking-widest">Branch: {currentBranch?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-text-secondary/60 uppercase tracking-widest">Generated On</p>
                      <p className="text-sm font-bold text-primary">{formatDate(new Date().toISOString())}</p>
                    </div>
                  </div>

                  <div className="mt-10 grid grid-cols-3 gap-6">
                    <div className="border-l-2 border-divider pl-4">
                      <p className="text-[10px] font-black text-text-secondary/60 uppercase tracking-widest">Branch Location</p>
                      <p className="text-sm font-bold text-primary mt-1">{currentBranch?.location}</p>
                    </div>
                    <div className="border-l-2 border-divider pl-4">
                      <p className="text-[10px] font-black text-text-secondary/60 uppercase tracking-widest">Branch Manager</p>
                      <p className="text-sm font-bold text-primary mt-1">{currentBranch?.managerName}</p>
                    </div>
                    <div className="border-l-2 border-divider pl-4">
                      <p className="text-[10px] font-black text-text-secondary/60 uppercase tracking-widest">Valuation Basis</p>
                      <p className="text-sm font-bold text-primary mt-1">Unified Price</p>
                    </div>
                  </div>
                </div>

                {/* Summary Section */}
                <div className="p-10 bg-card">
                  <div className="grid grid-cols-4 gap-4 mb-10">
                    <div className="p-4 bg-surface/50 border border-divider/60 rounded-xl">
                      <p className="text-[9px] font-black text-text-secondary/60 uppercase mb-1">Total SKUs</p>
                      <p className="text-xl font-bold text-primary">{currentBranchSummary?.totalProducts || 0}</p>
                    </div>
                    <div className="p-4 bg-surface/50 border border-divider/60 rounded-xl">
                      <p className="text-[9px] font-black text-text-secondary/60 uppercase mb-1">Total Units</p>
                      <p className="text-xl font-bold text-primary">{formatNumber(currentBranchSummary?.totalUnits || 0)}</p>
                    </div>
                    <div className="p-4 bg-surface/50 border border-divider/60 rounded-xl">
                      <p className="text-[9px] font-black text-text-secondary/60 uppercase mb-1">Stock Valuation</p>
                      <p className="text-xl font-bold text-success">
                        {formatCurrency(
                          stock.reduce((acc, item) => {
                            const price = productPrices[item.productId] ?? item.price ?? 0;
                            return acc + ((item.quantityOnHand || 0) * price);
                          }, 0)
                        )}
                      </p>
                    </div>
                    <div className="p-4 bg-error/5 border border-error/10 rounded-xl">
                      <p className="text-[9px] font-black text-error/60 uppercase mb-1">Low Stock</p>
                      <p className="text-xl font-bold text-error">{currentBranchSummary?.lowStockCount || 0}</p>
                    </div>
                  </div>

                  {/* Table Section */}
                  <div className="border border-divider/60 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-primary text-white">
                          <th className="px-4 py-3 font-bold uppercase tracking-widest">Product Details</th>
                          <th className="px-4 py-3 font-bold uppercase tracking-widest">SKU</th>
                          <th className="px-4 py-3 font-bold uppercase tracking-widest text-center">Qty</th>
                          <th className="px-4 py-3 font-bold uppercase tracking-widest text-right">Price</th>
                          <th className="px-4 py-3 font-bold uppercase tracking-widest text-right">Stock Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-divider/40">
                        {loadingStock ? (
                          <tr>
                            <td colSpan={5} className="px-4 py-20 text-center text-text-secondary italic">
                              Synchronizing live inventory data...
                            </td>
                          </tr>
                        ) : stock.filter(item => item.productName.toLowerCase().includes(searchQuery.toLowerCase()) || item.productSku.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                          stock.filter(item => item.productName.toLowerCase().includes(searchQuery.toLowerCase()) || item.productSku.toLowerCase().includes(searchQuery.toLowerCase())).map((item) => (
                            <tr key={item.id} className={cn(
                              "hover:bg-surface/50 transition-colors",
                              item.quantityOnHand <= item.minimumStockThreshold && "bg-error/5"
                            )}>
                              <td className="px-4 py-3">
                                <p className="font-bold text-primary">{item.productName}</p>
                                <p className="text-[10px] text-text-secondary italic mt-0.5">{item.category || 'General'}</p>
                              </td>
                              <td className="px-4 py-3 font-mono text-text-secondary">{item.productSku}</td>
                              <td className="px-4 py-3 text-center">
                                <span className={cn(
                                  "font-bold",
                                  item.quantityOnHand <= item.minimumStockThreshold ? "text-error underline" : "text-primary"
                                )}>
                                  {item.quantityOnHand}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right text-text-secondary">{formatCurrency(productPrices[item.productId] ?? item.price ?? 0)}</td>
                              <td className="px-4 py-3 text-right font-bold text-primary">
                                {formatCurrency((item.quantityOnHand || 0) * (productPrices[item.productId] ?? item.price ?? 0))}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-4 py-20 text-center text-text-secondary">
                              No inventory records found for this location matching your search.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-4 max-w-[850px] mx-auto pb-10">
                <Button className="rounded-xl font-bold shadow-lg shadow-primary/20" onClick={() => window.location.href = '/reports/advanced'}>
                  Generate Official Report
                </Button>
              </div>
            </div>
          )}
        </div>
      </Layout>
      );
}

