'use client';

import { useEffect, useState, useRef } from 'react';
import Layout from '@/components/layout/layout';
import {
  BuildingOfficeIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import { cn, formatDate } from '@/lib/utils';
import { BranchResponse } from '@/types';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';
import { toJpeg } from 'html-to-image';

export default function BranchesReportPage() {
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const res = await api.branches.getAll();
      if (res.success) {
        setBranches(res.data || []);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    try {
      setIsExporting(true);
      
      const element = reportRef.current;
      const originalShadow = element.style.boxShadow;
      element.style.boxShadow = 'none';
      element.style.border = 'none';
      
      // Use toJpeg instead of toPng to drastically reduce file size
      const dataUrl = await toJpeg(element, {
        quality: 0.85, // 85% quality JPEG is much smaller than PNG
        pixelRatio: 1.5, // Good balance of sharpness and file size
        backgroundColor: '#ffffff'
      });
      
      element.style.boxShadow = originalShadow;
      element.style.border = '';
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate the total height of the image in PDF mm
      const imgProps = pdf.getImageProperties(dataUrl);
      const totalPdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      // Calculate how many A4 pages are needed
      const totalPages = Math.ceil(totalPdfHeight / pdfHeight);
      
      for (let i = 0; i < totalPages; i++) {
        if (i > 0) {
          pdf.addPage();
        }
        // Draw the image, shifting it upwards. 
        // Using an ALIAS ('REPORT_IMG') ensures jsPDF embeds the image file ONLY ONCE, reusing it across pages.
        pdf.addImage(dataUrl, 'JPEG', 0, -(pdfHeight * i), pdfWidth, totalPdfHeight, 'REPORT_IMG', 'FAST');
      }
      
      pdf.save(`Branches_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Failed to export PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const totalBranches = branches.length;
  const activeBranches = branches.filter(b => b.isActive).length;
  const warehouseBranches = branches.filter(b => b.branchType === 'WAREHOUSE').length;
  const shopBranches = branches.filter(b => b.branchType === 'SHOP').length;

  return (
    <Layout>
      <div className="space-y-6 max-w-7xl mx-auto pb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-primary tracking-tight flex items-center gap-2">
              <BuildingOfficeIcon className="w-8 h-8 text-primary/40" />
              Branches Report
            </h1>
            <p className="text-sm font-medium text-text-secondary">Overview of all system branches and their details</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              onClick={fetchBranches} 
              disabled={loading || isExporting}
              className="rounded-xl font-bold shadow-sm"
              variant="outline"
            >
              <ArrowPathIcon className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
              Refresh
            </Button>
            <Button 
              onClick={handleExportPDF}
              disabled={loading || isExporting}
              className="rounded-xl font-bold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white"
            >
              {isExporting ? (
                <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
              )}
              {isExporting ? 'Generating PDF...' : 'Export PDF'}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="h-[600px] bg-surface animate-pulse rounded-3xl" />
        ) : (
          <div className="flex justify-center">
            {/* The actual Report Canvas that will be exported to PDF */}
            <div 
              ref={reportRef} 
              className="bg-white text-slate-900 shadow-2xl rounded-xl border border-slate-200 min-h-[1056px] w-[816px] flex flex-col overflow-hidden relative"
            >
              {/* Top Accent Bar */}
              <div className="h-4 w-full bg-gradient-to-r from-slate-900 to-slate-700"></div>
              
              {/* Report Header */}
              <div className="px-12 pt-10 pb-8 flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                      <span className="text-white font-black text-xl tracking-tight">T</span>
                    </div>
                    <div>
                      <h2 className="text-3xl font-black tracking-tighter text-slate-900 uppercase leading-none">Branches Report</h2>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Taura Inventory Management</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Generated On</p>
                  <p className="text-sm font-bold text-slate-900">{formatDate(new Date().toISOString())}</p>
                </div>
              </div>

              {/* Summary Section */}
              <div className="px-12 py-6 bg-slate-50/50 border-y border-slate-100">
                <div className="grid grid-cols-4 gap-6">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Branches</p>
                    <p className="text-2xl font-black text-slate-900">{totalBranches}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-50 rounded-bl-full -mr-2 -mt-2"></div>
                    <p className="text-[10px] font-black text-emerald-600/70 uppercase mb-1 relative z-10">Active Locations</p>
                    <p className="text-2xl font-black text-emerald-600 relative z-10">{activeBranches}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Warehouses</p>
                    <p className="text-2xl font-black text-slate-900">{warehouseBranches}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Retail Shops</p>
                    <p className="text-2xl font-black text-slate-900">{shopBranches}</p>
                  </div>
                </div>
              </div>

              {/* Table Section */}
              <div className="px-12 py-8 flex-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="py-3 px-2 border-b-2 border-slate-800 text-[11px] font-black text-slate-900 uppercase tracking-widest">Branch Name</th>
                      <th className="py-3 px-2 border-b-2 border-slate-800 text-[11px] font-black text-slate-900 uppercase tracking-widest">Type</th>
                      <th className="py-3 px-2 border-b-2 border-slate-800 text-[11px] font-black text-slate-900 uppercase tracking-widest">Location</th>
                      <th className="py-3 px-2 border-b-2 border-slate-800 text-[11px] font-black text-slate-900 uppercase tracking-widest">Manager</th>
                      <th className="py-3 px-2 border-b-2 border-slate-800 text-[11px] font-black text-slate-900 uppercase tracking-widest">Contact</th>
                      <th className="py-3 px-2 border-b-2 border-slate-800 text-[11px] font-black text-slate-900 uppercase tracking-widest text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {branches.length > 0 ? (
                      branches.map((branch, idx) => (
                        <tr key={branch.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                          <td className="py-4 px-2 font-bold text-slate-900 text-sm">
                            {branch.name}
                          </td>
                          <td className="py-4 px-2">
                            <span className={cn(
                              "text-[10px] px-2 py-1 rounded-md font-bold tracking-widest uppercase",
                              branch.branchType === 'WAREHOUSE' 
                                ? "bg-purple-100 text-purple-700" 
                                : "bg-blue-100 text-blue-700"
                            )}>
                              {branch.branchType}
                            </span>
                          </td>
                          <td className="py-4 px-2 text-slate-600 text-sm">
                            {branch.location || 'N/A'}
                          </td>
                          <td className="py-4 px-2 font-semibold text-slate-900 text-sm">
                            {branch.managerName || 'Unassigned'}
                          </td>
                          <td className="py-4 px-2 font-mono text-slate-600 text-xs">
                            {branch.contactNumber || 'N/A'}
                          </td>
                          <td className="py-4 px-2 text-center">
                            <span className={cn(
                              "text-[10px] px-2 py-1 rounded-md font-bold tracking-widest uppercase",
                              branch.isActive 
                                ? "bg-emerald-100 text-emerald-700" 
                                : "bg-rose-100 text-rose-700"
                            )}>
                              {branch.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-20 text-center text-slate-500 font-medium">
                          No branches found in the system.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Footer */}
              <div className="px-12 py-6 mt-auto border-t border-slate-100 bg-slate-50">
                <p className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest">
                  CONFIDENTIAL - INTERNAL USE ONLY - TAURA INVENTORY MANAGEMENT SYSTEM
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
