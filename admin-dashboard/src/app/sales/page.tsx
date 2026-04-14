'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/layout/layout';
import { formatCurrency, formatDate, getErrorMessage } from '@/lib/utils';
import {
  ChartBarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  ShoppingBagIcon,
  BanknotesIcon,
  CreditCardIcon,
  ArrowPathIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { api } from '@/lib/api';
import { SaleResponse, SaleLineItemResponse, ReturnLineItemRequest } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toaster';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function SalesPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [sales, setSales] = useState<SaleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Return dialog state
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [returningSale, setReturningSale] = useState<SaleResponse | null>(null);
  const [returnReason, setReturnReason] = useState('');
  const [returnItems, setReturnItems] = useState<Record<string, number>>({});
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  const fetchSales = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: { size: number; from?: string; to?: string } = { size: 500 };
      if (startDate) params.from = `${startDate}T00:00:00`;
      if (endDate) params.to = `${endDate}T23:59:59`;
      const response = await api.sales.getAll(params);
      if (response.success) {
        setSales(response.data.content || []);
      } else {
        setError(response.message || 'Failed to load sales data');
      }
    } catch (err: any) {
      console.error('Sales fetch error:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [startDate, endDate]);

  const filteredSales = sales.filter(sale => {
    const matchesSearch =
      sale.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.cashierName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' ||
      (statusFilter === 'Completed' && !sale.isReturned) ||
      (statusFilter === 'Returned' && sale.isReturned);

    return matchesSearch && matchesStatus;
  });

  const totalRevenue = filteredSales.reduce((acc, s) => acc + s.totalAmount, 0);
  const avgOrderValue = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;

  const resetFilters = () => {
    setStatusFilter('All');
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
  };

  const openReturnDialog = async (sale: SaleResponse) => {
    try {
      const res = await api.sales.getById(sale.id);
      if (res.success && res.data) {
        setReturningSale(res.data);
        const initial: Record<string, number> = {};
        res.data.lineItems.forEach(item => { initial[item.id] = 0; });
        setReturnItems(initial);
        setReturnReason('');
        setReturnDialogOpen(true);
      }
    } catch (err) {
      toast({ title: 'Error', description: getErrorMessage(err), variant: 'destructive' });
    }
  };

  const handleReturnSubmit = async () => {
    if (!returningSale) return;
    if (!returnReason.trim()) {
      toast({ title: 'Reason required', description: 'Please enter a reason for the return.', variant: 'destructive' });
      return;
    }
    const items: ReturnLineItemRequest[] = Object.entries(returnItems)
      .filter(([, qty]) => qty > 0)
      .map(([lineItemId, quantityReturned]) => ({ lineItemId, quantityReturned }));
    if (items.length === 0) {
      toast({ title: 'No items selected', description: 'Select at least one item to return.', variant: 'destructive' });
      return;
    }
    try {
      setIsSubmittingReturn(true);
      const res = await api.sales.createReturn(returningSale.id, { reason: returnReason.trim(), items });
      if (res.success) {
        toast({ title: 'Return processed', description: `Return recorded. Refund: ${formatCurrency(res.data.totalRefundAmount)}` });
        setReturnDialogOpen(false);
        fetchSales();
      } else {
        throw new Error(res.message || 'Failed to process return');
      }
    } catch (err) {
      toast({ title: 'Error', description: getErrorMessage(err), variant: 'destructive' });
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  const exportToExcel = async () => {
    if (filteredSales.length === 0) return;

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Sales history');

      const headers = ['Receipt', 'Date', 'Cashier', 'Branch', 'Amount', 'Payment Method', 'Status'];
      worksheet.addRow(headers);

      // Style headers
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE2E8F0' } // slate-200
      };

      const excelData = filteredSales.map(sale => [
        sale.receiptNumber,
        formatDate(sale.createdAt),
        sale.cashierName,
        sale.branchName,
        sale.totalAmount, // raw number for formatting
        sale.paymentMethod,
        sale.isReturned ? 'Returned' : 'Completed'
      ]);

      excelData.forEach(row => worksheet.addRow(row));

      // Auto-size columns
      worksheet.columns.forEach(column => {
        let maxLength = 0;
        column.eachCell?.({ includeEmpty: true }, cell => {
          let columnLength = cell.value ? cell.value.toString().length : 10;
          if (cell.type === ExcelJS.ValueType.Number) columnLength = 10;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        column.width = maxLength < 10 ? 10 : maxLength + 2;
      });

      // Format currency column (E)
      worksheet.getColumn(5).numFmt = '"$"#,##0.00';

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `sales_history_${new Date().toISOString().split('T')[0]}.xlsx`);

      toast({
        title: "Export Successful",
        description: "Sales history has been exported to Excel.",
      });
    } catch (error) {
      console.error('Excel generation error:', error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Could not generate Excel file.",
      });
    }
  };

  return (
          <Layout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-primary">Sales History</h1>
              <p className="mt-1 text-sm text-text-secondary">
                View and manage your transaction history
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" onClick={exportToExcel} disabled={filteredSales.length === 0}>
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
              <Button onClick={() => window.location.href = '/reports'}>
                <ChartBarIcon className="h-4 w-4 mr-2" />
                Reports
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <ShoppingBagIcon className="h-6 w-6 text-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">Total Orders</p>
                  <p className="text-2xl font-black text-primary">{filteredSales.length}</p>
                </div>
              </div>
            </div>

            <div className="card p-6 border-l-4 border-success">
              <div className="flex items-center">
                <div className="p-3 bg-success/10 rounded-lg">
                  <BanknotesIcon className="h-6 w-6 text-success" />
                </div>
                <div className="ml-4">
                  <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">Total Revenue</p>
                  <p className="text-2xl font-black text-success">
                    {formatCurrency(totalRevenue)}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6 border-l-4 border-info">
              <div className="flex items-center">
                <div className="p-3 bg-info/10 rounded-lg">
                  <CreditCardIcon className="h-6 w-6 text-info" />
                </div>
                <div className="ml-4">
                  <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">Avg. Order Value</p>
                  <p className="text-2xl font-black text-info">
                    {formatCurrency(avgOrderValue)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-4 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
                <Input
                  placeholder="Search by order number or customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="!pl-12"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={showFilters ? "default" : "secondary"}
                  onClick={() => setShowFilters(!showFilters)}
                  className="h-10"
                >
                  <FunnelIcon className="h-4 w-4 mr-2" />
                  {showFilters ? 'Hide Filters' : 'Advanced Filters'}
                </Button>
                {(statusFilter !== 'All' || startDate || endDate) && (
                  <Button variant="ghost" onClick={resetFilters} className="text-error h-10">
                    <XMarkIcon className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                )}
              </div>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-divider">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full bg-surface border border-divider rounded-lg px-3 py-2 text-sm font-bold text-primary focus:ring-1 focus:ring-primary h-10"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Completed">Completed</option>
                    <option value="Returned">Returned</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase">Start Date</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase">End Date</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-10"
                  />
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-error-light border border-error/20 rounded-lg p-4 flex items-center justify-between">
              <p className="text-error text-sm">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchSales}>Retry</Button>
            </div>
          )}

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-divider">
                <thead className="bg-surface">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Order #</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Cashier</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Branch</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-text-secondary uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-divider">
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={8} className="px-6 py-4"><div className="h-10 bg-surface rounded w-full"></div></td>
                      </tr>
                    ))
                  ) : filteredSales.length > 0 ? (
                    filteredSales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-surface transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary">#{sale.receiptNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{formatDate(sale.createdAt)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-primary font-medium">{sale.cashierName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{sale.branchName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-primary">{formatCurrency(sale.totalAmount)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary uppercase font-bold text-[10px]">{sale.paymentMethod}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Badge variant={sale.isReturned ? 'error' : 'success'}>
                            {sale.isReturned ? 'Returned' : 'Completed'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              title="View return history"
                              onClick={() => window.location.href = `/sales/${sale.id}/returns`}
                            >
                              <ClipboardDocumentListIcon className="h-4 w-4 text-text-secondary" />
                            </Button>
                            {!sale.isReturned && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openReturnDialog(sale)}
                              >
                                <ArrowPathIcon className="h-4 w-4 mr-1" />
                                Return
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-text-secondary bg-surface/30">
                        <ChartBarIcon className="h-10 w-10 mx-auto mb-4 opacity-20" />
                        <p className="font-medium">No sales records found matching your filters</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Partial Return Dialog */}
        <Dialog open={returnDialogOpen} onOpenChange={(open) => { if (!open) setReturnDialogOpen(false); }}>
          <DialogContent className="sm:max-w-[560px] overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Process Return</DialogTitle>
              <DialogDescription>
                Select items and quantities to return for sale #{returningSale?.receiptNumber}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Return Reason</Label>
                <Input
                  placeholder="e.g. Defective item, customer changed mind..."
                  value={returnReason}
                  onChange={e => setReturnReason(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Line Items</Label>
                <div className="border border-divider rounded-lg divide-y divide-divider">
                  {returningSale?.lineItems.map((item: SaleLineItemResponse) => (
                    <div key={item.id} className="flex items-center justify-between px-4 py-3 gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary truncate">{item.productName}</p>
                        <p className="text-xs text-text-secondary">SKU: {item.productSku} &middot; {item.quantity} sold @ {formatCurrency(item.unitPrice)}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Label className="text-xs text-text-secondary whitespace-nowrap">Qty to return</Label>
                        <Input
                          type="number"
                          min={0}
                          max={item.quantity}
                          value={returnItems[item.id] ?? 0}
                          onChange={e => setReturnItems(prev => ({ ...prev, [item.id]: Math.min(item.quantity, Math.max(0, parseInt(e.target.value) || 0)) }))}
                          className="w-20 text-center"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {returningSale && (
                <p className="text-xs text-text-secondary">
                  Estimated refund:{' '}
                  <span className="font-bold text-primary">
                    {formatCurrency(
                      (returningSale.lineItems || []).reduce((sum, item) => {
                        const qty = returnItems[item.id] ?? 0;
                        return sum + qty * item.unitPrice;
                      }, 0)
                    )}
                  </span>
                </p>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReturnDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleReturnSubmit} disabled={isSubmittingReturn}>
                {isSubmittingReturn ? 'Processing...' : 'Submit Return'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Layout>
      );
}

