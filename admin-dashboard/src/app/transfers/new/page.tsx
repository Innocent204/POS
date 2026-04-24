'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/layout/layout';
import {
  ArrowDownIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  MinusIcon,
  CheckIcon,
  ArrowsRightLeftIcon,
  BuildingOfficeIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';
import { formatDate, getErrorMessage } from '@/lib/utils';
import { api } from '@/lib/api';
import { BranchResponse, ProductResponse, StockLevelResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toaster';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CartItem {
  product: ProductResponse;
  quantity: number;
}

export default function NewTransferPage() {
  const { toast } = useToast();

  // Form state
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState('');
  const [sourceBranch, setSourceBranch] = useState<BranchResponse | null>(null);
  const [destinationBranch, setDestinationBranch] = useState<BranchResponse | null>(null);
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [sourceStock, setSourceStock] = useState<StockLevelResponse[]>([]);
  const [fetchingStock, setFetchingStock] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (sourceBranch) {
      setFetchingStock(true);
      api.stock.getByBranch(sourceBranch.id)
        .then(res => {
          if (res.success && res.data) {
            setSourceStock(res.data);
          } else {
            setSourceStock([]);
          }
        })
        .catch(err => {
          console.error('Fetch source stock error:', err);
          setSourceStock([]);
        })
        .finally(() => {
          setFetchingStock(false);
        });
    } else {
      setSourceStock([]);
    }
  }, [sourceBranch]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [branchesRes, productsRes] = await Promise.all([
        api.branches.getAll(),
        api.products.getAll({ size: 100 }),
      ]);

      setBranches(branchesRes.data?.filter((b) => b.isActive) || []);
      setProducts(productsRes.data?.content?.filter((p) => p.isActive) || []);
    } catch (err) {
      console.error('Load data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: ProductResponse) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { product, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const stock = sourceStock.find(s => s.productId === productId);
    const maxQty = stock ? stock.quantityOnHand : 0;
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.product.id === productId
          ? { ...item, quantity: Math.min(Math.max(0, quantity), maxQty) }
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const handleSubmit = async () => {
    if (!sourceBranch || !destinationBranch) {
      toast({
        title: 'Error',
        description: 'Please select source and destination branches',
        variant: 'destructive',
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one product',
        variant: 'destructive',
      });
      return;
    }

    if (cart.some(item => item.quantity <= 0)) {
      toast({
        title: 'Error',
        description: 'All transfer items must have a quantity greater than 0',
        variant: 'destructive',
      });
      return;
    }

    // Validate stock availability before creating transfer
    const insufficientStock = cart.filter(item => {
      const stock = sourceStock.find(s => s.productId === item.product.id);
      return !stock || stock.quantityOnHand < item.quantity;
    });

    if (insufficientStock.length > 0) {
      const items = insufficientStock.map(i => `${i.product.name} (requested: ${i.quantity}, available: ${sourceStock.find(s => s.productId === i.product.id)?.quantityOnHand || 0})`).join(', ');
      toast({
        title: 'Insufficient Stock',
        description: `Cannot transfer: ${items}`,
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const transferItems = cart.map(item => ({
        productName: item.product.name,
        quantityRequested: item.quantity,
      }));

      const response = await api.transfers.create({
        sourceBranchId: sourceBranch.id,
        destinationBranchId: destinationBranch.id,
        notes: notes.trim() || undefined,
        items: transferItems
      });

      if (response.success) {
        // Automatically deduct stock from source branch using the same quantities as the transfer
        const stockAdjustments = await Promise.allSettled(
          cart.map(item => 
            api.stock.adjust({
              branchId: sourceBranch.id,
              productId: item.product.id,
              adjustmentType: 'DECREASE',
              quantity: item.quantity,
              reason: 'Transfer initiated to ' + destinationBranch.name,
            })
          )
        );

        // Check if any stock adjustments failed
        const failedAdjustments = stockAdjustments.filter(result => result.status === 'rejected');
        if (failedAdjustments.length > 0) {
          console.error('Some stock adjustments failed:', failedAdjustments);
          toast({
            title: 'Transfer Created with Warnings',
            description: `Transfer created, but ${failedAdjustments.length} stock adjustment(s) failed. Please verify stock levels manually.`,
            variant: 'destructive',
          });
        } else {
          toast({ title: 'Success', description: 'Transfer created and stock deducted.' });
        }

        setSourceBranch(null);
        setDestinationBranch(null);
        setNotes('');
        setCart([]);
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      console.error('Create transfer error:', err);
      toast({ title: 'Error', description: getErrorMessage(err), variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableProducts: ProductResponse[] = sourceBranch ? sourceStock
    .filter(s => s.quantityOnHand > 0)
    .map(s => ({
      id: s.productId,
      name: s.productName,
      sku: s.productSku,
      category: s.category,
      price: s.price || 0,
      minimumStockThreshold: s.minimumStockThreshold || 0,
      isActive: true,
      createdAt: s.updatedAt || new Date().toISOString()
    })) : [];

  const filteredProducts = availableProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedProductIds = cart.map(item => item.product.id);

  return (
          <Layout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-primary">New Transfer</h1>
              <p className="mt-1 text-sm text-text-secondary">
                Move inventory between branches
              </p>
            </div>
          </div>

          {/* Branch Selection */}
          <div className="card p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Source Branch */}
              <div className="space-y-2">
                <Label htmlFor="source_branch">Source Branch</Label>
                <Select
                  value={sourceBranch?.id || ''}
                  onValueChange={(value: string) => {
                    const branch = branches.find(b => b.id === value) || null;
                    setSourceBranch(branch);
                    // Remove from destination if selected as source
                    if (destinationBranch?.id === value) {
                      setDestinationBranch(null);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        <div className="flex items-center">
                          <BuildingStorefrontIcon className="h-4 w-4 mr-2" />
                          {branch.name}
                          <span className="text-info">{branch.branchType === 'WAREHOUSE' ? '(Warehouse)' : '(Shop)'}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-center">
                <ArrowsRightLeftIcon className="h-6 w-6 text-primary" />
              </div>

              {/* Destination Branch */}
              <div className="space-y-2">
                <Label htmlFor="destination_branch">Destination Branch</Label>
                <Select
                  value={destinationBranch?.id || ''}
                  onValueChange={(value: string) => {
                    const branch = branches.find(b => b.id === value) || null;
                    setDestinationBranch(branch);
                    // Remove from source if selected as destination
                    if (sourceBranch?.id === value) {
                      setSourceBranch(null);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        <div className="flex items-center">
                          <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                          {branch.name}
                          <span className="text-info">{branch.branchType === 'WAREHOUSE' ? '(Warehouse)' : '(Shop)'}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-primary">Products</h3>
              <Button 
                onClick={() => setIsProductPickerOpen(true)}
                disabled={!sourceBranch}
                title={!sourceBranch ? "Select a source branch first" : "Add Products"}
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Products
              </Button>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-12 text-text-secondary">
                <BuildingOfficeIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No products added yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-center justify-between p-4 border border-divider rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <BuildingOfficeIcon className="h-6 w-6 text-primary/40" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-primary">{item.product.name}</h4>
                          <p className="text-xs text-text-secondary">{item.product.sku}</p>
                        </div>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                            if (item.quantity > 1) {
                              updateQuantity(item.product.id, item.quantity - 1);
                            } else {
                              removeFromCart(item.product.id);
                            }
                        }}
                        className="h-8 w-8 p-0 text-error hover:bg-error/10"
                      >
                        <MinusIcon className="h-4 w-4" />
                      </Button>

                      <div className="w-16">
                        <Input
                          type="number"
                          value={item.quantity || ''}
                          max={sourceStock.find(s => s.productId === item.product.id)?.quantityOnHand || 0}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '') {
                              updateQuantity(item.product.id, 0);
                            } else {
                              const num = parseInt(val, 10);
                              if (!isNaN(num)) {
                                updateQuantity(item.product.id, num);
                              }
                            }
                          }}
                          className="h-8 text-center font-bold px-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          min="0"
                        />
                      </div>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="h-8 w-8 p-0 text-success hover:bg-success/10"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.product.id)}
                        className="h-8 w-8 p-0 text-error hover:bg-error/10"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="card p-6">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes..."
                className="min-h-[80px]"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !sourceBranch || !destinationBranch || cart.length === 0}
              className="min-w-[200px]"
            >
              {isSubmitting ? 'Creating Transfer...' : 'Create Transfer'}
            </Button>
          </div>

          {/* Product Picker Dialog */}
          <Dialog open={isProductPickerOpen} onOpenChange={setIsProductPickerOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>Search Products by Name</DialogTitle>
                <DialogDescription>
                  Find products from {sourceBranch?.name} stock by name or SKU
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
                  <Input
                    placeholder="Enter product name or SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="!pl-12"
                  />
                </div>

                {/* Product List */}
                <div className="max-h-[400px] overflow-y-auto space-y-2">
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-4 border border-divider rounded-lg animate-pulse">
                        <div className="flex-1">
                          <div className="h-4 bg-surface rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-surface rounded w-1/2"></div>
                        </div>
                        <div className="h-8 bg-surface rounded w-8"></div>
                      </div>
                    ))
                  ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => {
                      const isSelected = selectedProductIds.includes(product.id);
                      return (
                        <div
                          key={product.id}
                          className={`flex items-center justify-between p-4 border border-divider rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-primary/10 border-primary/30' : 'hover:bg-surface'
                            }`}
                          onClick={() => !isSelected && addToCart(product)}
                        >
                          <div className="flex-1">
                            <h4 className="text-sm font-bold text-primary">{product.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs text-text-secondary">{product.sku}</p>
                                <span className="text-xs text-divider">•</span>
                                <p className="text-xs font-semibold text-info">
                                    {sourceStock.find(s => s.productId === product.id)?.quantityOnHand || 0} in stock
                                </p>
                            </div>
                            {product.category && <p className="text-xs text-text-secondary mt-1">{product.category}</p>}
                          </div>
                          {isSelected ? (
                            <CheckIcon className="h-5 w-5 text-success" />
                          ) : (
                            <PlusIcon className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-text-secondary">
                      <p>No products found matching your search</p>
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Layout>
      );
}

