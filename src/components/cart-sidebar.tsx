'use client';

import { useCartStore } from '@/stores/cart-store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Plus, Minus, Trash2, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/hooks/use-currency';

interface CartSidebarProps {
    onCheckout: () => void;
}

export function CartSidebar({ onCheckout }: CartSidebarProps) {
    const { items, updateQuantity, removeItem, getTotal, getItemCount, clearCart } =
        useCartStore();
    const { formatCurrency } = useCurrency();

    const total = getTotal();
    const itemCount = getItemCount();

    return (
        <aside className="flex h-full w-80 flex-col border-l border-slate-800 bg-slate-900">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                        <ShoppingCart className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2 className="font-bold text-white">Pesanan</h2>
                        <p className="text-xs text-slate-400">
                            {itemCount} {itemCount === 1 ? 'item' : 'item'}
                        </p>
                    </div>
                </div>
                {items.length > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearCart}
                        className="text-slate-400 hover:text-red-400"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* Cart Items */}
            <ScrollArea className="flex-1 px-4 py-2">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800">
                            <Receipt className="h-8 w-8 text-slate-600" />
                        </div>
                        <p className="text-slate-400">Keranjang kosong</p>
                        <p className="mt-1 text-xs text-slate-500">
                            Ketuk produk untuk menambahkan
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {items.map((item) => (
                            <div
                                key={item.product.id}
                                className="group rounded-lg bg-slate-800/50 p-3 transition-colors hover:bg-slate-800"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="truncate font-medium text-white">
                                            {item.product.name}
                                        </h4>
                                        <p className="text-sm text-amber-400">
                                            {formatCurrency(item.product.price)}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() =>
                                                updateQuantity(item.product.id, item.quantity - 1)
                                            }
                                            className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-700 text-slate-300 transition-colors hover:bg-slate-600 hover:text-white"
                                        >
                                            <Minus className="h-3 w-3" />
                                        </button>
                                        <span className="w-8 text-center text-sm font-medium text-white">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() =>
                                                updateQuantity(item.product.id, item.quantity + 1)
                                            }
                                            className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-700 text-slate-300 transition-colors hover:bg-slate-600 hover:text-white"
                                        >
                                            <Plus className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-2 flex items-center justify-between">
                                    <button
                                        onClick={() => removeItem(item.product.id)}
                                        className="text-xs text-slate-500 transition-colors hover:text-red-400"
                                    >
                                        Hapus
                                    </button>
                                    <span className="text-sm font-semibold text-white">
                                        {formatCurrency(item.product.price * item.quantity)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>

            {/* Footer */}
            <div className="border-t border-slate-800 p-4">
                <div className="mb-4 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Subtotal</span>
                        <span className="text-white">{formatCurrency(total)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Pajak (0%)</span>
                        <span className="text-white">{formatCurrency(0)}</span>
                    </div>
                    <Separator className="bg-slate-700" />
                    <div className="flex justify-between text-lg font-bold">
                        <span className="text-white">Total</span>
                        <span className="text-amber-400">{formatCurrency(total)}</span>
                    </div>
                </div>

                <Button
                    onClick={onCheckout}
                    disabled={items.length === 0}
                    className={cn(
                        'w-full py-6 text-lg font-bold transition-all duration-300',
                        items.length > 0
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-orange-600'
                            : 'bg-slate-800 text-slate-500'
                    )}
                >
                    Bayar {formatCurrency(total)}
                </Button>
            </div>
        </aside>
    );
}
