'use client';

import { useState, useEffect } from 'react';
import { SidebarNav } from '@/components/sidebar-nav';
import { ProductCard } from '@/components/product-card';
import { CartSidebar } from '@/components/cart-sidebar';
import { CategoryFilter } from '@/components/category-filter';
import { CheckoutDialog } from '@/components/checkout-dialog';
import { Product, ProductCategory } from '@/lib/types';
import { useCartStore } from '@/stores/cart-store';
import { createOrder } from '@/app/actions/orders';
import { supabase } from '@/lib/supabase';
import { Coffee, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

// Demo products for when Supabase is not configured
const demoProducts: Product[] = [
  { id: '1', name: 'Espresso', price: 25000, category: 'Coffee', image_url: null, description: 'Espresso shot kuat dan kaya rasa', is_available: true, created_at: '', updated_at: '' },
  { id: '2', name: 'Americano', price: 28000, category: 'Coffee', image_url: null, description: 'Espresso dengan air panas', is_available: true, created_at: '', updated_at: '' },
  { id: '3', name: 'Latte', price: 35000, category: 'Coffee', image_url: null, description: 'Espresso dengan susu steamed', is_available: true, created_at: '', updated_at: '' },
  { id: '4', name: 'Cappuccino', price: 35000, category: 'Coffee', image_url: null, description: 'Espresso, susu steamed, dan foam', is_available: true, created_at: '', updated_at: '' },
  { id: '5', name: 'Mocha', price: 38000, category: 'Coffee', image_url: null, description: 'Espresso dengan coklat dan susu steamed', is_available: true, created_at: '', updated_at: '' },
  { id: '6', name: 'Vanilla Latte', price: 38000, category: 'Coffee', image_url: null, description: 'Latte dengan sirup vanilla', is_available: true, created_at: '', updated_at: '' },
  { id: '7', name: 'Caramel Macchiato', price: 42000, category: 'Coffee', image_url: null, description: 'Vanilla latte dengan saus caramel', is_available: true, created_at: '', updated_at: '' },
  { id: '8', name: 'Iced Latte', price: 38000, category: 'Iced', image_url: null, description: 'Espresso dingin dengan susu dan es', is_available: true, created_at: '', updated_at: '' },
  { id: '9', name: 'Iced Americano', price: 30000, category: 'Iced', image_url: null, description: 'Espresso dengan air dingin dan es', is_available: true, created_at: '', updated_at: '' },
  { id: '10', name: 'Cold Brew', price: 35000, category: 'Iced', image_url: null, description: 'Kopi seduh dingin 12 jam', is_available: true, created_at: '', updated_at: '' },
  { id: '11', name: 'Matcha Latte', price: 38000, category: 'Non-Coffee', image_url: null, description: 'Teh hijau Jepang dengan susu steamed', is_available: true, created_at: '', updated_at: '' },
  { id: '12', name: 'Hot Chocolate', price: 32000, category: 'Non-Coffee', image_url: null, description: 'Coklat kaya dengan susu steamed', is_available: true, created_at: '', updated_at: '' },
  { id: '13', name: 'Butter Croissant', price: 28000, category: 'Food', image_url: null, description: 'Croissant renyah dengan mentega', is_available: true, created_at: '', updated_at: '' },
  { id: '14', name: 'Banana Bread', price: 32000, category: 'Food', image_url: null, description: 'Roti pisang buatan sendiri', is_available: true, created_at: '', updated_at: '' },
  { id: '15', name: 'Chocolate Muffin', price: 28000, category: 'Food', image_url: null, description: 'Muffin coklat chip lembut', is_available: true, created_at: '', updated_at: '' },
];

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { items } = useCartStore();

  // Fetch products
  useEffect(() => {
    async function fetchProducts() {
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

        if (error || !data || data.length === 0) {
          // Use demo products if no data or error
          setProducts(demoProducts);
        } else {
          setProducts(data);
        }
      } catch {
        // Use demo products on error
        setProducts(demoProducts);
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
  const handleCheckoutComplete = async (paymentReceived: number) => {
    // Only call createOrder if Supabase is configured
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        await createOrder({
          items,
          paymentReceived,
        });
      } catch (error) {
        console.error('Error creating order:', error);
      }
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Navigation */}
      <SidebarNav />

      {/* Main Content Area */}
      <main className="ml-64 mr-80 flex flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-slate-900/80">
          <div className="flex items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Kasir</h1>
              <p className="text-sm text-slate-400">
                {new Date().toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                type="text"
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 border-slate-700 bg-slate-800 pl-10 text-white placeholder:text-slate-500 focus:border-amber-500 focus:ring-amber-500"
              />
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
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500/20 border-t-amber-500" />
                <p className="text-slate-400">Memuat produk...</p>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <Coffee className="mb-4 h-16 w-16 text-slate-600" />
              <h3 className="text-lg font-medium text-white">Produk tidak ditemukan</h3>
              <p className="mt-1 text-sm text-slate-400">
                Coba sesuaikan pencarian atau filter Anda
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
      <div className="fixed right-0 top-0 z-40 h-screen">
        <CartSidebar onCheckout={() => setIsCheckoutOpen(true)} />
      </div>

      {/* Checkout Dialog */}
      <CheckoutDialog
        open={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        onComplete={handleCheckoutComplete}
      />
    </div>
  );
}
