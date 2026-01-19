'use server';

import { supabase } from '@/lib/supabase';
import { Ingredient } from '@/lib/types';

interface RecipeItem {
    ingredient_id: string;
    amount_needed: number;
}

interface RecipeWithIngredient {
    id: string;
    ingredient_id: string;
    amount_needed: number;
    ingredient: Ingredient;
}

/**
 * Get all recipes for a product with ingredient details
 */
export async function getProductRecipes(productId: string): Promise<RecipeWithIngredient[]> {
    if (!supabase) {
        return [];
    }

    const { data, error } = await supabase
        .from('product_recipes')
        .select(`
            id,
            ingredient_id,
            amount_needed,
            ingredients (
                id,
                name,
                unit,
                current_stock,
                cost_per_unit,
                min_stock
            )
        `)
        .eq('product_id', productId);

    if (error) {
        console.error('Error fetching product recipes:', error);
        return [];
    }

    // Transform the data to match our interface
    return (data || []).map(item => ({
        id: item.id,
        ingredient_id: item.ingredient_id,
        amount_needed: item.amount_needed,
        ingredient: item.ingredients as unknown as Ingredient,
    }));
}

/**
 * Get all ingredients for recipe selection
 */
export async function getAllIngredients(): Promise<Ingredient[]> {
    if (!supabase) {
        // Demo ingredients
        return [
            { id: '1', name: 'Espresso Beans', unit: 'gr', current_stock: 5000, cost_per_unit: 150, min_stock: 500, created_at: '', updated_at: '' },
            { id: '2', name: 'Whole Milk', unit: 'ml', current_stock: 10000, cost_per_unit: 25, min_stock: 2000, created_at: '', updated_at: '' },
            { id: '3', name: 'Sugar', unit: 'gr', current_stock: 3000, cost_per_unit: 15, min_stock: 500, created_at: '', updated_at: '' },
            { id: '4', name: 'Chocolate Syrup', unit: 'ml', current_stock: 2000, cost_per_unit: 75, min_stock: 500, created_at: '', updated_at: '' },
            { id: '5', name: 'Vanilla Syrup', unit: 'ml', current_stock: 1500, cost_per_unit: 80, min_stock: 300, created_at: '', updated_at: '' },
        ];
    }

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

/**
 * Save recipes for a product (replaces existing recipes)
 */
export async function saveProductRecipes(
    productId: string,
    recipes: RecipeItem[]
): Promise<{ success: boolean; error?: string }> {
    if (!supabase) {
        return { success: true };
    }

    try {
        // Delete existing recipes for this product
        const { error: deleteError } = await supabase
            .from('product_recipes')
            .delete()
            .eq('product_id', productId);

        if (deleteError) {
            console.error('Error deleting old recipes:', deleteError);
            return { success: false, error: deleteError.message };
        }

        // Insert new recipes if any
        if (recipes.length > 0) {
            const recipesToInsert = recipes.map(recipe => ({
                product_id: productId,
                ingredient_id: recipe.ingredient_id,
                amount_needed: recipe.amount_needed,
            }));

            const { error: insertError } = await supabase
                .from('product_recipes')
                .insert(recipesToInsert);

            if (insertError) {
                console.error('Error inserting recipes:', insertError);
                return { success: false, error: insertError.message };
            }
        }

        return { success: true };
    } catch (error) {
        console.error('Error saving recipes:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * Get recipes for multiple products at once (for displaying on product cards)
 */
export async function getRecipesForProducts(productIds: string[]): Promise<Record<string, RecipeWithIngredient[]>> {
    if (!supabase || productIds.length === 0) {
        return {};
    }

    const { data, error } = await supabase
        .from('product_recipes')
        .select(`
            id,
            product_id,
            ingredient_id,
            amount_needed,
            ingredients (
                id,
                name,
                unit,
                current_stock,
                cost_per_unit,
                min_stock
            )
        `)
        .in('product_id', productIds);

    if (error) {
        console.error('Error fetching recipes for products:', error);
        return {};
    }

    // Group by product_id
    const grouped: Record<string, RecipeWithIngredient[]> = {};
    for (const item of data || []) {
        const productId = item.product_id;
        if (!grouped[productId]) {
            grouped[productId] = [];
        }
        grouped[productId].push({
            id: item.id,
            ingredient_id: item.ingredient_id,
            amount_needed: item.amount_needed,
            ingredient: item.ingredients as unknown as Ingredient,
        });
    }

    return grouped;
}
