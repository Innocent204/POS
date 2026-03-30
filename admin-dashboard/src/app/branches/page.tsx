'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/layout/layout';
import AuthGuard from '@/components/auth/auth-guard';
import { BuildingOfficeIcon, PlusIcon, MagnifyingGlassIcon, TrashIcon, BuildingStorefrontIcon, CubeIcon, XMarkIcon, PhoneIcon, UserIcon, MapPinIcon, CalendarDaysIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { formatDate, getErrorMessage } from '@/lib/utils';
import { api } from '@/lib/api';
import { BranchResponse } from '@/types';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<BranchResponse | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    branchType: 'SHOP' as 'SHOP' | 'WAREHOUSE',
    location: '',
    managerName: '',
    contactNumber: '',
    isActive: true
  });

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const response = await api.branches.getAll();
      if (response.success) {
        setBranches(response.data);
      } else {
        setError(response.message || 'Failed to load branches');
      }
    } catch (err: unknown) {
      console.error('Fetch branches error:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const response = await api.branches.create(formData);
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
      const errorMsg = err instanceof Error ? err.message : 'Failed to create branch';
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
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
    <AuthGuard>
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
                      <Button variant="ghost" size="icon">
                        <BuildingOfficeIcon className="h-4 w-4 text-primary" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-divider flex justify-between items-center text-xs text-text-secondary">
                    <span>Created {formatDate(branch.createdAt)}</span>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-primary"
                      onClick={() => setSelectedBranch(branch)}
                    >View Details</Button>
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
      </Layout>

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
    </AuthGuard>
  );
}
