'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/layout/layout';
import { BuildingOfficeIcon, PlusIcon, MagnifyingGlassIcon, TrashIcon, BuildingStorefrontIcon, CubeIcon, XMarkIcon, PhoneIcon, UserIcon, MapPinIcon, CalendarDaysIcon, CheckCircleIcon, XCircleIcon, ArchiveBoxIcon, ShoppingBagIcon, PencilIcon } from '@heroicons/react/24/outline';
import { formatDate, formatCurrency, getErrorMessage } from '@/lib/utils';
import { api } from '@/lib/api';
import { BranchResponse, StockLevelResponse, DashboardSummaryResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toaster';
import { Label } from '@/components/ui/label';

export default function BranchesPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<BranchResponse | null>(null);
  const [stockBranch, setStockBranch] = useState<BranchResponse | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    branchType: 'SHOP' as 'SHOP' | 'WAREHOUSE',
    location: '',
    managerName: '',
    contactNumber: '',
    isActive: true
  });

  // Stock state
  const [stock, setStock] = useState<StockLevelResponse[]>([]);
  const [loadingStock, setLoadingStock] = useState(false);
  const [isStockOpen, setIsStockOpen] = useState(false);
  const [stockSearch, setStockSearch] = useState('');

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const [branchesResponse, summaryResponse] = await Promise.all([
        api.branches.getAll(),
        api.dashboard.getSummary()
      ]);

      if (branchesResponse.success) {
        setBranches(branchesResponse.data);
      } else {
        setError(branchesResponse.message || 'Failed to load branches');
      }

      if (summaryResponse.success && summaryResponse.data) {
        setDashboardSummary(summaryResponse.data);
      }
    } catch (err: unknown) {
      console.error('Fetch branches error:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchBranchStock = async (branchId: string) => {
    try {
      setLoadingStock(true);
      const response = await api.stock.getByBranch(branchId);
      if (response.success) {
        setStock(response.data || []);
      }
    } catch (err) {
      console.error('Fetch stock error:', err);
    } finally {
      setLoadingStock(false);
    }
  };

  const calculateBranchValue = () => {
    if (stockBranch && dashboardSummary) {
      const branchSummary = dashboardSummary.branchSummaries.find(b => b.branchId === stockBranch.id);
      if (branchSummary) return branchSummary.totalStockValue;
    }
    return stock.reduce((sum, item) => sum + (item.quantityOnHand * (item.price || 0)), 0);
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      // Include isActive: true so branch is visible after creation
      const createData = { ...formData, isActive: true };
      console.log('Creating branch with data:', createData);
      const response = await api.branches.create(createData);
      console.log('Create branch response:', response);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Branch created successfully',
        });
        setIsAddOpen(false);
        fetchBranches();
        setFormData({
          name: '',
          branchType: 'SHOP',
          location: '',
          managerName: '',
          contactNumber: '',
          isActive: true
        });
      } else {
        throw new Error(response.message || 'Failed to create branch');
        }
    } catch (err: unknown) {
      console.error('Create branch error:', err);
      const axiosErr = err as { response?: { data?: { message?: string }; status?: number }; message?: string };
      console.error('Error response data:', axiosErr.response?.data);
      console.error('Error response status:', axiosErr.response?.status);
      const errorMsg = axiosErr.response?.data?.message || axiosErr.message || 'Failed to create branch';
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (branch: BranchResponse) => {
    setEditingBranch(branch.id);
    setFormData({
      name: branch.name,
      branchType: branch.branchType,
      location: branch.location || '',
      managerName: branch.managerName || '',
      contactNumber: branch.contactNumber || '',
      isActive: branch.isActive
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBranch) return;
    try {
      setIsSubmitting(true);
      const response = await api.branches.update(editingBranch, formData);
      if (response.success) {
        toast({ title: 'Success', description: 'Branch updated successfully' });
        setIsEditOpen(false);
        setEditingBranch(null);
        fetchBranches();
        setFormData({ name: '', branchType: 'SHOP', location: '', managerName: '', contactNumber: '', isActive: true });
      } else {
        throw new Error(response.message || 'Failed to update branch');
      }
    } catch (err: unknown) {
      console.error('Update branch error:', err);
      toast({ title: 'Error', description: getErrorMessage(err), variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this branch?')) return;
    try {
      const response = await api.branches.delete(id);
      if (response.success) {
        toast({
          title: 'Deleted',
          description: 'Branch removed successfully',
        });
        fetchBranches();
      } else {
        throw new Error(response.message || 'Failed to delete branch');
      }
    } catch (err: unknown) {
      console.error('Delete branch error:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete branch';
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
    }
  };

  const filteredBranches = branches.filter(branch =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (branch.location || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
          <Layout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-primary">Branches</h1>
              <p className="mt-1 text-sm text-text-secondary">
                Manage your store locations and their inventory
              </p>
            </div>
            <Dialog open={isAddOpen} onOpenChange={(open) => {
              setIsAddOpen(open);
              if (!open) {
                setFormData({
                  name: '',
                  branchType: 'SHOP',
                  location: '',
                  managerName: '',
                  contactNumber: '',
                  isActive: true
                });
              }
            }}>
              <DialogTrigger asChild>
                <Button>
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Branch
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Branch</DialogTitle>
                  <DialogDescription>
                    Create a new branch location for your business.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-6 py-4">
                  <div>
                    <Label className="text-sm font-semibold text-primary mb-3 block">Branch Type</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, branchType: 'SHOP' })}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${formData.branchType === 'SHOP'
                          ? 'border-success bg-success/10 text-success'
                          : 'border-success/30 bg-success/5 text-success/70 hover:border-success/50 hover:bg-success/10'
                          }`}
                      >
                        <BuildingStorefrontIcon className="h-6 w-6 mx-auto mb-2" />
                        <div className="text-sm font-medium">Shop</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, branchType: 'WAREHOUSE' })}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${formData.branchType === 'WAREHOUSE'
                          ? 'border-info bg-info/10 text-info'
                          : 'border-info/30 bg-info/5 text-info/70 hover:border-info/50 hover:bg-info/10'
                          }`}
                      >
                        <BuildingOfficeIcon className="h-6 w-6 mx-auto mb-2" />
                        <div className="text-sm font-medium">Warehouse</div>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Branch Name</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Harare CBD Shop"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      required
                      value={formData.location}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. 123 Samora Machel, Harare"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="managerName">Manager Name</Label>
                    <Input
                      id="managerName"
                      required
                      value={formData.managerName}
                      onChange={e => setFormData({ ...formData, managerName: e.target.value })}
                      placeholder="e.g. Tendai Moyo"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactNumber">Contact Number</Label>
                    <Input
                      id="contactNumber"
                      required
                      value={formData.contactNumber}
                      onChange={e => setFormData({ ...formData, contactNumber: e.target.value })}
                      placeholder="+263771234567"
                    />
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Creating...' : 'Create Branch'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Edit Branch Dialog */}
            <Dialog open={isEditOpen} onOpenChange={(open) => {
              setIsEditOpen(open);
              if (!open) {
                setEditingBranch(null);
                setFormData({
                  name: '',
                  branchType: 'SHOP',
                  location: '',
                  managerName: '',
                  contactNumber: '',
                  isActive: true
                });
              }
            }}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Edit Branch</DialogTitle>
                  <DialogDescription>
                    Update details for this branch location.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleEditSubmit} className="space-y-6 py-4">
                  <div>
                    <Label className="text-sm font-semibold text-primary mb-3 block">Branch Type</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, branchType: 'SHOP' })}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${formData.branchType === 'SHOP'
                          ? 'border-success bg-success/10 text-success'
                          : 'border-success/30 bg-success/5 text-success/70 hover:border-success/50 hover:bg-success/10'
                          }`}
                      >
                        <BuildingStorefrontIcon className="h-6 w-6 mx-auto mb-2" />
                        <div className="text-sm font-medium">Shop</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, branchType: 'WAREHOUSE' })}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${formData.branchType === 'WAREHOUSE'
                          ? 'border-info bg-info/10 text-info'
                          : 'border-info/30 bg-info/5 text-info/70 hover:border-info/50 hover:bg-info/10'
                          }`}
                      >
                        <BuildingOfficeIcon className="h-6 w-6 mx-auto mb-2" />
                        <div className="text-sm font-medium">Warehouse</div>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Branch Name</Label>
                    <Input
                      id="edit-name"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Harare CBD Shop"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-location">Location</Label>
                    <Input
                      id="edit-location"
                      value={formData.location}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. 123 Main St, Harare"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-managerName">Manager Name</Label>
                      <Input
                        id="edit-managerName"
                        value={formData.managerName}
                        onChange={e => setFormData({ ...formData, managerName: e.target.value })}
                        placeholder="e.g. John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-contactNumber">Contact Number</Label>
                      <Input
                        id="edit-contactNumber"
                        value={formData.contactNumber}
                        onChange={e => setFormData({ ...formData, contactNumber: e.target.value })}
                        placeholder="e.g. +263 77 123 4567"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="edit-isActive"
                      checked={formData.isActive}
                      onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-4 w-4 rounded border-divider text-primary focus:ring-primary"
                    />
                    <Label htmlFor="edit-isActive" className="text-sm font-medium">
                      Branch is active
                    </Label>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Updating...' : 'Update Branch'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <BuildingOfficeIcon className="h-6 w-6 text-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">Total Locations</p>
                  <p className="text-2xl font-black text-primary">{filteredBranches.length}</p>
                </div>
              </div>
            </div>

            <div className="card p-6 border-l-4 border-success">
              <div className="flex items-center">
                <div className="p-3 bg-success/10 rounded-lg">
                  <BuildingStorefrontIcon className="h-6 w-6 text-success" />
                </div>
                <div className="ml-4">
                  <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">Retail Shops</p>
                  <p className="text-2xl font-black text-success">
                    {filteredBranches.filter(b => b.branchType === 'SHOP').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6 border-l-4 border-info">
              <div className="flex items-center">
                <div className="p-3 bg-info/10 rounded-lg">
                  <CubeIcon className="h-6 w-6 text-info" />
                </div>
                <div className="ml-4">
                  <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">Warehouses</p>
                  <p className="text-2xl font-black text-info">
                    {filteredBranches.filter(b => b.branchType === 'WAREHOUSE').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-text-secondary" />
              </div>
              <Input
                type="text"
                placeholder="Search by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="!pl-12"
              />
            </div>
          </div>

          {error && (
            <div className="bg-error-light border border-error/20 rounded-lg p-4 flex items-center justify-between">
              <p className="text-error text-sm">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchBranches}>
                Retry
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="card p-6 animate-pulse">
                  <div className="h-6 bg-surface rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-surface rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-surface rounded w-2/3 mb-4"></div>
                  <div className="h-10 bg-surface rounded w-full"></div>
                </div>
              ))
            ) : filteredBranches.length > 0 ? (
              filteredBranches.map((branch) => (
                <div key={branch.id} className="card p-6 hover-lift">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-bold text-primary">{branch.name}</h3>
                        <Badge variant={branch.isActive ? 'success' : 'error'}>
                          {branch.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant={branch.branchType === 'WAREHOUSE' ? 'info' : 'default'}>
                          {branch.branchType === 'WAREHOUSE' ? 'Warehouse' : 'Shop'}
                        </Badge>
                      </div>
                      <p className="text-sm text-text-secondary mt-1">{branch.location}</p>
                      <p className="text-sm text-text-secondary mt-2">Manager: {branch.managerName}</p>
                      <p className="text-sm text-text-secondary">{branch.contactNumber}</p>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Button variant="ghost" size="icon" title="Delete" onClick={() => handleDelete(branch.id)}>
                        <TrashIcon className="h-4 w-4 text-error" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Edit" onClick={() => openEditDialog(branch)}>
                        <PencilIcon className="h-4 w-4 text-primary" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-divider flex justify-between items-center text-xs text-text-secondary">
                    <span>Created {formatDate(branch.createdAt)}</span>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-success font-bold hover:no-underline"
                        onClick={() => {
                          setStockBranch(branch);
                          setIsStockOpen(true);
                          fetchBranchStock(branch.id);
                        }}
                      >
                        <ArchiveBoxIcon className="h-3.5 w-3.5 mr-1" />
                        View Products
                      </Button>
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-primary font-bold hover:no-underline"
                        onClick={() => setSelectedBranch(branch)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full card py-12 text-center text-text-secondary">
                <BuildingOfficeIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No branches found matching your search</p>
              </div>
            )}
          </div>
        </div>

      {/* ─── Branch Detail Slide-over ─────────────────────────────────── */}
      {selectedBranch && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedBranch(null)}
          />
          {/* Panel */}
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-card shadow-2xl flex flex-col border-l border-divider">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-divider bg-gradient-to-r from-primary/5 to-transparent">
              <div>
                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Branch Details</p>
                <h2 className="text-lg font-black text-primary">{selectedBranch.name}</h2>
              </div>
              <button
                onClick={() => setSelectedBranch(null)}
                className="p-2 rounded-xl hover:bg-surface text-text-secondary hover:text-primary transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">

              {/* Status badges */}
              <div className="flex items-center flex-wrap gap-2">
                <Badge variant={selectedBranch.isActive ? 'success' : 'error'}>
                  {selectedBranch.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <Badge variant={selectedBranch.branchType === 'WAREHOUSE' ? 'info' : 'default'}>
                  {selectedBranch.branchType === 'WAREHOUSE' ? 'Warehouse' : 'Shop'}
                </Badge>
              </div>

              {/* Info grid */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-surface border border-divider/50">
                  <MapPinIcon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-wider">Location</p>
                    <p className="text-sm font-bold text-primary mt-0.5">{selectedBranch.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-surface border border-divider/50">
                  <UserIcon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-wider">Manager</p>
                    <p className="text-sm font-bold text-primary mt-0.5">{selectedBranch.managerName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-surface border border-divider/50">
                  <PhoneIcon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-wider">Contact</p>
                    <p className="text-sm font-bold text-primary mt-0.5">{selectedBranch.contactNumber}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-surface border border-divider/50">
                  <CalendarDaysIcon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-wider">Created</p>
                    <p className="text-sm font-bold text-primary mt-0.5">{formatDate(selectedBranch.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Type icon */}
              <div className="rounded-2xl border border-divider/50 p-5 text-center bg-surface/30">
                {selectedBranch.branchType === 'WAREHOUSE' ? (
                  <>
                    <BuildingOfficeIcon className="h-12 w-12 text-info/60 mx-auto mb-2" />
                    <p className="text-sm font-bold text-info">Distribution Warehouse</p>
                    <p className="text-xs text-text-secondary mt-1">This location stores and fulfils stock transfers to retail shops.</p>
                  </>
                ) : (
                  <>
                    <BuildingStorefrontIcon className="h-12 w-12 text-success/60 mx-auto mb-2" />
                    <p className="text-sm font-bold text-success">Retail Shop</p>
                    <p className="text-xs text-text-secondary mt-1">This location handles point-of-sale transactions and customer service.</p>
                  </>
                )}
              </div>
            </div>

            {/* Footer action */}
            <div className="px-6 py-4 border-t border-divider bg-surface/30 flex gap-3">
              <Button
                variant="outline"
                className="flex-1 text-error border-error/20 hover:bg-error/5"
                onClick={() => { handleDelete(selectedBranch.id); setSelectedBranch(null); }}
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete
              </Button>
              <Button className="flex-1" onClick={() => setSelectedBranch(null)}>
                Close
              </Button>
            </div>
          </div>
        </>
      )}
      {/* ─── Branch Stock Slide-over ─────────────────────────────────────   */}
      {isStockOpen && stockBranch && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => { setIsStockOpen(false); setStockBranch(null); setStock([]); setStockSearch(''); }}
          />
          <div className="fixed inset-y-0 right-0 z-[70] w-full max-w-2xl bg-card shadow-2xl flex flex-col border-l border-divider animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-divider bg-gradient-to-r from-success/5 to-transparent">
              <div>
                <div className="flex items-center gap-2">
                  <ArchiveBoxIcon className="h-4 w-4 text-success" />
                  <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Branch Inventory</p>
                </div>
                <h2 className="text-xl font-black text-primary">{stockBranch.name}</h2>
              </div>
              <button
                onClick={() => { setIsStockOpen(false); setStockBranch(null); setStock([]); setStockSearch(''); }}
                className="p-2 rounded-xl hover:bg-surface text-text-secondary hover:text-primary transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* toolbar */}
            <div className="p-4 border-b border-divider bg-surface/30">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <Input
                  placeholder="Search products in this branch..."
                  value={stockSearch}
                  onChange={(e) => setStockSearch(e.target.value)}
                  className="!pl-10 h-9 text-sm"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {loadingStock ? (
                <div className="p-12 text-center text-text-secondary space-y-4">
                  <div className="w-10 h-10 border-4 border-success/20 border-t-success rounded-full animate-spin mx-auto" />
                  <p className="text-sm font-bold animate-pulse">Fetching inventory...</p>
                </div>
              ) : stock.length > 0 ? (
                <div className="divide-y divide-divider">
                  {stock
                    .filter(item =>
                      item.productName.toLowerCase().includes(stockSearch.toLowerCase()) ||
                      item.productSku.toLowerCase().includes(stockSearch.toLowerCase())
                    )
                    .map((item) => (
                      <div key={item.productId} className="p-4 hover:bg-surface/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 flex-shrink-0 bg-success/10 rounded-xl flex items-center justify-center">
                              <ShoppingBagIcon className="h-5 w-5 text-success/60" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-primary">{item.productName}</p>
                              <p className="text-[10px] text-text-secondary font-mono tracking-wider">{item.productSku}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className={`text-sm font-black ${item.quantityOnHand <= item.minimumStockThreshold ? 'text-error' : 'text-primary'}`}>
                                {item.quantityOnHand}
                              </span>
                              <span className="text-[10px] text-text-secondary font-bold uppercase">In Stock</span>
                            </div>
                            <p className="text-[10px] text-text-secondary mt-0.5">{formatCurrency(item.price)} / unit</p>
                          </div>
                        </div>
                        {item.quantityOnHand <= item.minimumStockThreshold && (
                          <div className="mt-2 text-[10px] bg-error/10 text-error font-black px-2 py-1 rounded inline-block uppercase tracking-widest">
                            Low Stock Alert
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <div className="p-12 text-center text-text-secondary">
                  <XCircleIcon className="h-12 w-12 mx-auto mb-4 opacity-10" />
                  <p className="font-bold">No products found at this location</p>
                  <p className="text-sm opacity-60">This branch might not have any stock initialized yet.</p>
                </div>
              )}
            </div>

            {/* Summary Footer */}
            {!loadingStock && stock.length > 0 && (
              <div className="p-6 border-t border-divider bg-card">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl bg-surface border border-divider">
                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Unique Products</p>
                    <p className="text-lg font-black text-primary">{stock.length}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-success/5 border border-success/10">
                    <p className="text-[10px] font-black text-success uppercase tracking-widest">Branch Value</p>
                    <p className="text-lg font-black text-success">
                      {formatCurrency(calculateBranchValue())}
                    </p>
                  </div>
                </div>
                <Button className="w-full mt-4" onClick={() => { setIsStockOpen(false); setStockBranch(null); setStock([]); }}>
                  Close Inventory View
                </Button>
              </div>
            )}
            {!loadingStock && stock.length === 0 && (
              <div className="p-6 border-t border-divider bg-card">
                <Button className="w-full" onClick={() => { setIsStockOpen(false); setStockBranch(null); setStock([]); }}>
                  Close
                </Button>
              </div>
            )}
          </div>
        </>
      )}
      </Layout>
  );
}

