'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/layout/layout';
import AuthGuard from '@/components/auth/auth-guard';
import { CubeIcon, PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { formatCurrency, getErrorMessage } from '@/lib/utils';
import { api } from '@/lib/api';
import { ProductResponse, BranchResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PRODUCT_CATEGORIES } from '@/lib/constants';
import { ChartBarIcon, TagIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

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

export default function ProductsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    sellingPrice: 0,
    costPrice: 0,
    unitOfMeasure: 'pcs',
    minimumStockThreshold: 5,
    description: '',
    isActive: true,
    branchId: '',
    initialQuantity: 0
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.products.getAll({ 
        page: currentPage, 
        size: pageSize,
        search: searchTerm || undefined 
      });
      if (response.success && response.data) {
        setProducts(response.data.content || []);
        setTotalProducts(response.data.totalElements || 0);
        setTotalPages(response.data.totalPages || 1);
      } else {
        setError(response.message || 'Failed to load products');
      }
    } catch (err: unknown) {
      console.error('Fetch products error:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      setLoadingBranches(true);
      const response = await api.branches.getAll();
      if (response.success) {
        const activeBranches = response.data.filter((b: BranchResponse) => b.isActive) || [];
        setBranches(activeBranches);
        if (activeBranches.length > 0) {
          const warehouse = activeBranches.find((b: BranchResponse) => b.branchType === 'WAREHOUSE') || activeBranches[0];
          setFormData(prev => ({ ...prev, branchId: warehouse.id }));
        }
      }
    } catch (err: unknown) {
      console.error('Fetch branches error:', err);
    } finally {
      setLoadingBranches(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep === 1) {
      setCurrentStep(2);
      if (branches.length === 0) {
        await fetchBranches();
      }
      return;
    }

    try {
      setIsSubmitting(true);
      const productData = {
        name: formData.name,
        sku: formData.sku,
        category: formData.category,
        sellingPrice: formData.sellingPrice,
        costPrice: formData.costPrice,
        unitOfMeasure: formData.unitOfMeasure,
        minimumStockThreshold: formData.minimumStockThreshold,
        description: formData.description,
      };

      const response = await api.products.create(productData);

      if (response.success && response.data) {
        const newProduct = response.data;
        if (formData.branchId && formData.initialQuantity > 0) {
          await api.stock.initialize({
            productId: newProduct.id,
            branchId: formData.branchId,
            initialQuantity: formData.initialQuantity
          });
        }

        toast({
          title: 'Success',
          description: 'Product created successfully',
        });
        setIsAddOpen(false);
        fetchProducts();
        resetForm();
      } else {
        throw new Error(response.message || 'Failed to create product');
      }
    } catch (err: unknown) {
      console.error('Create product error:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to create product';
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      category: '',
      sellingPrice: 0,
      costPrice: 0,
      unitOfMeasure: 'pcs',
      minimumStockThreshold: 5,
      description: '',
      isActive: true,
      branchId: '',
      initialQuantity: 0
    });
    setCurrentStep(1);
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else {
      setIsAddOpen(false);
      resetForm();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const response = await api.products.delete(id);
      if (response.success) {
        toast({
          title: 'Deleted',
          description: 'Product removed successfully',
        });
        fetchProducts();
      } else {
        throw new Error(response.message || 'Failed to delete product');
      }
    } catch (err: unknown) {
      console.error('Delete product error:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete product';
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <AuthGuard>
      <Layout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-primary">Products</h1>
              <p className="mt-1 text-sm text-text-secondary">
                Manage your product catalog and inventory
              </p>
            </div>

            <Dialog open={isAddOpen} onOpenChange={(open) => {
              setIsAddOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                  <DialogDescription>
                    {currentStep === 1
                      ? 'Fill in the basic product details and pricing information.'
                      : 'Set up initial stock for the new product.'
                    }
                  </DialogDescription>
                </DialogHeader>

                <div className="flex items-center justify-center space-x-4 py-4">
                  <div className={`flex items-center ${currentStep >= 1 ? 'text-primary' : 'text-text-secondary'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${currentStep >= 1 ? 'bg-primary text-white' : 'bg-surface text-text-secondary'
                      }`}>
                      1
                    </div>
                    <span className="ml-2 text-sm font-medium">Product Details</span>
                  </div>
                  <div className={`w-12 h-0.5 ${currentStep >= 2 ? 'bg-primary' : 'bg-divider'}`} />
                  <div className={`flex items-center ${currentStep >= 2 ? 'text-primary' : 'text-text-secondary'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${currentStep >= 2 ? 'bg-primary text-white' : 'bg-surface text-text-secondary'
                      }`}>
                      2
                    </div>
                    <span className="ml-2 text-sm font-medium">Stock Setup</span>
                  </div>
                </div>

                <form onSubmit={handleCreate} className="space-y-4 py-4">
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-semibold text-primary mb-3">Basic Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2 col-span-2">
                            <Label htmlFor="name">Product Name</Label>
                            <Input
                              id="name"
                              required
                              value={formData.name}
                              onChange={e => setFormData({ ...formData, name: e.target.value })}
                              placeholder="e.g. USB-C Charger 65W"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="sku">SKU</Label>
                            <Input
                              id="sku"
                              required
                              value={formData.sku}
                              onChange={e => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                              placeholder="e.g. 0001"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select
                              value={formData.category}
                              onValueChange={(value) => setFormData({ ...formData, category: value })}
                            >
                              <SelectTrigger id="category">
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                              <SelectContent>
                                {PRODUCT_CATEGORIES.map((cat) => (
                                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="unitOfMeasure">Unit</Label>
                            <Input
                              id="unitOfMeasure"
                              required
                              value={formData.unitOfMeasure}
                              onChange={e => setFormData({ ...formData, unitOfMeasure: e.target.value })}
                              placeholder="e.g. pcs"
                            />
                          </div>
                        </div>
                        <div className="space-y-2 mt-4">
                          <Label htmlFor="description">Description (optional)</Label>
                          <Input
                            id="description"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Brief product description..."
                          />
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-primary mb-3">Pricing</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="costPrice">Cost Price ($)</Label>
                            <Input
                              id="costPrice"
                              type="number"
                              step="0.01"
                              required
                              value={formData.costPrice}
                              onChange={e => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                              placeholder="0.00"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="sellingPrice">Selling Price ($)</Label>
                            <Input
                              id="sellingPrice"
                              type="number"
                              step="0.01"
                              required
                              value={formData.sellingPrice}
                              onChange={e => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-primary mb-3">Inventory Settings</h3>
                        <div className="space-y-2">
                          <Label htmlFor="minimumStockThreshold">Minimum Stock Threshold</Label>
                          <Input
                            id="minimumStockThreshold"
                            type="number"
                            required
                            value={formData.minimumStockThreshold}
                            onChange={e => setFormData({ ...formData, minimumStockThreshold: parseInt(e.target.value) || 0 })}
                            placeholder="5"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-semibold text-primary mb-3">Stock Initialization</h3>
                        {loadingBranches ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          </div>
                        ) : branches.length === 0 ? (
                          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                            <p className="text-sm text-warning">
                              No branches available. Product will be created without stock.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="branchId">Branch</Label>
                              <Select
                                value={formData.branchId}
                                onValueChange={(value: string) => setFormData({ ...formData, branchId: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a branch" />
                                </SelectTrigger>
                                <SelectContent>
                                  {branches.map((branch) => (
                                    <SelectItem key={branch.id} value={branch.id}>
                                      {branch.name} {branch.branchType === 'WAREHOUSE' && '(Warehouse)'}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="initialQuantity">Initial Quantity</Label>
                              <Input
                                id="initialQuantity"
                                type="number"
                                value={formData.initialQuantity}
                                onChange={e => setFormData({ ...formData, initialQuantity: parseInt(e.target.value) || 0 })}
                                placeholder="0"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleBack}>
                      {currentStep === 2 ? 'Back' : 'Cancel'}
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting
                        ? 'Processing...'
                        : currentStep === 1
                          ? 'Next'
                          : 'Create Product'
                      }
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
                  <ChartBarIcon className="h-6 w-6 text-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">Total Products</p>
                  <p className="text-2xl font-black text-primary">{totalProducts}</p>
                </div>
              </div>
            </div>

            <div className="card p-6 border-l-4 border-success">
              <div className="flex items-center">
                <div className="p-3 bg-success/10 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-success" />
                </div>
                <div className="ml-4">
                  <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">Active Catalog</p>
                  <p className="text-2xl font-black text-success">
                    {filteredProducts.filter(p => p.isActive).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6 border-l-4 border-info">
              <div className="flex items-center">
                <div className="p-3 bg-info/10 rounded-lg">
                  <TagIcon className="h-6 w-6 text-info" />
                </div>
                <div className="ml-4">
                  <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">Categories</p>
                  <p className="text-2xl font-black text-info">
                    {new Set(filteredProducts.map(p => p.category)).size}
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
                placeholder="Search by name, SKU or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="!pl-12"
              />
            </div>
          </div>

          {error && (
            <div className="bg-error-light border border-error/20 rounded-lg p-4 flex items-center justify-between">
              <p className="text-error text-sm">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchProducts}>
                Retry
              </Button>
            </div>
          )}

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-divider">
                <thead className="bg-surface">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-divider">
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={5} className="px-6 py-4"><div className="h-10 bg-surface rounded w-full"></div></td>
                      </tr>
                    ))
                  ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-surface transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 bg-primary/5 rounded-lg flex items-center justify-center">
                              <CubeIcon className="h-6 w-6 text-primary/40" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-primary">{product.name}</div>
                              <div className="text-xs text-text-secondary">SKU: {product.sku}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{product.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">{formatCurrency(product.sellingPrice)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={product.isActive ? 'success' : 'error'}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" title="Edit">
                              <PencilIcon className="h-4 w-4 text-text-secondary" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Delete" onClick={() => handleDelete(product.id)}>
                              <TrashIcon className="h-4 w-4 text-error" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-text-secondary bg-surface/30">
                        <CubeIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>No products found matching your search</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="bg-surface border-t border-divider px-6 py-4 flex items-center justify-between">
                <div className="text-sm text-text-secondary">
                  Showing <span className="font-medium text-primary">{currentPage * pageSize + 1}</span> to{' '}
                  <span className="font-medium text-primary">
                    {Math.min((currentPage + 1) * pageSize, totalProducts)}
                  </span>{' '}
                  of <span className="font-medium text-primary">{totalProducts}</span> products
                </div>
                <div className="flex gap-2">
                  <button
                    className="btn-outline text-xs h-9 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
                  >
                    Previous
                  </button>
                  <button
                    className="btn-outline text-xs h-9 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                    disabled={currentPage >= totalPages - 1}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </AuthGuard>
  );
}
