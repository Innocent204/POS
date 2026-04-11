'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Layout from '@/components/layout/layout';
import AuthGuard from '@/components/auth/auth-guard';
import { formatCurrency, formatDate, getErrorMessage } from '@/lib/utils';
import { ArrowLeftIcon, ReceiptRefundIcon } from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import { SaleResponse, SaleReturnResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toaster';

export default function SaleReturnsPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const [sale, setSale] = useState<SaleResponse | null>(null);
  const [returns, setReturns] = useState<SaleReturnResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [saleRes, returnsRes] = await Promise.all([
        api.sales.getById(id),
        api.sales.getReturns(id),
      ]);
      if (saleRes.success && saleRes.data) setSale(saleRes.data);
      if (returnsRes.success && returnsRes.data) setReturns(returnsRes.data);
    } catch (err) {
      setError(getErrorMessage(err));
      toast({ title: 'Error', description: getErrorMessage(err), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const totalRefunded = returns.reduce((sum, r) => sum + r.totalRefundAmount, 0);

  return (
    <AuthGuard>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => window.location.href = '/sales'}>
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Sales
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h1 className="text-2xl font-bold text-primary">Return History</h1>
              {sale && (
                <p className="mt-1 text-sm text-text-secondary">
                  Sale #{sale.receiptNumber} &middot; {formatDate(sale.createdAt)} &middot; {sale.cashierName} &middot; {sale.branchName}
                </p>
              )}
            </div>
            {sale && (
              <div className="flex gap-3">
                <div className="text-right">
                  <p className="text-xs text-text-secondary uppercase font-bold">Original Amount</p>
                  <p className="text-lg font-black text-primary">{formatCurrency(sale.totalAmount)}</p>
                </div>
                {totalRefunded > 0 && (
                  <div className="text-right">
                    <p className="text-xs text-text-secondary uppercase font-bold">Total Refunded</p>
                    <p className="text-lg font-black text-error">{formatCurrency(totalRefunded)}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="bg-error-light border border-error/20 rounded-lg p-4 flex items-center justify-between">
              <p className="text-error text-sm">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchData}>Retry</Button>
            </div>
          )}

          {/* Original sale line items */}
          {sale && (
            <div className="card overflow-hidden">
              <div className="px-6 py-4 border-b border-divider">
                <h2 className="text-sm font-bold text-primary uppercase tracking-wider">Original Line Items</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-divider">
                  <thead className="bg-surface">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase">Product</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-text-secondary uppercase">Qty Sold</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-text-secondary uppercase">Unit Price</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-text-secondary uppercase">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-divider">
                    {sale.lineItems.map(item => (
                      <tr key={item.id}>
                        <td className="px-6 py-3 text-sm text-primary">
                          {item.productName}
                          <span className="ml-2 text-xs text-text-secondary">{item.productSku}</span>
                        </td>
                        <td className="px-6 py-3 text-sm text-right text-text-secondary">{item.quantity}</td>
                        <td className="px-6 py-3 text-sm text-right text-text-secondary">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-6 py-3 text-sm text-right font-medium text-primary">{formatCurrency(item.lineTotal)}</td>
                      </tr>
                    ))}
                    <tr className="bg-surface">
                      <td colSpan={3} className="px-6 py-3 text-right text-sm font-bold text-primary">Total</td>
                      <td className="px-6 py-3 text-right text-sm font-black text-primary">{formatCurrency(sale.totalAmount)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Return records */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-primary uppercase tracking-wider">Returns ({returns.length})</h2>

            {loading ? (
              <div className="card p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : returns.length === 0 ? (
              <div className="card p-12 text-center text-text-secondary">
                <ReceiptRefundIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="font-medium">No returns recorded for this sale</p>
              </div>
            ) : (
              returns.map((ret) => (
                <div key={ret.id} className="card overflow-hidden">
                  <div className="px-6 py-4 border-b border-divider flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-primary">Return on {formatDate(ret.createdAt)}</p>
                      <p className="text-xs text-text-secondary mt-0.5">Reason: {ret.reason}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-text-secondary uppercase font-bold">Refund Amount</p>
                      <p className="text-lg font-black text-error">{formatCurrency(ret.totalRefundAmount)}</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-divider">
                      <thead className="bg-surface">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase">Product</th>
                          <th className="px-6 py-3 text-right text-xs font-bold text-text-secondary uppercase">Qty Returned</th>
                          <th className="px-6 py-3 text-right text-xs font-bold text-text-secondary uppercase">Unit Price</th>
                          <th className="px-6 py-3 text-right text-xs font-bold text-text-secondary uppercase">Refund</th>
                        </tr>
                      </thead>
                      <tbody className="bg-card divide-y divide-divider">
                        {ret.items.map(item => (
                          <tr key={item.id}>
                            <td className="px-6 py-3 text-sm text-primary">
                              {item.productName}
                              <span className="ml-2 text-xs text-text-secondary">{item.productSku}</span>
                            </td>
                            <td className="px-6 py-3 text-sm text-right text-text-secondary">{item.quantityReturned}</td>
                            <td className="px-6 py-3 text-sm text-right text-text-secondary">{formatCurrency(item.unitPrice)}</td>
                            <td className="px-6 py-3 text-sm text-right font-medium text-error">{formatCurrency(item.lineTotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Layout>
    </AuthGuard>
  );
}
