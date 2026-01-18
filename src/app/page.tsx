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
  { id: '1', name: 'Espresso', price: 3.50, category: 'Coffee', image_url: null, description: 'Rich, bold single shot of espresso', is_available: true, created_at: '', updated_at: '' },
  { id: '2', name: 'Americano', price: 4.00, category: 'Coffee', image_url: null, description: 'Espresso with hot water', is_available: true, created_at: '', updated_at: '' },
  { id: '3', name: 'Latte', price: 5.00, category: 'Coffee', image_url: null, description: 'Espresso with steamed milk', is_available: true, created_at: '', updated_at: '' },
  { id: '4', name: 'Cappuccino', price: 5.00, category: 'Coffee', image_url: null, description: 'Equal parts espresso, steamed milk, and foam', is_available: true, created_at: '', updated_at: '' },
  { id: '5', name: 'Mocha', price: 5.50, category: 'Coffee', image_url: null, description: 'Espresso with chocolate and steamed milk', is_available: true, created_at: '', updated_at: '' },
  { id: '6', name: 'Vanilla Latte', price: 5.50, category: 'Coffee', image_url: null, description: 'Latte with vanilla syrup', is_available: true, created_at: '', updated_at: '' },
  { id: '7', name: 'Caramel Macchiato', price: 6.00, category: 'Coffee', image_url: null, description: 'Vanilla latte with caramel drizzle', is_available: true, created_at: '', updated_at: '' },
  { id: '8', name: 'Iced Latte', price: 5.50, category: 'Iced', image_url: null, description: 'Chilled espresso with cold milk over ice', is_available: true, created_at: '', updated_at: '' },
  { id: '9', name: 'Iced Americano', price: 4.50, category: 'Iced', image_url: null, description: 'Espresso with cold water over ice', is_available: true, created_at: '', updated_at: '' },
  { id: '10', name: 'Cold Brew', price: 5.00, category: 'Iced', image_url: null, description: '12-hour steeped cold coffee', is_available: true, created_at: '', updated_at: '' },
  { id: '11', name: 'Matcha Latte', price: 5.50, category: 'Non-Coffee', image_url: null, description: 'Japanese green tea with steamed milk', is_available: true, created_at: '', updated_at: '' },
  { id: '12', name: 'Hot Chocolate', price: 4.50, category: 'Non-Coffee', image_url: null, description: 'Rich chocolate with steamed milk', is_available: true, created_at: '', updated_at: '' },
  { id: '13', name: 'Butter Croissant', price: 4.00, category: 'Food', image_url: null, description: 'Flaky, buttery French croissant', is_available: true, created_at: '', updated_at: '' },
  { id: '14', name: 'Banana Bread', price: 4.50, category: 'Food', image_url: null, description: 'Homemade moist banana bread slice', is_available: true, created_at: '', updated_at: '' },
  { id: '15', name: 'Chocolate Muffin', price: 4.00, category: 'Food', image_url: null, description: 'Rich chocolate chip muffin', is_available: true, created_at: '', updated_at: '' },
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
      <main className="ml-64 flex flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-slate-900/80">
          <div className="flex items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Point of Sale</h1>
              <p className="text-sm text-slate-400">
                {new Date().toLocaleDateString('en-US', {
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
                placeholder="Search products..."
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
        <div className="flex-1 overflow-auto p-6 pr-[336px]">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500/20 border-t-amber-500" />
                <p className="text-slate-400">Loading products...</p>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <Coffee className="mb-4 h-16 w-16 text-slate-600" />
              <h3 className="text-lg font-medium text-white">No products found</h3>
              <p className="mt-1 text-sm text-slate-400">
                Try adjusting your search or filter
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
