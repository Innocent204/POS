import React from 'react';
import { DashboardSummaryResponse, StockLevelResponse } from '@/types';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface StockReportPDFProps {
    summary: DashboardSummaryResponse | null;
    stockLevels: StockLevelResponse[];
}

export const StockReportPDFTemplate = React.forwardRef<HTMLDivElement, StockReportPDFProps>(
    ({ summary, stockLevels }, ref) => {
        if (!summary) return null;

        // Aggregate by category
        const categoryMap = new Map<string, { units: number; outOfStock: number; value: number }>();
        stockLevels.forEach((item) => {
            const cat = item.category || 'Uncategorized';
            const prev = categoryMap.get(cat) || { units: 0, outOfStock: 0, value: 0 };
            categoryMap.set(cat, {
                units: prev.units + item.quantityOnHand,
                outOfStock: prev.outOfStock + (item.quantityOnHand <= 0 ? 1 : 0),
                value: prev.value + (item.quantityOnHand * item.sellingPrice),
            });
        });

        const categoryData = Array.from(categoryMap.entries());

        const totalBranchUnits = summary.branchSummaries.reduce((acc, b) => acc + b.totalUnits, 0);
        const totalBranchValue = summary.branchSummaries.reduce((acc, b) => acc + b.totalStockValue, 0);

        const today = new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

        return (
            <div className="absolute left-[-9999px] top-[-9999px]">
                {/* We use an explicit width matching A4 portrait in pixels (~794px at 96dpi) for predictable rendering */}
                <div ref={ref} id="pdf-report-template" style={{ width: '794px', backgroundColor: '#ffffff', color: '#1e293b', fontFamily: 'Inter, sans-serif' }}>

                    {/* Header */}
                    <div style={{ padding: '40px 40px 20px 40px', borderBottom: '2px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#334155', margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>Stock Levels Report</h1>
                            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Period: Current Snapshot</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 4px 0' }}>Generated: {today}</p>
                            <p style={{ fontSize: '14px', fontWeight: 700, color: '#64748b', margin: 0 }}>EcoTracker POS</p>
                        </div>
                    </div>

                    <div style={{ padding: '30px 40px' }}>
                        {/* Inventory Summary Section */}
                        <div style={{ marginBottom: '10px' }}>
                            <div style={{ display: 'inline-block', backgroundColor: '#f1f5f9', padding: '8px 16px', borderRadius: '8px', marginBottom: '20px' }}>
                                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#334155', margin: 0 }}>Inventory Summary</h2>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px' }}>
                                {/* Row 1 */}
                                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
                                    <p style={{ fontSize: '20px', fontWeight: 800, color: '#3b82f6', margin: '0 0 8px 0' }}>{summary.totalProducts}</p>
                                    <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Total Products</p>
                                </div>
                                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
                                    <p style={{ fontSize: '20px', fontWeight: 800, color: '#1e3a8a', margin: '0 0 8px 0' }}>{totalBranchUnits}</p>
                                    <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Total Units</p>
                                </div>
                                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
                                    <p style={{ fontSize: '20px', fontWeight: 800, color: '#10b981', margin: '0 0 8px 0' }}>{formatCurrency(totalBranchValue)}</p>
                                    <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Inventory Value</p>
                                </div>
                                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
                                    <p style={{ fontSize: '20px', fontWeight: 800, color: '#64748b', margin: '0 0 8px 0' }}>{summary.totalBranches}</p>
                                    <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Branches</p>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                                {/* Row 2 */}
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
                        </div>

                        {/* The rest of the tables will be rendered dynamically by jspdf-autotable in page.tsx */}
                    </div>
                </div>
            </div>
        );
    }
);

StockReportPDFTemplate.displayName = 'StockReportPDFTemplate';
