'use server';

import { supabase } from '@/lib/supabase';
import { CartItem } from '@/lib/types';

interface TransactionInput {
    items: CartItem[];
    subtotal: number;
    taxAmount: number;
    total: number;
    paymentReceived: number;
}

interface TransactionResult {
    success: boolean;
    orderId?: string;
    orderNumber?: number;
    error?: string;
    insufficientIngredients?: { ingredient_name: string; required: number; available: number }[];
}

/**
 * Process a transaction atomically using the database RPC function.
 * 
 * The process_order_transaction RPC function:
 * 1. Validates all ingredient stock before making changes
 * 2. Creates order and order_items records
 * 3. Deducts ingredient stock based on product_recipes
 * 4. Rolls back everything if any ingredient has insufficient stock
 */
export async function processTransaction({
    items,
    total,
    paymentReceived,
}: TransactionInput): Promise<TransactionResult> {
    // Demo mode - simulate successful transaction
    if (!supabase) {
        return {
            success: true,
            orderId: 'demo-order-' + Date.now(),
            orderNumber: Math.floor(Math.random() * 1000) + 1,
        };
    }

    try {
        const changeAmount = paymentReceived - total;

        // Format items for the RPC function
        const rpcItems = items.map(item => ({
            product_id: item.product.id,
            product_name: item.product.name,
            quantity: item.quantity,
            unit_price: item.product.price,
        }));

        // Call the atomic transaction RPC function
        const { data, error } = await supabase.rpc('process_order_transaction', {
            p_items: rpcItems,
            p_total: total,
            p_payment_received: paymentReceived,
            p_change_amount: changeAmount,
        });

        if (error) {
            console.error('Transaction RPC error:', error);

            // Check if it's an insufficient ingredients error
            if (error.message.includes('Insufficient ingredients')) {
                // Parse the insufficient ingredients from the error message
                try {
                    const match = error.message.match(/Insufficient ingredients: (.+)/);
                    if (match) {
                        const insufficientData = JSON.parse(match[1]);
                        return {
                            success: false,
                            error: 'Insufficient ingredients',
                            insufficientIngredients: insufficientData,
                        };
                    }
                } catch {
                    // If parsing fails, just return the error message
                }
            }

            return { success: false, error: error.message };
        }

        // Check the response from the RPC function
        if (!data.success) {
            // Handle insufficient ingredients error from RPC
            if (data.error && data.error.includes('Insufficient ingredients')) {
                try {
                    const match = data.error.match(/Insufficient ingredients: (.+)/);
                    if (match) {
                        const insufficientData = JSON.parse(match[1]);
                        return {
                            success: false,
                            error: 'Insufficient ingredients',
                            insufficientIngredients: insufficientData,
                        };
                    }
                } catch {
                    // Parsing failed
                }
            }
            return { success: false, error: data.error || 'Transaction failed' };
        }

        return {
            success: true,
            orderId: data.order_id,
            orderNumber: data.order_number,
        };
    } catch (error) {
        console.error('Unexpected error in processTransaction:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
