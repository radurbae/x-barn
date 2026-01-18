'use server';

import { supabase } from '@/lib/supabase';
import { CartItem } from '@/lib/types';

interface CreateOrderInput {
    items: CartItem[];
    paymentReceived: number;
}

interface CreateOrderResult {
    success: boolean;
    orderId?: string;
    orderNumber?: number;
    error?: string;
}

export async function createOrder({
    items,
    paymentReceived,
}: CreateOrderInput): Promise<CreateOrderResult> {
    // If supabase is not configured, return a demo success
    if (!supabase) {
        return {
            success: true,
            orderId: 'demo-order-' + Date.now(),
            orderNumber: Math.floor(Math.random() * 1000) + 1,
        };
    }

    try {
        // Calculate total
        const total = items.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
        );

        const changeAmount = paymentReceived - total;

        // Create the order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                total,
                payment_received: paymentReceived,
                change_amount: changeAmount,
                status: 'completed',
            })
            .select()
            .single();

        if (orderError) {
            console.error('Error creating order:', orderError);
            return { success: false, error: orderError.message };
        }

        // Create order items
        const orderItems = items.map((item) => ({
            order_id: order.id,
            product_id: item.product.id,
            product_name: item.product.name,
            quantity: item.quantity,
            unit_price: item.product.price,
            subtotal: item.product.price * item.quantity,
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) {
            console.error('Error creating order items:', itemsError);
            // Attempt to rollback order
            await supabase.from('orders').delete().eq('id', order.id);
            return { success: false, error: itemsError.message };
        }

        // Deduct ingredient stock for each item
        for (const item of items) {
            const { error: stockError } = await supabase.rpc(
                'deduct_ingredient_stock',
                {
                    p_product_id: item.product.id,
                    p_quantity: item.quantity,
                }
            );

            if (stockError) {
                console.error('Error deducting stock:', stockError);
                // Log but don't fail the order - stock can be adjusted manually
            }
        }

        return {
            success: true,
            orderId: order.id,
            orderNumber: order.order_number,
        };
    } catch (error) {
        console.error('Unexpected error in createOrder:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

export async function getProducts() {
    if (!supabase) {
        return [];
    }

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_available', true)
        .order('category')
        .order('name');

    if (error) {
        console.error('Error fetching products:', error);
        return [];
    }

    return data || [];
}
