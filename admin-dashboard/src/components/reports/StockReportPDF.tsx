import React from 'react';
import { DashboardSummaryResponse, StockLevelResponse } from '@/types';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface StockReportPDFProps {
    summary: DashboardSummaryResponse | null;
    stockLevels: StockLevelResponse[];
    productPrices: Record<string, number>;
    isBranchFiltered?: boolean;
    branchName?: string;
}

export const StockReportPDFTemplate = React.forwardRef<HTMLDivElement, StockReportPDFProps>(
    ({ summary, stockLevels, productPrices, isBranchFiltered, branchName }, ref) => {
        if (!summary) return null;

        // Aggregate by category
        const categoryMap = new Map<string, { units: number; outOfStock: number; value: number }>();
        stockLevels.forEach((item) => {
            const cat = item.category || 'Uncategorized';
            const prev = categoryMap.get(cat) || { units: 0, outOfStock: 0, value: 0 };
            categoryMap.set(cat, {
                units: prev.units + (item.quantityOnHand || 0),
                outOfStock: prev.outOfStock + ((item.quantityOnHand || 0) <= 0 ? 1 : 0),
                value: prev.value + ((item.quantityOnHand || 0) * (productPrices[item.productId] ?? item.price ?? 0)),
            });
        });

        const categoryData = Array.from(categoryMap.entries());

        const totalBranchUnits = stockLevels.reduce((acc, item) => acc + (item.quantityOnHand || 0), 0);
        const totalBranchValue = stockLevels.reduce((acc, item) => acc + ((item.quantityOnHand || 0) * (productPrices[item.productId] ?? item.price ?? 0)), 0);

        const today = new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

        return (
            <div style={{
                position: 'absolute',
                left: '-9999px',
                top: '-9999px',
                visibility: 'hidden',
                pointerEvents: 'none'
            }}>
                {/* We use an explicit width matching A4 portrait in pixels (~794px at 96dpi) for predictable rendering */}
                <div ref={ref} id="pdf-report-template" style={{ width: '794px', backgroundColor: '#ffffff', color: '#1e293b', fontFamily: 'Inter, sans-serif' }}>

                    {/* Branded Header — navy accent bar + report metadata */}
                    <div>
                        {/* Top brand bar */}
                        <div style={{ backgroundColor: '#1e3a5f', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {/* Actual brand logo */}
                                <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.2)', flexShrink: 0 }}>
                                    <img
                                        src="/taura-brand.jpeg"
                                        alt="Taura IMS Logo"
                                        crossOrigin="anonymous"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                    />
                                </div>
                                <div>
                                    <p style={{ margin: 0, color: '#ffffff', fontWeight: 900, fontSize: '16px', letterSpacing: '0.5px' }}>TAURA IMS</p>
                                    <p style={{ margin: 0, color: '#93c5fd', fontSize: '10px', fontWeight: 500, letterSpacing: '1px', textTransform: 'uppercase' }}>Inventory Management System</p>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ margin: 0, color: '#bfdbfe', fontSize: '11px' }}>CONFIDENTIAL</p>
                                <p style={{ margin: 0, color: '#93c5fd', fontSize: '10px', marginTop: '2px' }}>For Internal Use Only</p>
                            </div>
                        </div>

                        {/* Report title row */}
                        <div style={{ backgroundColor: '#f8fafc', padding: '20px 40px 18px 40px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <div>
                                <p style={{ margin: '0 0 4px 0', fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Report</p>
                                <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e3a5f', margin: 0, letterSpacing: '-0.5px' }}>
                                    Stock Levels Report
                                    {isBranchFiltered && branchName && (
                                        <span style={{ color: '#3b82f6', fontWeight: 600 }}> — {branchName}</span>
                                    )}
                                </h1>
                                <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>Period: Current Snapshot</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 2px 0' }}>Generated</p>
                                <p style={{ fontSize: '13px', fontWeight: 700, color: '#334155', margin: 0 }}>{today}</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ padding: '30px 40px' }}>
                        {/* Inventory Summary Section */}
                        <div style={{ marginBottom: '10px' }}>
                            <div style={{ display: 'inline-block', backgroundColor: '#f1f5f9', padding: '8px 16px', borderRadius: '8px', marginBottom: '20px' }}>
                                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#334155', margin: 0 }}>
                                    {isBranchFiltered ? 'Branch Summary' : 'Inventory Summary'}
                                </h2>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: isBranchFiltered ? '1fr' : 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px' }}>
                                {/* Shared Stats */}
                                {!isBranchFiltered && (
                                    <>
                                        <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
                                            <p style={{ fontSize: '20px', fontWeight: 800, color: '#3b82f6', margin: '0 0 8px 0' }}>{summary.totalProducts}</p>
                                            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Total Products</p>
                                        </div>
                                        <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
                                            <p style={{ fontSize: '20px', fontWeight: 800, color: '#1e3a8a', margin: '0 0 8px 0' }}>{totalBranchUnits}</p>
                                            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Total Units</p>
                                        </div>
                                    </>
                                )}

                                <div style={{ 
                                    border: '1px solid #e2e8f0', 
                                    borderRadius: '8px', 
                                    padding: '16px',
                                    ...(isBranchFiltered ? { textAlign: 'center', backgroundColor: '#f8fafc' } : {}) 
                                }}>
                                    <p style={{ fontSize: '20px', fontWeight: 800, color: '#10b981', margin: '0 0 8px 0' }}>{formatCurrency(totalBranchValue)}</p>
                                    <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Inventory Value</p>
                                </div>
                                
                                {!isBranchFiltered && (
                                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
                                        <p style={{ fontSize: '20px', fontWeight: 800, color: '#64748b', margin: '0 0 8px 0' }}>{summary.totalBranches}</p>
                                        <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Branches</p>
                                    </div>
                                )}
                            </div>

                            {!isBranchFiltered && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                                    {/* Full Report Details */}
                                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
                                        <p style={{ fontSize: '20px', fontWeight: 800, color: '#22c55e', margin: '0 0 8px 0' }}>
                                            {summary.totalProducts - (summary.totalLowStockItems || 0) - (summary.totalOutOfStockItems || 0)}
                                        </p>
                                        <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>In Stock</p>
                                    </div>
                                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
                                        <p style={{ fontSize: '20px', fontWeight: 800, color: '#f59e0b', margin: '0 0 8px 0' }}>{summary.totalLowStockItems}</p>
                                        <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Low Stock</p>
                                    </div>
                                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
                                        <p style={{ fontSize: '20px', fontWeight: 800, color: '#ef4444', margin: '0 0 8px 0' }}>{summary.totalOutOfStockItems}</p>
                                        <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Out of Stock</p>
                                    </div>
                                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
                                        <p style={{ fontSize: '20px', fontWeight: 800, color: '#8b5cf6', margin: '0 0 8px 0' }}>{categoryData.length}</p>
                                        <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Categories</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* The rest of the tables will be rendered dynamically by jspdf-autotable in page.tsx */}
                    </div>
                </div>
            </div>
        );
    }
);

StockReportPDFTemplate.displayName = 'StockReportPDFTemplate';
