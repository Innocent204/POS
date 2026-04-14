'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/layout/layout';
import { CubeIcon, PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
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

const TAURA_CATALOG: { name: string; price: number }[] = [
  { name: 'Cables USB to Classic', price: 0.55 },
  { name: 'Cables USB to C', price: 0.55 },
  { name: 'Cables C to C Black 25W', price: 1.10 },
  { name: 'Cables C to C Black 45W', price: 2.75 },
  { name: 'Cables C to Lightning 25W', price: 2.75 },
  { name: 'Cables USB to Lightning', price: 1.10 },
  { name: 'Car Charger USB & C', price: 5.50 },
  { name: 'Car Charger USB', price: 5.50 },
  { name: 'Earpods', price: 5.50 },
  { name: 'Gift Box', price: 19.25 },
  { name: '20 Watt Type C Taura Adapter (3 pin)', price: 5.50 },
  { name: '20 Watt Type C Taura Adapter (2 pin)', price: 2.75 },
  { name: '20 Watt USB Taura Adapter (3 pin)', price: 2.75 },
  { name: '20 Watt USB Taura Adapter (2 pin)', price: 2.75 },
  { name: '45 Watt Type C Taura Adapter (3 pin)', price: 7.15 },
  { name: '45 Watt Type C Taura Adapter (2 pin)', price: 7.15 },
  { name: '25 Watt Type C Taura Adapter (3 pin)', price: 4.95 },
  // { name: '25 Watt Type C Taura Adapter (2 pin)', price: 4.95 },
  { name: 'PB 5000mAh Battery Pack', price: 4.25 },
  { name: 'PB 10000mAh Battery Pack', price: 8.50 },
  { name: 'PB 10000mAh USB Black', price: 8.50 },
  { name: 'PB 10000mAh White with Gold', price: 12.75 },
  { name: 'PB 20000mAh Black Powerbank', price: 17.00 },
  { name: 'Power Bank 40000mAh', price: 25.50 },
  { name: 'Power Bank 60000mAh', price: 55.25 },
  { name: 'Ring Lights', price: 12.75 },
  { name: 'Wireless Car Charger', price: 17.00 },
];

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
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [originalStockQty, setOriginalStockQty] = useState(0);
  const [stockExistsForBranch, setStockExistsForBranch] = useState(false);
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [selectedFilterBranch, setSelectedFilterBranch] = useState<string>('all');
  const [allBranchStock, setAllBranchStock] = useState<ProductResponse[]>([]);
  const [filteringByBranch, setFilteringByBranch] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    price: 0,
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
      setError(null);

      if (selectedFilterBranch === 'all') {
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
      } else {
        // Handle branch-specific paged filtering locally from allBranchStock
        const filtered = allBranchStock.filter(p =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        setTotalProducts(filtered.length);
        setTotalPages(Math.ceil(filtered.length / pageSize) || 1);

        // Client-side pagination
        const start = currentPage * pageSize;
        const end = start + pageSize;
        setProducts(filtered.slice(start, end));
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
    if (selectedFilterBranch === 'all') {
      setAllBranchStock([]);
      fetchProducts();
      return;
    }

    const loadBranchProducts = async () => {
      try {
        setFilteringByBranch(true);
        const res = await api.stock.getByBranch(selectedFilterBranch);
        if (res.success && res.data) {
          const mappedProducts = res.data.map((item: any) => ({
            id: item.productId,
            name: item.productName,
            sku: item.productSku,
            category: item.category,
            price: Number(item.price ?? item.unitPrice ?? item.sellingPrice ?? item.productPrice ?? 0),
            minimumStockThreshold: item.minimumStockThreshold,
            isActive: (item as any).isActive ?? true,
            unitOfMeasure: 'pcs',
            createdAt: item.updatedAt
          })) as ProductResponse[];

          setAllBranchStock(mappedProducts);
          setCurrentPage(0); // Reset to first page
          // fetchProducts will be triggered by the state updates if we include them in the dependency array
        }
      } catch (err) {
        console.error('Load branch stock error:', err);
        setAllBranchStock([]);
      } finally {
        setFilteringByBranch(false);
      }
    };
    loadBranchProducts();
  }, [selectedFilterBranch]);

  // Load branches on mount for the filter bar
  useEffect(() => {
    fetchBranches();
  }, []);

  // Combined fetch trigger
  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm, allBranchStock]);

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

      // Check for duplicate product name in the selected branch (case-insensitive)
      if (formData.branchId) {
        const branchStockCheck = await api.stock.getByBranch(formData.branchId);
        if (branchStockCheck.success && branchStockCheck.data) {
          const existsInBranch = branchStockCheck.data.some(
            (item: any) => (item.productName || '').toLowerCase() === formData.name.toLowerCase()
          );
          if (existsInBranch) {
            const branch = branches.find(b => b.id === formData.branchId);
            toast({
              title: 'Product Already Added',
              description: `"${formData.name}" already exists in ${branch?.name || 'this branch'}.`,
              variant: 'destructive',
            });
            setIsSubmitting(false);
            return;
          }
        }
      }

      const productData = {
        name: formData.name,
        sku: formData.sku,
        category: formData.category,
        price: formData.price,
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
      toast({
        title: 'Error',
        description: getErrorMessage(err),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = async (product: ProductResponse) => {
    try {
      setLoading(true);

      // Fetch full product details to ensure we have everything and check if ID is valid
      const response = await api.products.getById(product.id);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Product not found on server');
      }

      const fullProduct = response.data;
      setEditingProduct(fullProduct.id);

      // Ensure branches are loaded for the dropdown
      if (branches.length === 0) {
        fetchBranches();
      }

      setFormData(prev => ({
        ...prev,
        name: fullProduct.name,
        sku: fullProduct.sku,
        category: fullProduct.category || '',
        price: fullProduct.price,
        unitOfMeasure: fullProduct.unitOfMeasure || 'pcs',
        minimumStockThreshold: fullProduct.minimumStockThreshold,
        description: fullProduct.description || '',
        isActive: fullProduct.isActive,
        branchId: '',
        initialQuantity: 0
      }));

      // Fetch current stock info to pre-populate
      setOriginalStockQty(0);
      setStockExistsForBranch(false);

      const stockRes = await api.stock.getByProduct(fullProduct.id);
      if (stockRes.success && stockRes.data && stockRes.data.length > 0) {
        const primaryStock = stockRes.data[0];
        setFormData(prev => ({
          ...prev,
          branchId: primaryStock.branchId,
          initialQuantity: primaryStock.quantityOnHand
        }));
        setOriginalStockQty(primaryStock.quantityOnHand);
        setStockExistsForBranch(true);
      }

      setIsEditOpen(true);
    } catch (err: any) {
      console.error('Error opening edit dialog:', err);

      const is404 = err.response?.status === 404 || getErrorMessage(err).includes('404');

      if (is404) {
        toast({
          title: 'Orphaned Record Detected',
          description: 'This product record no longer exists in the system. Removing orphaned stock from view.',
          variant: 'destructive',
        });

        // Remove the orphaned product from the current lists
        setAllBranchStock(prev => prev.filter(p => p.id !== product.id));
        setProducts(prev => prev.filter(p => p.id !== product.id));
      } else {
        toast({
          title: 'Error',
          description: getErrorMessage(err),
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      setIsSubmitting(true);
      const productData = {
        name: formData.name,
        category: formData.category,
        price: formData.price,
        unitOfMeasure: formData.unitOfMeasure,
        minimumStockThreshold: formData.minimumStockThreshold,
        description: formData.description,
        isActive: formData.isActive
      };

      const response = await api.products.update(editingProduct, productData);
      if (response.success) {
        // Update stock: use adjust if stock already exists, initialize if new
        if (formData.branchId && formData.initialQuantity >= 0) {
          if (stockExistsForBranch) {
            const delta = formData.initialQuantity - originalStockQty;
            if (delta !== 0) {
              await api.stock.adjust({
                productId: editingProduct,
                branchId: formData.branchId,
                adjustmentType: delta > 0 ? 'INCREASE' : 'DECREASE',
                quantity: Math.abs(delta),
                reason: 'Manual stock update via product edit'
              });
            }
          } else if (formData.initialQuantity > 0) {
            await api.stock.initialize({
              productId: editingProduct,
              branchId: formData.branchId,
              initialQuantity: formData.initialQuantity
            });
          }
        }

        toast({ title: 'Success', description: 'Product updated successfully' });
        setIsEditOpen(false);
        setEditingProduct(null);
        fetchProducts();
        resetForm();
      } else {
        throw new Error(response.message || 'Failed to update product');
      }
    } catch (err: unknown) {
      console.error('Update product error:', err);
      toast({ title: 'Error', description: getErrorMessage(err), variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      category: '',
      price: 0,
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
      toast({
        title: 'Error',
        description: getErrorMessage(err),
        variant: 'destructive',
      });
    }
  };

  // We use the products state directly as it's already filtered/paged by fetchProducts
  const displayedProducts = products;

  return (
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
                        <h3 className="text-sm font-semibold text-primary mb-3">Select from Taura Catalog</h3>
                        <Select
                          value=""
                          onValueChange={(value) => {
                            const item = TAURA_CATALOG.find(p => p.name === value);
                            if (item) {
                              setFormData(prev => ({ ...prev, name: item.name, price: item.price }));
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a product to auto-fill name & price..." />
                          </SelectTrigger>
                          <SelectContent>
                            {TAURA_CATALOG.map((item) => (
                              <SelectItem key={item.name} value={item.name}>
                                {item.name} — ${item.price.toFixed(2)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
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

                        <div className="space-y-2">
                          <Label htmlFor="price">Price ($)</Label>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            required
                            value={formData.price}
                            onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                            placeholder="0.00"
                          />
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

            {/* Edit Product Dialog */}
            <Dialog open={isEditOpen} onOpenChange={(open) => {
              setIsEditOpen(open);
              if (!open) {
                setEditingProduct(null);
                resetForm();
              }
            }}>
              <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>Edit Product</DialogTitle>
                  <DialogDescription>
                    Update the product details and pricing information.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleEditSubmit} className="space-y-6 py-4">
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div>
                      <h3 className="text-sm font-semibold text-primary mb-3">Basic Details</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-name">Product Name</Label>
                          <Input
                            id="edit-name"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. 50W Solar Panel"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-sku">SKU (Stock Keeping Unit)</Label>
                            <Input
                              id="edit-sku"
                              required
                              disabled
                              value={formData.sku}
                              placeholder="e.g. SP-50W-001"
                            />
                            <p className="text-[10px] text-text-secondary mt-1">SKU cannot be changed after creation.</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-category">Category</Label>
                            <Select
                              value={formData.category}
                              onValueChange={(value: string) => setFormData({ ...formData, category: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                              <SelectContent>
                                {PRODUCT_CATEGORIES.map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-price">Price ($)</Label>
                      <Input
                        id="edit-price"
                        type="number"
                        step="0.01"
                        required
                        value={formData.price}
                        onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-primary mb-3">Inventory Settings</h3>
                      <div className="space-y-2">
                        <Label htmlFor="edit-minimumStockThreshold">Minimum Stock Threshold</Label>
                        <Input
                          id="edit-minimumStockThreshold"
                          type="number"
                          required
                          value={formData.minimumStockThreshold}
                          onChange={e => setFormData({ ...formData, minimumStockThreshold: parseInt(e.target.value) || 0 })}
                          placeholder="5"
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-primary mb-3">Inventory & Stock Setup</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-branchId">Primary Branch</Label>
                          <Select
                            value={formData.branchId}
                            onValueChange={(value: string) => setFormData({ ...formData, branchId: value })}
                          >
                            <SelectTrigger id="edit-branchId">
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
                          <Label htmlFor="edit-initialQuantity">Current Stock / Initial Quantity</Label>
                          <Input
                            id="edit-initialQuantity"
                            type="number"
                            value={formData.initialQuantity}
                            onChange={e => setFormData({ ...formData, initialQuantity: parseInt(e.target.value) || 0 })}
                            placeholder="0"
                          />
                          <p className="text-[10px] text-text-secondary">Changing this will perform a stock initialization/reset for the selected branch.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Updating...' : 'Update Product'}
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
                    {displayedProducts.filter(p => p.isActive).length}
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
                    {new Set(displayedProducts.map(p => p.category)).size}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-text-secondary" />
                </div>
                <Input
                  type="text"
                  placeholder="Search by name, SKU or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="!pl-12 h-11"
                />
              </div>

              <div className="w-full lg:w-72">
                <Select
                  value={selectedFilterBranch}
                  onValueChange={setSelectedFilterBranch}
                  disabled={filteringByBranch}
                >
                  <SelectTrigger className="h-11">
                    <div className="flex items-center gap-2">
                      <BuildingOfficeIcon className="h-4 w-4 text-text-secondary" />
                      <SelectValue placeholder="All Branches" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    {branches.map(branch => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                  ) : displayedProducts.length > 0 ? (
                    displayedProducts.map((product) => (
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">{formatCurrency(product.price)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={product.isActive ? 'success' : 'error'}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" title="Edit" onClick={() => openEditDialog(product)}>
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
      );
}

