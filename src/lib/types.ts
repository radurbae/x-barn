// Database types matching Supabase schema

export interface Ingredient {
  id: string;
  name: string;
  unit: 'ml' | 'gr' | 'pcs';
  current_stock: number;
  cost_per_unit: number;
  min_stock: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image_url: string | null;
  description: string | null;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductRecipe {
  id: string;
  product_id: string;
  ingredient_id: string;
  amount_needed: number;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: number;
  total: number;
  payment_received: number;
  change_amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
}

// Cart types for frontend state
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

// Category type for filtering
export type ProductCategory = 'All' | 'Coffee' | 'Iced' | 'Non-Coffee' | 'Food';
