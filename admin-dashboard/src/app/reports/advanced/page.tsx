'use client';

import { useEffect, useState, useRef } from 'react';
import Layout from '@/components/layout/layout';
import {
  DocumentTextIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  ArchiveBoxIcon,
  UserGroupIcon,
  CloudArrowDownIcon,
  PlusIcon,
  ArrowPathIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { formatDate, formatCurrency, formatNumber, getErrorMessage } from '@/lib/utils';
import { api } from '@/lib/api';
import { DashboardSummaryResponse, StockLevelResponse, BranchResponse } from '@/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { StockReportPDFTemplate } from '@/components/reports/StockReportPDF';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/toaster';

// Types
interface ReportDefinition {
  id: string;
  name: string;
  description: string;
  type: 'Sales' | 'Inventory';
  endpoint: string;
}

const reportDefinitions: ReportDefinition[] = [
  {
    id: 'Stock_Report',
    name: 'Stock Report',
    description: 'Current inventory levels across all branches with valuation.',
    type: 'Inventory',
    endpoint: 'getStockSnapshot',
  },
  {
    id: 'Low_Stock_Report',
    name: 'Low Stock Report',
    description: 'All products below reorder thresholds by priority.',
    type: 'Inventory',
    endpoint: 'getLowStock',
  },
  {
    id: 'Sales_Report',
    name: 'Daily Sales Report',
    description: 'Summary of all sales transactions for the selected period.',
    type: 'Sales',
    endpoint: 'getSalesReport',
  }
];

export default function ReportsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [generating, setGenerating] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);
  const [pdfStockLevels, setPdfStockLevels] = useState<StockLevelResponse[]>([]);
  const pdfRef = useRef<HTMLDivElement>(null);
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [productPrices, setProductPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [summaryRes, branchesRes, productsRes] = await Promise.all([
          api.dashboard.getSummary(),
          api.branches.getAll(),
          api.products.getAll({ size: 2000 })
        ]);

        if (summaryRes.success && summaryRes.data) {
          setSummary(summaryRes.data);
        }
        if (branchesRes.success && branchesRes.data) {
          setBranches(branchesRes.data);
        }
        if (productsRes.success && productsRes.data?.content) {
          const prices: Record<string, number> = {};
          productsRes.data.content.forEach(p => {
            prices[p.id] = p.price;
          });
          setProductPrices(prices);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDownloadPDF = async (report: ReportDefinition) => {
    try {
      setPdfLoading(report.id);

      // Fetch full stock list for the PDF template
      let allStock: StockLevelResponse[] = [];

      if (selectedBranchId === 'all') {
        const branchesRes = await api.branches.getAll();
        if (branchesRes.success && branchesRes.data) {
          const promises = branchesRes.data.map((b: any) => api.stock.getByBranch(b.id));
          const results = await Promise.all(promises);
          results.forEach(res => {
            if (res.success && res.data) {
              allStock = [...allStock, ...res.data];
            }
          });
        }
      } else {
        const res = await api.stock.getByBranch(selectedBranchId);
        if (res.success && res.data) {
          allStock = res.data;
        }
      }

      if (allStock.length === 0) throw new Error("Failed to fetch stock data or no stock exists");

      setPdfStockLevels(allStock);

      // Ensure we have summary data (for branch/category aggregates)
      let currentSummary = summary;
      if (!currentSummary) {
        const summaryRes = await api.dashboard.getSummary();
        if (summaryRes.success && summaryRes.data) {
          currentSummary = summaryRes.data;
          setSummary(currentSummary);
        }
      }

      if (!currentSummary || !currentSummary.branchSummaries) {
        throw new Error("Dashboard summary data is unavailable. Please refresh the page.");
      }

      // Wait for React to render the template with the new data
      await new Promise(resolve => setTimeout(resolve, 800));

      if (!pdfRef.current) throw new Error("Template not found");

      // Generate canvas of JUST the header and summary boxes
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {

          const styles = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
          styles.forEach(s => s.remove());

          // Ensure the template is visible and correctly positioned in the clone
          const template = clonedDoc.getElementById('pdf-report-template');
          if (template && template.parentElement) {
            template.parentElement.style.visibility = 'visible';
            template.parentElement.style.position = 'static';
            template.parentElement.style.display = 'block';
            template.parentElement.style.opacity = '1';
            // Fallback colors to ensure contrast if anything is missed
            template.parentElement.style.color = '#1e293b';
            template.parentElement.style.backgroundColor = '#ffffff';
          }
        }
      });

      // A4 portrait is 595.28 x 841.89 pt
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = pdfWidth / imgWidth;
      const finalHeight = imgHeight * ratio;

      const imgData = canvas.toDataURL('image/png');

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, finalHeight);
      let currentY = finalHeight + 20;

      // Helper to draw pill headers — navy brand color
      const drawSectionHeader = (title: string, yPos: number) => {
        pdf.setFillColor(30, 58, 95);
        pdf.roundedRect(40, yPos - 14, 140, 24, 4, 4, 'F');
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(255, 255, 255);
        pdf.text(title.toUpperCase(), 48, yPos + 2);
        // Reset text color
        pdf.setTextColor(51, 65, 85);
      };

      // STOCK BY BRANCH - Only for full reports
      if (selectedBranchId === 'all') {
        drawSectionHeader('Stock by Branch', currentY);

        const branchRows = currentSummary.branchSummaries.map(b => [
          b.branchName,
          b.totalUnits.toString(),
          b.outOfStockCount.toString(),
          formatCurrency(b.totalStockValue)
        ]);
        const totalBranchUnits = currentSummary.branchSummaries.reduce((acc, b) => acc + b.totalUnits, 0);
        const totalBranchOut = currentSummary.branchSummaries.reduce((acc, b) => acc + b.outOfStockCount, 0);
        const totalBranchVal = currentSummary.branchSummaries.reduce((acc, b) => acc + b.totalStockValue, 0);
        branchRows.push(['TOTAL', totalBranchUnits.toString(), totalBranchOut.toString(), formatCurrency(totalBranchVal)]);

        autoTable(pdf, {
          startY: currentY + 20,
          head: [['Branch', 'Units On Hand', 'Out of Stock', 'Inventory Value']],
          body: branchRows,
          theme: 'grid',
          headStyles: { fillColor: [30, 58, 95], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
          styles: { fontSize: 9, cellPadding: 6, textColor: [51, 65, 85] },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          didParseCell: function (data) {
            if (data.row.index === branchRows.length - 1) {
              data.cell.styles.fontStyle = 'bold';
              data.cell.styles.fillColor = [236, 243, 255];
              data.cell.styles.textColor = [30, 58, 95];
            }
          }
        });

        // STOCK BY CATEGORY
        currentY = (pdf as any).lastAutoTable.finalY + 30;

        const categoryMap = new Map<string, { units: number; outOfStock: number; value: number }>();
        allStock.forEach((item) => {
          const cat = item.category || 'Uncategorized';
          const prev = categoryMap.get(cat) || { units: 0, outOfStock: 0, value: 0 };
          categoryMap.set(cat, {
            units: prev.units + (item.quantityOnHand || 0),
            outOfStock: prev.outOfStock + ((item.quantityOnHand || 0) <= 0 ? 1 : 0),
            value: prev.value + ((item.quantityOnHand || 0) * (productPrices[item.productId] ?? item.price ?? 0)),
          });
        });
        const categoryRows = Array.from(categoryMap.entries())
          .sort((a, b) => b[1].value - a[1].value)
          .map(([cat, stats]) => [
            cat,
            stats.units.toString(),
            stats.outOfStock.toString(),
            formatCurrency(stats.value)
          ]);

        drawSectionHeader('Stock by Category', currentY);

        autoTable(pdf, {
          startY: currentY + 20,
          head: [['Category', 'Units On Hand', 'Out of Stock', 'Inventory Value']],
          body: categoryRows,
          theme: 'grid',
          headStyles: { fillColor: [30, 58, 95], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
          styles: { fontSize: 9, cellPadding: 6, textColor: [51, 65, 85] },
          alternateRowStyles: { fillColor: [248, 250, 252] }
        });

        currentY = (pdf as any).lastAutoTable.finalY + 30;
      }

      // FULL INVENTORY
      // currentY remains the same if tables were skipped, or updated if they were drawn

      let invTitle = `Full Inventory (${allStock.length})`;
      pdf.setFillColor(241, 245, 249);
      pdf.roundedRect(40, currentY - 14, 140, 24, 4, 4, 'F');
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(51, 65, 85);
      pdf.text(invTitle, 48, currentY + 2);

      const inventoryRows = allStock.map(item => [
        item.productName,
        item.productSku,
        item.category || 'N/A',
        item.branchName,
        (item.quantityOnHand || 0).toString(),
        formatCurrency((item.quantityOnHand || 0) * (productPrices[item.productId] ?? item.price ?? 0))
      ]);

      autoTable(pdf, {
        startY: currentY + 20,
        head: [['Product', 'SKU', 'Category', 'Branch', 'On Hand (Qty)', 'Total Value']],
        body: inventoryRows,
        theme: 'grid',
        headStyles: { fillColor: [30, 58, 95], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
        styles: { fontSize: 8, cellPadding: 5, textColor: [51, 65, 85] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: { 4: { halign: 'center' }, 5: { halign: 'right' } },
        didParseCell: function (data) {
          if (data.section === 'body') {
            const qtyStr = inventoryRows[data.row.index][4];
            const qty = parseInt(qtyStr, 10);
            if (qty <= 0) {
              data.cell.styles.fillColor = [254, 242, 242];
              data.cell.styles.textColor = [185, 28, 28];
            } else if (qty <= 5) {
              data.cell.styles.fillColor = [255, 251, 235];
              data.cell.styles.textColor = [146, 64, 14];
            }
          }
        }
      });

      // Add branded footer with page numbers
      const pageCount = (pdf as any).internal.getNumberOfPages();
      const pageH = pdf.internal.pageSize.getHeight();
      const pageW = pdf.internal.pageSize.getWidth();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        // Footer divider line
        pdf.setDrawColor(30, 58, 95);
        pdf.setLineWidth(0.5);
        pdf.line(40, pageH - 30, pageW - 40, pageH - 30);
        // Left: company
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(30, 58, 95);
        pdf.text('TAURA IMS', 40, pageH - 18);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(148, 163, 184);
        pdf.text(' — Confidential. For Internal Use Only.', 40 + pdf.getTextWidth('TAURA IMS'), pageH - 18);
        // Right: page number
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(30, 58, 95);
        const pageLabel = `Page ${i} of ${pageCount}`;
        pdf.text(pageLabel, pageW - 40 - pdf.getTextWidth(pageLabel), pageH - 18);
      }

      const branchName = selectedBranchId === 'all' ? 'All_Branches' : branches.find(b => b.id === selectedBranchId)?.name.replace(/\s+/g, '_') || 'Branch';
      pdf.save(`${report.id}_${branchName}_${new Date().toISOString().split('T')[0]}.pdf`);

      toast({
        title: "PDF Generated",
        description: "Your report has been downloaded.",
      });

    } catch (err: any) {
      console.error('PDF Error:', err);
      toast({
        variant: "destructive",
        title: "PDF Generation Failed",
        description: err.message || "An error occurred while generating PDF."
      });
    } finally {
      setPdfLoading(null);
    }
  };

  const handleGenerateReport = async (report: ReportDefinition) => {
    try {
      setGenerating(report.id);

      const params: any = { size: 100 }; // Standard size for fetching
      if (selectedBranchId !== 'all') {
        params.branchId = selectedBranchId;
      }

      let allData: any[] = [];
      let currentPage = 0;
      let totalPages = 1;

      // Special handling for Stock_Report to match PDF data source
      if (report.id === 'Stock_Report') {
        let allStock: StockLevelResponse[] = [];
        if (selectedBranchId === 'all') {
          const branchesRes = await api.branches.getAll();
          if (branchesRes.success && branchesRes.data) {
            const promises = branchesRes.data.map((b: any) => api.stock.getByBranch(b.id));
            const results = await Promise.all(promises);
            results.forEach(res => {
              if (res.success && res.data) {
                allStock = [...allStock, ...res.data];
              }
            });
          }
        } else {
          const res = await api.stock.getByBranch(selectedBranchId);
          if (res.success && res.data) {
            allStock = res.data;
          }
        }
        allData = allStock.map(item => ({
          productName: item.productName,
          productSku: item.productSku,
          category: item.category || 'N/A',
          branchName: item.branchName,
          quantityOnHand: item.quantityOnHand,
          minimumThreshold: item.minimumStockThreshold || 0,
          price: productPrices[item.productId] ?? item.price ?? 0,
          totalValue: (item.quantityOnHand || 0) * (productPrices[item.productId] ?? item.price ?? 0),
          status: item.stockStatus
        }));
        const res = await api.reports.getLowStock({
          branchId: selectedBranchId === 'all' ? undefined : selectedBranchId
        });
        if (res.success && res.data) {
          allData = res.data.map((item: any) => ({
            productName: item.productName,
            productSku: item.productSku,
            category: item.category || 'N/A',
            branchName: item.branchName,
            openingStock: item.openingStock,
            stockIn: item.stockIn,
            stockOut: item.stockOut,
            closingStock: item.closingStock,
            totalSalesValue: item.totalSalesValue
          }));
        }
      } else {
        // Paged fetching for other reports (like Sales)
        while (currentPage < totalPages) {
          const response = await (api.reports as any)[report.endpoint]({ ...params, page: currentPage });

          if (!response.success) {
            throw new Error(response.message || 'Failed to generate report');
          }

          const pageData = Array.isArray(response.data) ? response.data :
            (response.data?.content || []);

          allData = [...allData, ...pageData];

          // Break if not paged or if we've received everything
          if (!Array.isArray(response.data?.content) || response.data.last || pageData.length < params.size) {
            break;
          }
          currentPage++;
        }
      }

      if (allData.length === 0) {
        toast({
          title: "No Data",
          description: "This report returned no records for the selected filters.",
          variant: "warning"
        });
        return;
      }

      // Final manual filter for branch if needed (double safety)
      let data = allData;
      if (selectedBranchId !== 'all' && report.id !== 'Stock_Report') {
        data = data.filter((item: any) =>
          item.branchId === selectedBranchId ||
          item.branchName?.toLowerCase() === branches.find(b => b.id === selectedBranchId)?.name.toLowerCase()
        );
      }

      if (data.length === 0) {
        toast({
          title: "No Matching Data",
          description: "No records found for the selected branch.",
          variant: "warning"
        });
        return;
      }

      // ── Excel: Build branded workbook ────────────────────────────────────
      const headers = Object.keys(data[0]);
      const colCount = headers.length;

      const workbook = new ExcelJS.Workbook();
      // Workbook metadata
      workbook.creator = 'Taura IMS';
      workbook.company = 'Taura Inventory Management System';
      workbook.created = new Date();
      workbook.title = report.name;

      const worksheet = workbook.addWorksheet(report.name.substring(0, 31));

      const branchLabel = selectedBranchId === 'all'
        ? 'All Branches'
        : branches.find(b => b.id === selectedBranchId)?.name || 'Unknown Branch';
      const generatedAt = new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

      // Row 1 — Company title
      worksheet.addRow(['TAURA INVENTORY MANAGEMENT SYSTEM']);
      worksheet.mergeCells(1, 1, 1, colCount);
      const titleRow = worksheet.getRow(1);
      titleRow.height = 28;
      titleRow.font = { name: 'Calibri', bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
      titleRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
      titleRow.alignment = { vertical: 'middle', horizontal: 'center' };

      // Row 2 — Report metadata
      worksheet.addRow([`${report.name}  |  Scope: ${branchLabel}  |  Generated: ${generatedAt}`]);
      worksheet.mergeCells(2, 1, 2, colCount);
      const metaRow = worksheet.getRow(2);
      metaRow.height = 20;
      metaRow.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF334155' } };
      metaRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
      metaRow.alignment = { vertical: 'middle', horizontal: 'center' };

      // Row 3 — Blank spacer
      worksheet.addRow([]);

      // Row 4 — Column headers
      const friendlyHeaders = headers.map(h =>
        h.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim()
      );
      worksheet.addRow(friendlyHeaders);
      const headerRow = worksheet.getRow(4);
      headerRow.height = 22;
      headerRow.font = { name: 'Calibri', bold: true, size: 10, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
      headerRow.eachCell(cell => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF1E3A5F' } },
          bottom: { style: 'medium', color: { argb: 'FF93C5FD' } },
          left: { style: 'thin', color: { argb: 'FF2D5A8E' } },
          right: { style: 'thin', color: { argb: 'FF2D5A8E' } },
        };
      });

      // Detect value/price columns by name
      const currencyKeywords = ['value', 'price', 'cost', 'total', 'sales', 'amount', 'revenue'];
      const isCurrencyCol = (key: string) => currencyKeywords.some(k => key.toLowerCase().includes(k));
      const isNumberCol = (key: string) => ['quantity', 'units', 'stock', 'count', 'opening', 'closing', 'stockin', 'stockout'].some(k => key.toLowerCase().includes(k));

      // Data rows
      data.forEach((row: any, rowIdx: number) => {
        const values = headers.map(header => row[header]);
        const dataRow = worksheet.addRow(values);
        dataRow.height = 18;
        dataRow.font = { name: 'Calibri', size: 9.5 };
        // Alternate row fill
        if (rowIdx % 2 === 0) {
          dataRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
        }
        dataRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          const key = headers[colNumber - 1];
          const rawVal = row[key];
          // Format currency cells
          if (isCurrencyCol(key) && rawVal !== null && rawVal !== undefined && !isNaN(Number(rawVal))) {
            cell.value = Number(rawVal);
            cell.numFmt = '$#,##0.00';
            cell.alignment = { horizontal: 'right', vertical: 'middle' };
          } else if (isNumberCol(key) && rawVal !== null && rawVal !== undefined && !isNaN(Number(rawVal))) {
            cell.value = Number(rawVal);
            cell.numFmt = '#,##0';
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          } else {
            cell.alignment = { vertical: 'middle' };
          }
          cell.border = {
            top: { style: 'hair', color: { argb: 'FFCBD5E1' } },
            bottom: { style: 'hair', color: { argb: 'FFCBD5E1' } },
            left: { style: 'hair', color: { argb: 'FFCBD5E1' } },
            right: { style: 'hair', color: { argb: 'FFCBD5E1' } },
          };
        });
      });

      // Auto-fit column widths
      worksheet.columns.forEach((column, colIdx) => {
        const key = headers[colIdx];
        let maxLen = friendlyHeaders[colIdx]?.length || 10;
        data.forEach((row: any) => {
          const val = row[key];
          const len = val != null ? String(val).length : 0;
          if (len > maxLen) maxLen = len;
        });
        column.width = Math.min(Math.max(maxLen + 2, 12), 40);
      });

      // Freeze top 4 rows so headers stay visible while scrolling
      worksheet.views = [{ state: 'frozen', ySplit: 4, xSplit: 0 }];

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const branchName = selectedBranchId === 'all' ? 'All_Branches' : branches.find(b => b.id === selectedBranchId)?.name.replace(/\s+/g, '_') || 'Branch';
      saveAs(blob, `${report.id}_${branchName}_${new Date().toISOString().split('T')[0]}.xlsx`);

      toast({
        title: "Report Generated",
        description: `${report.name} has been successfully exported as Excel.`,
      });
    } catch (err: any) {
      console.error('Report generation error:', err);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: getErrorMessage(err),
      });
    } finally {
      setGenerating(null);
    }
  };

  const filteredReports = reportDefinitions.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'All' || report.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'Sales': return <ShoppingBagIcon className="h-6 w-6 text-success" />;
      case 'Inventory': return <ArchiveBoxIcon className="h-6 w-6 text-info" />;
      default: return <DocumentTextIcon className="h-6 w-6 text-primary" />;
    }
  };

  const getBg = (type: string) => {
    switch (type) {
      case 'Sales': return 'bg-success/10';
      case 'Inventory': return 'bg-info/10';
      default: return 'bg-primary/10';
    }
  };

  return (
          <Layout>
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-3xl font-black text-primary tracking-tight">Advanced Reporting</h1>
              <p className="text-text-secondary font-medium">Generate and analyze your business data</p>
            </div>
          </div>

          <div className="card p-6 border-none shadow-xl shadow-primary/5">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
                <Input
                  placeholder="Search available reports..."
                  className="!pl-12 h-12 text-base rounded-2xl border-divider focus:ring-primary/20"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full lg:w-64">
                <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
                  <SelectTrigger className="h-12 rounded-2xl border-divider focus:ring-primary/20">
                    <div className="flex items-center gap-2">
                      <BuildingOfficeIcon className="h-4 w-4 text-text-secondary" />
                      <SelectValue placeholder="All Branches" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    {branches.map(branch => (
                      <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3">
                {['All', 'Sales', 'Inventory'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-6 py-2 rounded-2xl text-sm font-black transition-all duration-300 ${selectedType === type
                      ? 'bg-primary text-white shadow-lg shadow-primary/30'
                      : 'bg-surface text-text-secondary hover:text-primary hover:bg-surface/80'
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Products', value: loading ? '...' : formatNumber(summary?.totalProducts || 0), color: 'primary' },
              { label: 'Inventory Value', value: loading ? '...' : formatCurrency(summary?.totalInventoryValue || 0), color: 'info' },
              { label: 'Low Stock Alerts', value: loading ? '...' : formatNumber(summary?.totalLowStockItems || 0), color: 'warning' },
              { label: 'Out of Stock', value: loading ? '...' : formatNumber(summary?.totalOutOfStockItems || 0), color: 'error' },
            ].map((m, i) => (
              <Card key={i} className="p-4 border-none shadow-sm flex flex-col items-center justify-center text-center">
                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">{m.label}</p>
                <p className={`text-xl font-black text-primary`}>{m.value}</p>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="group card p-6 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 border-none relative overflow-hidden"
              >
                <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${getBg(report.type)} opacity-50 blur-2xl group-hover:scale-150 transition-transform duration-700`}></div>

                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl ${getBg(report.type)}`}>
                      {getIcon(report.type)}
                    </div>
                    <Badge variant="success" className="font-black text-[10px] px-3">
                      READY
                    </Badge>
                  </div>

                  <h3 className="text-lg font-black text-primary leading-tight mb-2 group-hover:text-primary transition-colors">
                    {report.name}
                  </h3>
                  <p className="text-sm text-text-secondary font-medium flex-1 line-clamp-2 mb-6">
                    {report.description}
                  </p>

                  <div className="space-y-4">
                    <Separator className="bg-divider/50" />
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1 text-[10px] font-black text-text-secondary uppercase tracking-wider">
                        <CloudArrowDownIcon className="h-3 w-3" />
                        Excel Format
                      </div>
                      <span className="font-bold text-primary">v1.3</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 rounded-xl h-10 font-bold shadow-lg shadow-primary/10"
                        disabled={generating === report.id || pdfLoading === report.id}
                        onClick={() => handleGenerateReport(report)}
                      >
                        {generating === report.id ? (
                          <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <DocumentTextIcon className="h-4 w-4 mr-2" />
                        )}
                        Excel
                      </Button>

                      {report.id === 'Stock_Report' && (
                        <Button
                          variant="secondary"
                          className="flex-1 rounded-xl h-10 font-bold"
                          disabled={generating === report.id || pdfLoading === report.id}
                          onClick={() => handleDownloadPDF(report)}
                        >
                          {pdfLoading === report.id ? (
                            <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                          )}
                          PDF
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredReports.length === 0 && (
            <div className="py-24 card flex flex-col items-center justify-center border-dashed border-2 border-divider bg-surface/50">
              <div className="p-6 bg-surface rounded-full mb-4">
                <DocumentTextIcon className="h-12 w-12 text-text-secondary opacity-30" />
              </div>
              <h3 className="text-xl font-black text-primary mb-2">No Reports Found</h3>
              <p className="text-text-secondary font-medium">Try adjusting your search or filters.</p>
              <Button variant="link" onClick={() => { setSearchTerm(''); setSelectedType('All'); }} className="mt-4 font-bold">
                Clear all filters
              </Button>
            </div>
          )}

          {/* Hidden PDF Templates */}
          <StockReportPDFTemplate
            ref={pdfRef}
            summary={summary}
            stockLevels={pdfStockLevels}
            productPrices={productPrices}
            isBranchFiltered={selectedBranchId !== 'all'}
            branchName={selectedBranchId === 'all' ? undefined : branches.find(b => b.id === selectedBranchId)?.name}
          />

        </div>
      </Layout>
      );
}

