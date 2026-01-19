'use server';

import { supabase } from '@/lib/supabase';
import { Product } from '@/lib/types';

export async function getProductsAdmin(): Promise<Product[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('category')
        .order('name');

    if (error) {
        console.error('Error fetching products:', error);
        return [];
    }

    return data || [];
}

export async function createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
    if (!supabase) {
        // Demo mode: return a fake product ID
        return { success: true, productId: 'demo-' + Date.now() };
    }

    const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();

    if (error) {
        console.error('Error creating product:', error);
        return { success: false, error: error.message };
    }

    return { success: true, productId: data.id, data };
}

export async function updateProduct(id: string, updates: Partial<Product>) {
    if (!supabase) {
        return { success: false, error: 'Database not configured' };
    }

    const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating product:', error);
        return { success: false, error: error.message };
    }

    return { success: true, data };
}

export async function deleteProduct(id: string) {
    if (!supabase) {
        return { success: false, error: 'Database not configured' };
    }

    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting product:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

export async function toggleProductAvailability(id: string, isAvailable: boolean) {
    return updateProduct(id, { is_available: isAvailable });
}
