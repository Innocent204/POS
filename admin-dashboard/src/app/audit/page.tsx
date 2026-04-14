'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/layout/layout';
import {
    ShieldCheckIcon,
    MagnifyingGlassIcon,
    ArrowPathIcon,
    FunnelIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';
import { formatDate, getErrorMessage } from '@/lib/utils';
import { api } from '@/lib/api';
import { AuditLogResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const ACTION_COLORS: Record<string, { bg: string; text: string; label: string }> = {
    CREATE: { bg: 'bg-success/10', text: 'text-success', label: 'Create' },
    UPDATE: { bg: 'bg-info/10', text: 'text-info', label: 'Update' },
    DELETE: { bg: 'bg-error/10', text: 'text-error', label: 'Delete' },
    LOGIN: { bg: 'bg-primary/10', text: 'text-primary', label: 'Login' },
    LOGOUT: { bg: 'bg-warning/10', text: 'text-warning', label: 'Logout' },
    DEACTIVATE: { bg: 'bg-error/10', text: 'text-error', label: 'Deactivate' },
    DISPATCH: { bg: 'bg-info/10', text: 'text-info', label: 'Dispatch' },
    RECEIVE: { bg: 'bg-success/10', text: 'text-success', label: 'Receive' },
    CANCEL: { bg: 'bg-warning/10', text: 'text-warning', label: 'Cancel' },
};

const MOCK_AUDIT_LOGS: AuditLogResponse[] = [
    {
        id: '1',
        userId: 'u1',
        userEmail: 'admin@taura.com',
        action: 'LOGIN',
        entityType: 'USER',
        entityId: 'u1',
        ipAddress: '192.168.1.1',
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
    {
        id: '2',
        userId: 'u2',
        userEmail: 'manager.lusaka@taura.com',
        action: 'UPDATE',
        entityType: 'PRODUCT',
        entityId: 'p-101',
        oldValue: 'Quantity: 50',
        newValue: 'Quantity: 45',
        ipAddress: '192.168.1.45',
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
    {
        id: '3',
        userId: 'u1',
        userEmail: 'admin@taura.com',
        action: 'DISPATCH',
        entityType: 'TRANSFER',
        entityId: 'TRF-8829',
        newValue: 'Status: IN_TRANSIT',
        ipAddress: '192.168.1.1',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
        id: '4',
        userId: 'u3',
        userEmail: 'cashier.kitwe@taura.com',
        action: 'CREATE',
        entityType: 'SALE',
        entityId: 'REC-5541',
        newValue: 'Total: K450.00',
        ipAddress: '192.168.2.12',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    }
];

export default function AuditPage() {
    const [logs, setLogs] = useState<AuditLogResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [entityFilter, setEntityFilter] = useState('');
    const [actionFilter, setActionFilter] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [usingMockData, setUsingMockData] = useState(false);
    const PAGE_SIZE = 20;

    const fetchLogs = async (currentPage = page) => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.audit.getLogs({
                action: actionFilter || undefined,
                entityType: entityFilter || undefined,
                page: currentPage,
                size: PAGE_SIZE,
            });

            if (response.success && response.data) {
                setLogs(response.data.content || []);
                setTotalPages(response.data.totalPages);
                setTotalElements(response.data.totalElements);
                setUsingMockData(false);
            } else {
                throw new Error(response.message || 'Server error');
            }
        } catch (err) {
            console.error('Fetch audit logs error:', err);
            // Fallback to mock data if backend fails
            setLogs(MOCK_AUDIT_LOGS);
            setTotalPages(1);
            setTotalElements(MOCK_AUDIT_LOGS.length);
            setUsingMockData(true);
            setError(getErrorMessage(err) === 'The server is currently unavailable. Please try again later.'
                ? 'Backend audit service is currently unavailable. Showing local activity log.'
                : getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    // Unified effect for data fetching
    useEffect(() => {
        fetchLogs(page);
    }, [page, actionFilter, entityFilter]);

    const handleFilterChange = (type: 'action' | 'entity', value: string) => {
        setPage(0);
        if (type === 'action') setActionFilter(value);
        else setEntityFilter(value);
    };

    const getActionStyle = (action: string) => {
        return ACTION_COLORS[action] || { bg: 'bg-surface', text: 'text-text-secondary', label: action };
    };

    const filteredLogs = searchTerm
        ? logs.filter(log =>
            log.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.entityType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.entityId?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : logs;

    const entityTypes = ['PRODUCT', 'BRANCH', 'USER', 'TRANSFER', 'SALE', 'STOCK'];
    const actionTypes = Object.keys(ACTION_COLORS);

    return (
                    <Layout>
                <div className="space-y-6">
                    {/* Page Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-primary tracking-tight flex items-center gap-3">
                                <ShieldCheckIcon className="h-8 w-8 text-primary" />
                                Audit Logs
                            </h1>
                            <p className="mt-1 text-sm text-text-secondary font-medium">
                                Complete audit trail of all system actions — Admin only
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {usingMockData && <Badge variant="info" className="animate-pulse">Offline Mode</Badge>}
                            <Badge variant="warning" className="text-xs font-bold uppercase tracking-widest">Admin Only</Badge>
                            <Button variant="outline" size="sm" onClick={() => fetchLogs(page)} disabled={loading}>
                                <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="card p-4">
                        <div className="flex flex-col lg:flex-row gap-3">
                            {/* Search */}
                            <div className="relative flex-1">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
                                <Input
                                    placeholder="Search by user, action, or entity..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="!pl-12"
                                />
                            </div>

                            {/* Entity Type Filter */}
                            <div className="relative flex-shrink-0">
                                <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
                                <select
                                    value={entityFilter}
                                    onChange={(e) => handleFilterChange('entity', e.target.value)}
                                    className="input-field pr-10 text-sm font-medium appearance-none cursor-pointer w-full lg:w-[220px]"
                                >
                                    <option value="">All Entities</option>
                                    {entityTypes.map(type => (
                                        <option key={type} value={type}>{type.charAt(0) + type.slice(1).toLowerCase()}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Action Filter */}
                            <div className="relative flex-shrink-0">
                                <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
                                <select
                                    value={actionFilter}
                                    onChange={(e) => handleFilterChange('action', e.target.value)}
                                    className="input-field pr-10 text-sm font-medium appearance-none cursor-pointer w-full lg:w-[220px]"
                                >
                                    <option value="">All Actions</option>
                                    {actionTypes.map(type => (
                                        <option key={type} value={type}>{ACTION_COLORS[type].label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Error State */}
                    {error && (
                        <div className="bg-error/5 border border-error/20 rounded-xl p-4 flex items-center justify-between">
                            <p className="text-error text-sm font-medium">{error}</p>
                            <Button variant="outline" size="sm" onClick={() => fetchLogs(page)}>Retry</Button>
                        </div>
                    )}

                    {/* Audit Logs Table */}
                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-divider">
                                <thead className="bg-surface">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-widest">Timestamp</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-widest">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-widest">Action</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-widest">Entity</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-widest">Details</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-widest">IP Address</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-card divide-y divide-divider">
                                    {loading ? (
                                        [...Array(8)].map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td colSpan={6} className="px-6 py-4">
                                                    <div className="h-8 bg-surface rounded w-full"></div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : filteredLogs.length > 0 ? (
                                        filteredLogs.map((log) => {
                                            const style = getActionStyle(log.action);
                                            return (
                                                <tr key={log.id} className="hover:bg-surface/50 transition-colors">
                                                    {/* Timestamp */}
                                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-text-secondary font-mono">
                                                        {formatDate(log.createdAt)}
                                                    </td>

                                                    {/* User */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-bold text-primary">{log.userEmail}</div>
                                                    </td>

                                                    {/* Action */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-widest ${style.bg} ${style.text}`}>
                                                            {log.action}
                                                        </span>
                                                    </td>

                                                    {/* Entity */}
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-bold text-primary">{log.entityType}</div>
                                                        <div className="text-[10px] text-text-secondary font-mono truncate max-w-[120px]" title={log.entityId}>
                                                            {log.entityId?.slice(0, 8)}...
                                                        </div>
                                                    </td>

                                                    {/* Details */}
                                                    <td className="px-6 py-4 max-w-xs">
                                                        {log.newValue && (
                                                            <div className="text-xs text-text-secondary bg-surface rounded-lg p-2 font-mono truncate max-w-[200px]" title={log.newValue}>
                                                                {log.newValue.length > 60 ? log.newValue.slice(0, 60) + '...' : log.newValue}
                                                            </div>
                                                        )}
                                                    </td>

                                                    {/* IP */}
                                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-text-secondary font-mono">
                                                        {log.ipAddress || '—'}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-text-secondary">
                                                <ShieldCheckIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                                <p className="font-bold">No audit logs found</p>
                                                <p className="text-sm mt-1">Try adjusting your filters or refresh the list.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Footer */}
                        {!loading && totalPages > 0 && (
                            <div className="px-6 py-4 bg-surface/50 border-t border-divider flex items-center justify-between">
                                <p className="text-xs text-text-secondary font-medium">
                                    Showing {Math.min(page * PAGE_SIZE + 1, totalElements)}–{Math.min((page + 1) * PAGE_SIZE, totalElements)} of {totalElements} logs
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline" size="sm"
                                        onClick={() => setPage(p => Math.max(0, p - 1))}
                                        disabled={page === 0}
                                        className="h-8 w-8 p-0"
                                    >
                                        <ChevronLeftIcon className="h-4 w-4" />
                                    </Button>
                                    <span className="text-xs font-bold text-primary px-2">
                                        {page + 1} / {totalPages}
                                    </span>
                                    <Button
                                        variant="outline" size="sm"
                                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                        disabled={page >= totalPages - 1}
                                        className="h-8 w-8 p-0"
                                    >
                                        <ChevronRightIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Layout>
            );
}

