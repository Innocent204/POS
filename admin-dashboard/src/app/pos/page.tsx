'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/layout/layout';
import AuthGuard from '@/components/auth/auth-guard';
import { formatCurrency } from '@/lib/utils';
import {
  ShoppingCartIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  CheckIcon,
  BuildingOfficeIcon,
  CreditCardIcon,
  BanknotesIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import { ProductResponse, BranchResponse } from '@/types';
import { PRODUCT_CATEGORIES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toaster';

interface CartItem extends ProductResponse {
  quantity: number;
}

export default function POSPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<string[]>(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [stockByProduct, setStockByProduct] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [activeTab, setActiveTab] = useState<'sale' | 'products'>('sale');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsRes, branchesRes] = await Promise.all([
          api.products.getAll({ size: 100 }),
          api.branches.getAll()
        ]);

        if (productsRes.success) {
          const prods = productsRes.data.content || [];
          setProducts(prods);

          // Use standard categories
          setCategories(['All', ...PRODUCT_CATEGORIES]);
        }

        if (branchesRes.success) {
          const brs = branchesRes.data || [];
          setBranches(brs);
          if (brs.length > 0) setSelectedBranch(brs[0].id);
        }
      } catch (err: unknown) {
        console.error('POS fetch error:', err);
        const errorMsg = err instanceof Error ? err.message : 'Failed to load POS data';
        toast({
          title: 'Error',
          description: errorMsg,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedBranch) return;

    const fetchStock = async () => {
      try {
        const response = await api.stock.getByBranch(selectedBranch);
        if (response.success && response.data) {
          const stockMap: Record<string, number> = {};
          response.data.forEach(item => {
            stockMap[item.productId] = item.quantityOnHand;
          });
          setStockByProduct(stockMap);
        }
      } catch (err) {
        console.error('Failed to fetch stock for branch:', err);
      }
    };

    fetchStock();
  }, [selectedBranch]);

  const addToCart = (product: ProductResponse) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (!selectedBranch) {
      toast({
        title: "Branch Required",
        description: "Please select a branch before checkout.",
        variant: "destructive",
      });
      return;
    }

    try {
      setCheckingOut(true);
      const saleData = {
        branchId: selectedBranch,
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          unitPrice: item.sellingPrice
        })),
        totalAmount: total,
        paymentMethod: paymentMethod.toUpperCase()
      };

      const response = await api.sales.create(saleData);

      if (response.success) {
        toast({
          title: "Sale Successful",
          description: `Sale of ${formatCurrency(total)} recorded at ${branches.find(b => b.id === selectedBranch)?.name}.`,
        });
        setCart([]);
      } else {
        throw new Error(response.message || 'Failed to process sale');
      }
    } catch (err: unknown) {
      console.error('Checkout error:', err);
      const errorMsg = err instanceof Error ? err.message : 'An error occurred while processing sale.';
      toast({
        variant: "destructive",
        title: "Checkout Failed",
        description: errorMsg,
      });
    } finally {
      setCheckingOut(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || (product.category || 'Uncategorized') === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <AuthGuard>
      <Layout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-primary">Point of Sale</h1>
              <p className="text-sm text-text-secondary">Process sales and manage inventory</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-2 bg-surface p-2 px-4 rounded-xl border border-divider">
                <BuildingOfficeIcon className="h-5 w-5 text-text-secondary" />
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="bg-transparent border-none text-sm font-bold text-primary focus:ring-0 cursor-pointer max-w-[150px]"
                >
                  <option value="" disabled>Select Branch</option>
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
              </div>

              <div className="hidden sm:flex items-center space-x-4 bg-surface p-3 px-5 rounded-xl border border-divider">
                <div className="text-right">
                  <p className="text-[10px] text-text-secondary uppercase font-black tracking-wider">Cart Total</p>
                  <p className="text-xl font-black text-primary leading-tight">{formatCurrency(total)}</p>
                </div>
                <div className="relative">
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <ShoppingCartIcon className="h-5 w-5 text-primary" />
                  </div>
                  {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-surface">
                      {cart.length}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-divider">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('sale')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'sale'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <ShoppingCartIcon className="h-5 w-5" />
                  <span>New Sale</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'products'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <CubeIcon className="h-5 w-5" />
                  <span>Products</span>
                </div>
              </button>
            </nav>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {activeTab === 'sale' ? (
              <>
                <div className="lg:col-span-8 space-y-6">
                  <div className="flex flex-col gap-4">
                    <div className="relative w-full">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
                      <Input
                        placeholder="Search Products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="!pl-12 h-12 text-base"
                      />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
                      {categories.map(category => (
                        <Button
                          key={category}
                          variant={selectedCategory === category ? 'default' : 'secondary'}
                          onClick={() => setSelectedCategory(category)}
                          className="whitespace-nowrap rounded-full px-6"
                        >
                          {category}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="card p-4 h-48 animate-pulse bg-surface/50"></div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filteredProducts.map(product => (
                        <div
                          key={product.id}
                          className="card p-4 hover-lift cursor-pointer flex flex-col justify-between group"
                          onClick={() => addToCart(product)}
                        >
                          <div>
                            <div className="h-20 bg-surface rounded-lg flex items-center justify-center mb-3 group-hover:bg-primary/5 transition-colors">
                              <CubeIcon className="h-10 w-10 text-text-secondary group-hover:text-primary/40" />
                            </div>
                            <h3 className="font-bold text-primary text-sm line-clamp-1">{product.name}</h3>
                            <p className="text-[10px] uppercase font-bold text-text-secondary">{product.category}</p>
                          </div>
                          <div className="mt-4 flex flex-col gap-3">
                            <p className="text-lg font-black text-primary">{formatCurrency(product.sellingPrice)}</p>
                            <Button size="sm" className="w-full text-xs font-bold rounded-lg py-0 h-8 opacity-0 group-hover:opacity-100 transition-opacity">
                              Add to Cart
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="lg:col-span-4 mt-6 lg:mt-0" id="cart-section">
                  <div className="card h-full flex flex-col p-6 sticky top-24 lg:min-h-[600px]">
                    <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                      Cart Items
                    </h2>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-[300px]">
                      {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-text-secondary opacity-30 italic py-12">
                          <ShoppingCartIcon className="h-16 w-16 mb-4" />
                          <p>Your cart is empty</p>
                        </div>
                      ) : (
                        cart.map((item) => (
                          <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl bg-surface border border-divider group">
                            <div className="flex-1">
                              <p className="text-sm font-bold text-primary line-clamp-1">{item.name}</p>
                              <p className="text-xs font-bold text-text-secondary">{formatCurrency(item.sellingPrice)}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center bg-background rounded-lg border border-divider">
                                <button
                                  onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, -1); }}
                                  className="w-8 h-8 flex items-center justify-center text-primary font-bold hover:bg-surface rounded-l-lg"
                                > - </button>
                                <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                                <button
                                  onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, 1); }}
                                  className="w-8 h-8 flex items-center justify-center text-primary font-bold hover:bg-surface rounded-r-lg"
                                > + </button>
                              </div>
                              <button
                                onClick={(e) => { e.stopPropagation(); removeFromCart(item.id); }}
                                className="w-8 h-8 flex items-center justify-center text-error hover:bg-error/10 rounded-lg"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {cart.length > 0 && (
                      <div className="mt-6 space-y-4">
                        <div className="border-t border-divider pt-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-text-secondary">Subtotal</span>
                            <span className="font-bold text-primary">{formatCurrency(total)}</span>
                          </div>
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-lg font-bold text-primary">Total</span>
                            <span className="text-xl font-black text-primary">{formatCurrency(total)}</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setPaymentMethod('cash')}
                              className={`flex-1 flex items-center justify-center space-x-2 p-3 rounded-xl border-2 transition-colors ${paymentMethod === 'cash'
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-divider bg-surface text-text-secondary hover:border-primary/30'
                                }`}
                            >
                              <BanknotesIcon className="h-5 w-5" />
                              <span className="text-sm font-medium">Cash</span>
                            </button>
                            <button
                              onClick={() => setPaymentMethod('card')}
                              className={`flex-1 flex items-center justify-center space-x-2 p-3 rounded-xl border-2 transition-colors ${paymentMethod === 'card'
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-divider bg-surface text-text-secondary hover:border-primary/30'
                                }`}
                            >
                              <CreditCardIcon className="h-5 w-5" />
                              <span className="text-sm font-medium">Card</span>
                            </button>
                          </div>

                          <Button
                            onClick={handleCheckout}
                            disabled={checkingOut || !selectedBranch}
                            className="w-full"
                          >
                            {checkingOut ? 'Processing...' : 'Complete Sale'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="lg:col-span-12 space-y-6">
                  <div className="flex flex-col gap-4">
                    <div className="relative w-full">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
                      <Input
                        placeholder="Search Products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="!pl-12 h-12 text-base"
                      />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                      {categories.map(category => (
                        <Button
                          key={category}
                          variant={selectedCategory === category ? 'default' : 'secondary'}
                          onClick={() => setSelectedCategory(category)}
                          className="whitespace-nowrap rounded-full px-6"
                        >
                          {category}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="card p-4 h-48 animate-pulse bg-surface/50"></div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filteredProducts.map(product => (
                        <div key={product.id} className="card p-4 hover-lift">
                          <div className="flex items-start justify-between mb-3">
                            <div className="h-16 bg-surface rounded-lg flex items-center justify-center">
                              <CubeIcon className="h-8 w-8 text-text-secondary" />
                            </div>
                            <Badge variant={product.isActive ? 'success' : 'error'}>
                              {product.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <h3 className="font-bold text-primary text-sm mb-1">{product.name}</h3>
                          <p className="text-[10px] uppercase font-bold text-text-secondary mb-2">{product.category}</p>
                          <p className="text-xs text-text-secondary mb-3">SKU: {product.sku}</p>
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-lg font-black text-primary">{formatCurrency(product.sellingPrice)}</p>
                              <p className="text-xs text-text-secondary flex items-center gap-1">
                                Stock: <span className={`font-bold ${stockByProduct[product.id] > 0 ? 'text-success' : 'text-error'}`}>{stockByProduct[product.id] || 0}</span>
                              </p>
                            </div>
                            <Button size="sm" onClick={() => { setActiveTab('sale'); addToCart(product); }}>
                              Add to Sale
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {activeTab === 'sale' && cart.length > 0 && (
            <div className="lg:hidden fixed bottom-6 left-6 right-6 z-50 animate-in slide-in-from-bottom-10 duration-500">
              <div
                onClick={() => document.getElementById('cart-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-primary shadow-2xl shadow-primary/40 p-4 rounded-2xl flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center text-white">
                    <ShoppingCartIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/70 uppercase font-black">Ready for Checkout</p>
                    <p className="text-lg font-black text-white">{cart.length} Items • {formatCurrency(total)}</p>
                  </div>
                </div>
                <div className="bg-white/20 px-4 py-2 rounded-xl text-white font-black text-sm uppercase tracking-widest">
                  View Cart
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </AuthGuard>
  );
}
