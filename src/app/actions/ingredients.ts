'use server';

import { supabase } from '@/lib/supabase';
import { Ingredient } from '@/lib/types';

export async function getIngredients(): Promise<Ingredient[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .order('name');

    if (error) {
        console.error('Error fetching ingredients:', error);
        return [];
    }

    return data || [];
}

export async function createIngredient(ingredient: Omit<Ingredient, 'id' | 'created_at' | 'updated_at'>) {
    if (!supabase) {
        return { success: false, error: 'Database not configured' };
    }

    const { data, error } = await supabase
        .from('ingredients')
        .insert(ingredient)
        .select()
        .single();

    if (error) {
        console.error('Error creating ingredient:', error);
        return { success: false, error: error.message };
    }

    return { success: true, data };
}

export async function updateIngredient(id: string, updates: Partial<Ingredient>) {
    if (!supabase) {
        return { success: false, error: 'Database not configured' };
    }

    const { data, error } = await supabase
        .from('ingredients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating ingredient:', error);
        return { success: false, error: error.message };
    }

    return { success: true, data };
}

export async function deleteIngredient(id: string) {
    if (!supabase) {
        return { success: false, error: 'Database not configured' };
    }

    const { error } = await supabase
        .from('ingredients')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting ingredient:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}
