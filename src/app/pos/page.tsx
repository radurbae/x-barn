'use client';

import { useState, useEffect } from 'react';
import { SidebarNav } from '@/components/sidebar-nav';
import { ProductCard } from '@/components/product-card';
import { CartSidebar } from '@/components/cart-sidebar';
import { CategoryFilter } from '@/components/category-filter';
import { CheckoutDialog } from '@/components/checkout-dialog';
import { Product, ProductCategory } from '@/lib/types';
import { useCartStore } from '@/stores/cart-store';
import { useDailySalesStore } from '@/stores/daily-sales-store';
import { supabase } from '@/lib/supabase';
import { Coffee, Menu, Search, ShoppingCart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';

// Demo products for when Supabase is not configured
const demoProducts: Product[] = [
  { id: '1', name: 'Espresso', price: 25000, category: 'Coffee', image_url: '/images/products/espresso.svg', description: 'Espresso shot kuat dan kaya rasa', is_available: true, created_at: '', updated_at: '' },
  { id: '2', name: 'Americano', price: 28000, category: 'Coffee', image_url: '/images/products/espresso.svg', description: 'Espresso dengan air panas', is_available: true, created_at: '', updated_at: '' },
  { id: '3', name: 'Latte', price: 35000, category: 'Coffee', image_url: '/images/products/latte.svg', description: 'Espresso dengan susu steamed', is_available: true, created_at: '', updated_at: '' },
  { id: '4', name: 'Cappuccino', price: 35000, category: 'Coffee', image_url: '/images/products/cappuccino.svg', description: 'Espresso, susu steamed, dan foam', is_available: true, created_at: '', updated_at: '' },
  { id: '5', name: 'Mocha', price: 38000, category: 'Coffee', image_url: '/images/products/latte.svg', description: 'Espresso dengan coklat dan susu steamed', is_available: true, created_at: '', updated_at: '' },
  { id: '6', name: 'Vanilla Latte', price: 38000, category: 'Coffee', image_url: '/images/products/latte.svg', description: 'Latte dengan sirup vanilla', is_available: true, created_at: '', updated_at: '' },
  { id: '7', name: 'Caramel Macchiato', price: 42000, category: 'Coffee', image_url: '/images/products/cappuccino.svg', description: 'Vanilla latte dengan saus caramel', is_available: true, created_at: '', updated_at: '' },
  { id: '8', name: 'Iced Latte', price: 38000, category: 'Iced', image_url: '/images/products/iced_latte.svg', description: 'Espresso dingin dengan susu dan es', is_available: true, created_at: '', updated_at: '' },
  { id: '9', name: 'Iced Americano', price: 30000, category: 'Iced', image_url: '/images/products/cold_brew.svg', description: 'Espresso dengan air dingin dan es', is_available: true, created_at: '', updated_at: '' },
  { id: '10', name: 'Cold Brew', price: 35000, category: 'Iced', image_url: '/images/products/cold_brew.svg', description: 'Kopi seduh dingin 12 jam', is_available: true, created_at: '', updated_at: '' },
  { id: '11', name: 'Matcha Latte', price: 38000, category: 'Non-Coffee', image_url: '/images/products/matcha_latte.svg', description: 'Teh hijau Jepang dengan susu steamed', is_available: true, created_at: '', updated_at: '' },
  { id: '12', name: 'Hot Chocolate', price: 32000, category: 'Non-Coffee', image_url: '/images/products/matcha_latte.svg', description: 'Coklat kaya dengan susu steamed', is_available: true, created_at: '', updated_at: '' },
  { id: '13', name: 'Butter Croissant', price: 28000, category: 'Food', image_url: '/images/products/croissant.svg', description: 'Croissant renyah dengan mentega', is_available: true, created_at: '', updated_at: '' },
  { id: '14', name: 'Banana Bread', price: 32000, category: 'Food', image_url: '/images/products/croissant.svg', description: 'Roti pisang buatan sendiri', is_available: true, created_at: '', updated_at: '' },
  { id: '15', name: 'Chocolate Muffin', price: 28000, category: 'Food', image_url: '/images/products/croissant.svg', description: 'Muffin coklat chip lembut', is_available: true, created_at: '', updated_at: '' },
];

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { getTotal } = useCartStore();
  const { addSale } = useDailySalesStore();
  const { t, language } = useTranslation();

  // Get locale based on language
  const dateLocale = language === 'id' ? 'id-ID' : 'en-US';

  // Fetch products
  useEffect(() => {
    async function fetchProducts() {
      setError('');
      // If supabase is not configured, use demo products
      if (!supabase) {
        setProducts(demoProducts);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_available', true)
          .order('category')
          .order('name');

        if (error) {
          console.error('Error fetching products:', error);
          setProducts([]);
          setError(t('loadError'));
        } else {
          setProducts(data || []);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setProducts([]);
        setError(t('loadError'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Handle checkout completion
  const handleCheckoutComplete = async () => {
    const total = getTotal();

    // Track the sale in daily sales store (for sidebar display)
    // Note: Order creation is already handled by processTransaction in checkout-dialog
    addSale(total);
  };

  return (
    <div className="relative flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar Navigation */}
      <SidebarNav
        onClose={() => setIsSidebarOpen(false)}
        className={`fixed left-0 top-0 z-40 h-screen transform transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      />

      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-900/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Main Content Area */}
      <main className="flex flex-1 flex-col lg:ml-64 lg:mr-80">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-slate-900/80">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Open menu"
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('cashier')}</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {new Date().toLocaleDateString(dateLocale, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-md">
                <label className="sr-only" htmlFor="product-search">
                  {t('searchProducts')}
                </label>
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <Input
                  id="product-search"
                  type="text"
                  placeholder={t('searchProducts')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 pl-10 text-slate-900 dark:text-white placeholder:text-slate-500 focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                aria-label="Open cart"
                onClick={() => setIsCartOpen(true)}
                className="w-full border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200 sm:w-auto lg:hidden"
              >
                <ShoppingCart className="h-4 w-4" />
                {t('order')}
              </Button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="mt-4">
            <CategoryFilter
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>
        </header>

        {/* Product Grid */}
        <div className="flex-1 overflow-auto p-6">
          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
              {error}
            </div>
          )}
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500/20 border-t-amber-500" />
                <p className="text-slate-400">{t('loadingProducts')}</p>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <Coffee className="mb-4 h-16 w-16 text-slate-300 dark:text-slate-600" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">{t('noProductsFound')}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {t('tryAdjusting')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Cart Sidebar */}
      <CartSidebar
        onCheckout={() => setIsCheckoutOpen(true)}
        onClose={() => setIsCartOpen(false)}
        className={`fixed right-0 top-0 z-40 h-screen transform transition-transform duration-300 lg:translate-x-0 ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      />

      {isCartOpen && (
        <button
          type="button"
          aria-label="Close cart"
          onClick={() => setIsCartOpen(false)}
          className="fixed inset-0 z-30 bg-slate-900/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Checkout Dialog */}
      <CheckoutDialog
        open={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        onComplete={handleCheckoutComplete}
      />
    </div>
  );
}
