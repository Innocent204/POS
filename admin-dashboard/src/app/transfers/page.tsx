'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/layout/layout';
import AuthGuard from '@/components/auth/auth-guard';
import {
  ArrowsRightLeftIcon,
  MagnifyingGlassIcon,
  TruckIcon,
  CheckBadgeIcon,
  XCircleIcon,
  ArrowPathIcon,
  HashtagIcon,
  ClockIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  EyeIcon,
  MapPinIcon,
  CalendarDaysIcon,
  CubeIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { formatDate, formatCurrency, getErrorMessage } from '@/lib/utils';
import { api } from '@/lib/api';
import { TransferResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toaster';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function TransfersPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [transfers, setTransfers] = useState<TransferResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<TransferResponse | null>(null);

  // Receive state
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [receivingTransfer, setReceivingTransfer] = useState<TransferResponse | null>(null);
  const [receivedQuantities, setReceivedQuantities] = useState<Record<string, number>>({});
  const [receiveNotes, setReceiveNotes] = useState('');
  const [isSubmittingReceive, setIsSubmittingReceive] = useState(false);

  // Cancel transfer state
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancellingTransfer, setCancellingTransfer] = useState<TransferResponse | null>(null);
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.transfers.getAll({ size: 50 });
      if (response.success && response.data) {
        setTransfers(response.data.content || []);
      } else {
        setError(response.message || 'Failed to load transfers.');
      }
    } catch (err: any) {
      console.error('Fetch transfers error:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  const handleStatusUpdate = async (id: string, action: 'dispatch' | 'cancel') => {
    try {
      let response;
      if (action === 'dispatch') {
        response = await api.transfers.dispatch(id);
      } else {
        response = await api.transfers.cancel(id);
      }

      if (response.success) {
        toast({
          title: 'Success',
          description: `Transfer successfully ${action === 'dispatch' ? 'dispatched' : 'cancelled'}.`,
        });
        fetchTransfers();
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      console.error(`Transfer ${action} error:`, err);
      toast({
        variant: 'destructive',
        title: 'Action Failed',
        description: getErrorMessage(err),
      });
    }
  };

  const handleOpenReceive = (transfer: TransferResponse) => {
    setReceivingTransfer(transfer);
    const initialQtys: Record<string, number> = {};
    transfer.items?.forEach(item => {
      initialQtys[item.id] = item.quantityRequested;
    });
    setReceivedQuantities(initialQtys);
    setReceiveNotes('');
    setIsReceiveOpen(true);
  };

  const handleReceiveSubmit = async () => {
    if (!receivingTransfer) return;

    try {
      setIsSubmittingReceive(true);
      const items = Object.entries(receivedQuantities).map(([id, qty]) => ({
        transferItemId: id,
        quantityReceived: qty
      }));

      const response = await api.transfers.receive(receivingTransfer.id, {
        items,
        notes: receiveNotes.trim() || undefined
      });

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Transfer received successfully.',
        });
        setIsReceiveOpen(false);
        setReceivingTransfer(null);
        setSelectedTransfer(null);
        fetchTransfers();
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      console.error('Receive transfer error:', err);
      toast({
        variant: 'destructive',
        title: 'Action Failed',
        description: getErrorMessage(err),
      });
    } finally {
      setIsSubmittingReceive(false);
    }
  };

  const handleOpenCancel = (transfer: TransferResponse) => {
    setCancellingTransfer(transfer);
    setIsCancelOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!cancellingTransfer) return;

    try {
      setIsSubmittingCancel(true);
      const response = await api.transfers.cancel(cancellingTransfer.id);

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Transfer cancelled successfully.',
        });
        setIsCancelOpen(false);
        setCancellingTransfer(null);
        setSelectedTransfer(null);
        fetchTransfers();
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      console.error('Cancel transfer error:', err);
      toast({
        variant: 'destructive',
        title: 'Action Failed',
        description: getErrorMessage(err),
      });
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const getStatusVariant = (status: string): 'warning' | 'info' | 'success' | 'error' | 'default' => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'IN_TRANSIT': return 'info';
      case 'RECEIVED': return 'success';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'IN_TRANSIT': return 'In Transit';
      default: return status.charAt(0) + status.slice(1).toLowerCase();
    }
  };

  const filteredTransfers = transfers.filter(transfer =>
    transfer.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.sourceBranchName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.destinationBranchName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.items?.some(item => item.productName?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const exportToExcel = async () => {
    if (filteredTransfers.length === 0) return;

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Stock Transfers');

      const headers = ['Reference', 'Date', 'From Branch', 'To Branch', 'Items Count', 'Status'];
      worksheet.addRow(headers);

      // Style headers
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE2E8F0' } // slate-200
      };

      const excelData = filteredTransfers.map(t => [
        t.referenceNumber,
        formatDate(t.createdAt),
        t.sourceBranchName,
        t.destinationBranchName,
        t.items?.length || 0,
        t.status
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

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `transfers_history_${new Date().toISOString().split('T')[0]}.xlsx`);

      toast({
        title: "Export Successful",
        description: "Transfers history has been exported to Excel.",
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

  const exportToPDF = () => {
    try {
      if (filteredTransfers.length === 0) return;
      setExportingPdf(true);

      const pdfp = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
      const pageWidth = pdfp.internal.pageSize.getWidth();

      // Title
      pdfp.setFontSize(20);
      pdfp.setFont('helvetica', 'bold');
      pdfp.setTextColor(30, 41, 59);
      pdfp.text('Stock Transfers Report', 40, 40);

      pdfp.setFontSize(10);
      pdfp.setFont('helvetica', 'normal');
      pdfp.setTextColor(100, 116, 139);
      pdfp.text(`Generated: ${new Date().toLocaleString('en-GB')}`, 40, 56);
      pdfp.setFontSize(10);
      pdfp.setTextColor(150);
      pdfp.text('Taura IMS', pageWidth - 120, 56);

      // Summary Header
      pdfp.setFillColor(241, 245, 249);
      pdfp.roundedRect(40, 70, pageWidth - 80, 50, 6, 6, 'F');

      pdfp.setFontSize(12);
      pdfp.setFont('helvetica', 'normal');
      pdfp.setTextColor(51, 65, 85);

      const pendingCount = filteredTransfers.filter(t => t.status === 'PENDING').length;
      const transitCount = filteredTransfers.filter(t => t.status === 'IN_TRANSIT').length;

      pdfp.text(`Total Movements: ${filteredTransfers.length}`, 60, 100);
      pdfp.text(`Pending: ${pendingCount}`, (pageWidth / 2) - 40, 100);
      pdfp.text(`In Transit: ${transitCount}`, pageWidth - 160, 100);

      const headers = ['Ref #', 'Date', 'Source', 'Destination', 'Items', 'Status'];
      const rows = filteredTransfers.map(t => [
        t.referenceNumber,
        formatDate(t.createdAt),
        t.sourceBranchName,
        t.destinationBranchName,
        (t.items?.length || 0).toString(),
        t.status
      ]);

      autoTable(pdfp, {
        startY: 140,
        head: [headers],
        body: rows,
        theme: 'grid',
        headStyles: { fillColor: [226, 232, 240], textColor: [30, 41, 59], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 6, textColor: [51, 65, 85] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        didParseCell: function (data) {
          if (data.section === 'body' && data.column.index === 5) {
            const status = rows[data.row.index][5];
            if (status === 'RECEIVED') {
              data.cell.styles.textColor = [22, 163, 74];
              data.cell.styles.fontStyle = 'bold';
            } else if (status === 'CANCELLED') {
              data.cell.styles.textColor = [220, 38, 38];
              data.cell.styles.fontStyle = 'bold';
            } else if (status === 'PENDING') {
              data.cell.styles.textColor = [217, 119, 6];
              data.cell.styles.fontStyle = 'bold';
            } else if (status === 'IN_TRANSIT') {
              data.cell.styles.textColor = [2, 132, 199];
              data.cell.styles.fontStyle = 'bold';
            }
          }
        }
      });

      const pageCount = (pdfp as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdfp.setPage(i);
        pdfp.setFontSize(8);
        pdfp.setTextColor(148, 163, 184); // slate-400
        pdfp.text('Taura IMS - Confidential', 40, pdfp.internal.pageSize.getHeight() - 20);
        pdfp.text(`Page ${i} of ${pageCount}`, pdfp.internal.pageSize.getWidth() - 60, pdfp.internal.pageSize.getHeight() - 20);
      }

      pdfp.save(`Stock_Transfers_${new Date().toISOString().split('T')[0]}.pdf`);

      toast({
        title: "PDF Generated",
        description: "Your transfers report has been downloaded.",
      });
    } catch (err) {
      console.error('PDF generation error:', err);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Could not generate PDF.",
      });
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <AuthGuard>
      <Layout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-primary tracking-tight">Stock Transfers</h1>
              <p className="mt-1 text-sm text-text-secondary font-medium">
                Manage inventory movements between branches
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Link href="/transfers/new">
                <Button size="sm">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Transfer
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={fetchTransfers} disabled={loading}>
                <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={exportToExcel} disabled={filteredTransfers.length === 0}>
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                Excel
              </Button>
              <Button variant="secondary" size="sm" onClick={exportToPDF} disabled={filteredTransfers.length === 0 || exportingPdf}>
                {exportingPdf ? <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" /> : <ArrowDownTrayIcon className="h-4 w-4 mr-2" />}
                PDF
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <ArrowsRightLeftIcon className="h-6 w-6 text-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">Total Movements</p>
                  <p className="text-2xl font-black text-primary">{filteredTransfers.length}</p>
                </div>
              </div>
            </div>

            <div className="card p-6 border-l-4 border-warning">
              <div className="flex items-center">
                <div className="p-3 bg-warning/10 rounded-lg">
                  <ClockIcon className="h-6 w-6 text-warning" />
                </div>
                <div className="ml-4">
                  <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">Pending Shipments</p>
                  <p className="text-2xl font-black text-warning">
                    {filteredTransfers.filter(t => t.status === 'PENDING').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6 border-l-4 border-info">
              <div className="flex items-center">
                <div className="p-3 bg-info/10 rounded-lg">
                  <TruckIcon className="h-6 w-6 text-info" />
                </div>
                <div className="ml-4">
                  <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">In Transit</p>
                  <p className="text-2xl font-black text-info">
                    {filteredTransfers.filter(t => t.status === 'IN_TRANSIT').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="card p-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
              <Input
                placeholder="Search by reference, branch or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="!pl-12 h-10"
              />
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-error/5 border border-error/20 rounded-xl p-4 flex items-center justify-between">
              <p className="text-error text-sm font-medium">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchTransfers}>Retry</Button>
            </div>
          )}

          {/* Transfers Table */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-divider">
                <thead className="bg-surface">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-widest">Ref #</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-widest">From → To</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-widest">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-widest">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-widest">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-text-secondary uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-divider">
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="h-10 bg-surface rounded w-full"></div>
                        </td>
                      </tr>
                    ))
                  ) : filteredTransfers.length > 0 ? (
                    filteredTransfers.map((transfer) => (
                      <tr
                        key={transfer.id}
                        className="hover:bg-surface transition-colors cursor-pointer"
                        onClick={() => setSelectedTransfer(transfer)}
                      >
                        {/* Reference Number */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <HashtagIcon className="h-3.5 w-3.5 text-text-secondary/50" />
                            <span className="text-xs font-black text-primary font-mono">{transfer.referenceNumber}</span>
                          </div>
                        </td>

                        {/* Branches */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-primary">{transfer.sourceBranchName}</span>
                              <span className="text-[10px] text-text-secondary">Source</span>
                            </div>
                            <ArrowsRightLeftIcon className="h-4 w-4 text-text-secondary/50 shrink-0" />
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-primary">{transfer.destinationBranchName}</span>
                              <span className="text-[10px] text-text-secondary">Destination</span>
                            </div>
                          </div>
                        </td>

                        {/* Items */}
                        <td className="px-6 py-4 max-w-xs">
                          <div className="space-y-0.5">
                            {transfer.items?.slice(0, 2).map((item) => (
                              <div key={item.id} className="text-xs text-primary">
                                <span className="font-bold">{item.productName}</span>
                                <span className="text-text-secondary"> × {item.quantityRequested}</span>
                              </div>
                            ))}
                            {(transfer.items?.length ?? 0) > 2 && (
                              <div className="text-[10px] text-text-secondary">+{(transfer.items?.length ?? 0) - 2} more items</div>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={getStatusVariant(transfer.status)}>
                            {getStatusLabel(transfer.status)}
                          </Badge>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                          {formatDate(transfer.createdAt)}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-2">
                            {transfer.status === 'PENDING' && (
                              <Button
                                variant="outline" size="sm" className="h-8 w-8 p-0 text-info hover:bg-info/10"
                                onClick={(e) => { e.stopPropagation(); handleStatusUpdate(transfer.id, 'dispatch'); }}
                                title="Dispatch Stock"
                              >
                                <TruckIcon className="h-4 w-4" />
                              </Button>
                            )}
                            {transfer.status === 'PENDING' && (
                              <Button
                                variant="outline" size="sm" className="h-8 w-8 p-0 text-error hover:bg-error/10"
                                onClick={(e) => { e.stopPropagation(); handleOpenCancel(transfer); }}
                                title="Cancel Transfer"
                              >
                                <XCircleIcon className="h-4 w-4" />
                              </Button>
                            )}
                            {transfer.status === 'IN_TRANSIT' && (
                              <span className="text-xs text-text-secondary italic px-2">Awaiting receipt</span>
                            )}
                            {(transfer.status === 'RECEIVED' || transfer.status === 'CANCELLED') && (
                              <span className="text-xs text-text-secondary italic px-2">Finalized</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-text-secondary bg-surface/30">
                        <ArrowsRightLeftIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p className="font-bold">No transfers found</p>
                        <p className="text-sm mt-1">Try adjusting your search or refresh the list.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer count */}
            {!loading && filteredTransfers.length > 0 && (
              <div className="px-6 py-3 bg-surface/50 border-t border-divider text-xs text-text-secondary font-medium">
                Showing {filteredTransfers.length} of {transfers.length} transfers
              </div>
            )}
          </div>
        </div>
      </Layout>

      {/* ─── Transfer Detail Slide-over ────────────────────────────────── */}
      {selectedTransfer && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedTransfer(null)}
          />
          {/* Panel */}
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-card shadow-2xl flex flex-col border-l border-divider">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-divider bg-gradient-to-r from-primary/5 to-transparent">
              <div>
                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Transfer Details</p>
                <h2 className="text-lg font-black text-primary font-mono"># {selectedTransfer.referenceNumber}</h2>
              </div>
              <button
                onClick={() => setSelectedTransfer(null)}
                className="p-2 rounded-xl hover:bg-surface text-text-secondary hover:text-primary transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">

              {/* Status + Date row */}
              <div className="flex items-center justify-between">
                <Badge variant={getStatusVariant(selectedTransfer.status)}>
                  {getStatusLabel(selectedTransfer.status)}
                </Badge>
                <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <CalendarDaysIcon className="h-4 w-4" />
                  <span>{formatDate(selectedTransfer.createdAt)}</span>
                </div>
              </div>

              {/* Route */}
              <div className="card p-4 bg-surface/50">
                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-3">Route</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 p-3 rounded-xl bg-primary/5 border border-primary/10">
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">From</p>
                    <p className="text-sm font-black text-primary mt-0.5">{selectedTransfer.sourceBranchName}</p>
                  </div>
                  <ArrowsRightLeftIcon className="h-5 w-5 text-text-secondary/40 shrink-0" />
                  <div className="flex-1 p-3 rounded-xl bg-success/5 border border-success/10">
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">To</p>
                    <p className="text-sm font-black text-success mt-0.5">{selectedTransfer.destinationBranchName}</p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-3">
                  Items ({selectedTransfer.items?.length ?? 0})
                </p>
                <div className="space-y-2">
                  {selectedTransfer.items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-surface border border-divider/50">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <CubeIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-primary">{item.productName}</p>
                          {item.productSku && (
                            <p className="text-[10px] text-text-secondary font-mono">{item.productSku}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-primary">× {item.quantityRequested}</p>
                        {item.quantityReceived !== undefined && item.quantityReceived !== null && (
                          <p className="text-[10px] text-text-secondary">Recv: {item.quantityReceived}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* notes if any */}
              {(selectedTransfer as any).notes && (
                <div>
                  <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2">Notes</p>
                  <p className="text-sm text-text-secondary italic px-3 py-2 rounded-lg bg-surface border border-divider/50">
                    {(selectedTransfer as any).notes}
                  </p>
                </div>
              )}
            </div>

            {/* Action footer for IN_TRANSIT transfers */}
            {selectedTransfer.status === 'IN_TRANSIT' && (
              <div className="px-6 py-4 border-t border-divider bg-surface/30">
                <Button
                  className="w-full bg-success hover:bg-success/90"
                  onClick={() => handleOpenReceive(selectedTransfer)}
                >
                  <CheckBadgeIcon className="h-4 w-4 mr-2" />
                  Receive Items
                </Button>
              </div>
            )}

            {/* Action footer for PENDING transfers */}
            {selectedTransfer.status === 'PENDING' && (
              <div className="px-6 py-4 border-t border-divider bg-surface/30 flex gap-3">
                <Button
                  className="flex-1"
                  onClick={() => { handleStatusUpdate(selectedTransfer.id, 'dispatch'); setSelectedTransfer(null); }}
                >
                  <TruckIcon className="h-4 w-4 mr-2" />
                  Dispatch
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-error border-error/20 hover:bg-error/5"
                  onClick={() => handleOpenCancel(selectedTransfer)}
                >
                  <XCircleIcon className="h-4 w-4 mr-2" />
                  Cancel Transfer
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ─── Receive Transfer Dialog ────────────────────────────────── */}
      <Dialog open={isReceiveOpen} onOpenChange={setIsReceiveOpen}>
        <DialogContent className="max-w-2xl bg-card border-divider">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-primary flex items-center gap-2">
              <CheckBadgeIcon className="h-5 w-5 text-success" />
              Receive Transfer
            </DialogTitle>
            <DialogDescription className="text-text-secondary font-medium">
              Confirm quantities received for items in transfer #{receivingTransfer?.referenceNumber}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="rounded-xl border border-divider overflow-hidden bg-surface/30">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface border-b border-divider">
                  <tr>
                    <th className="px-4 py-3 font-bold text-text-secondary">Product</th>
                    <th className="px-4 py-3 font-bold text-text-secondary text-center">Sent</th>
                    <th className="px-4 py-3 font-bold text-text-secondary text-right">Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-divider/50">
                  {receivingTransfer?.items?.map((item) => (
                    <tr key={item.id} className="bg-card/50">
                      <td className="px-4 py-3 font-medium text-primary">{item.productName}</td>
                      <td className="px-4 py-3 text-center text-text-secondary font-bold">{item.quantityRequested}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <Input
                            type="number"
                            min="0"
                            max={item.quantityRequested}
                            value={receivedQuantities[item.id] ?? 0}
                            onChange={(e) => setReceivedQuantities(prev => ({
                              ...prev,
                              [item.id]: parseInt(e.target.value) || 0
                            }))}
                            className="w-24 h-9 text-right font-black rounded-lg border-divider focus:ring-success"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-2">
              <Label htmlFor="receive-notes" className="text-xs font-black text-text-secondary uppercase tracking-widest px-1">
                Receiving Notes (Optional)
              </Label>
              <Input
                id="receive-notes"
                placeholder="Discrepancies, condition notes, etc..."
                value={receiveNotes}
                onChange={(e) => setReceiveNotes(e.target.value)}
                className="h-10 rounded-xl border-divider bg-surface/50 font-medium"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsReceiveOpen(false)}
              className="rounded-xl font-bold"
            >
              Cancel
            </Button>
            <Button
              className="bg-success hover:bg-success/90 rounded-xl font-black px-8"
              onClick={handleReceiveSubmit}
              disabled={isSubmittingReceive}
            >
              {isSubmittingReceive ? (
                <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckBadgeIcon className="h-4 w-4 mr-2" />
              )}
              Confirm Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Cancel Transfer Confirmation Dialog ────────────────────────── */}
      <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
        <DialogContent className="max-w-md bg-card border-divider">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-primary flex items-center gap-2">
              <XCircleIcon className="h-5 w-5 text-error" />
              Cancel Transfer
            </DialogTitle>
            <DialogDescription className="text-text-secondary font-medium">
              Are you sure you want to cancel transfer #{cancellingTransfer?.referenceNumber}? This will mark it as cancelled and stop the stock movement.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="p-4 rounded-xl bg-error/5 border border-error/10">
              <p className="text-xs text-error font-medium leading-relaxed">
                Cancelling a transfer will prevent it from being dispatched or received. Stock levels will not be affected.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsCancelOpen(false)}
              className="rounded-xl font-bold"
            >
              Keep Transfer
            </Button>
            <Button
              variant="destructive"
              className="bg-error hover:bg-error/90 rounded-xl font-black px-8"
              onClick={handleCancelConfirm}
              disabled={isSubmittingCancel}
            >
              {isSubmittingCancel ? (
                <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <XCircleIcon className="h-4 w-4 mr-2" />
              )}
              Confirm Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthGuard>
  );
}
