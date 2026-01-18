'use client';

import { Product } from '@/lib/types';
import { useCartStore } from '@/stores/cart-store';
import { Badge } from '@/components/ui/badge';
import { Plus, Coffee } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/hooks/use-currency';

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const addItem = useCartStore((state) => state.addItem);
    const { formatCurrency } = useCurrency();

    const handleAdd = () => {
        addItem(product);
    };

    const categoryColors: Record<string, string> = {
        Coffee: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30',
        Iced: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30',
        'Non-Coffee': 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
        Food: 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30',
    };

    const categoryLabels: Record<string, string> = {
        Coffee: 'Kopi',
        Iced: 'Es',
        'Non-Coffee': 'Non-Kopi',
        Food: 'Makanan',
    };

    return (
        <button
            onClick={handleAdd}
            disabled={!product.is_available}
            className={cn(
                'group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 p-4 text-left transition-all duration-300',
                'hover:border-amber-500/50 hover:bg-slate-50 dark:hover:bg-slate-800 hover:shadow-lg hover:shadow-amber-500/10',
                'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900',
                !product.is_available && 'cursor-not-allowed opacity-50'
            )}
        >
            {/* Image placeholder */}
            <div className="relative mb-3 flex h-24 w-full items-center justify-center rounded-lg bg-slate-100 dark:bg-gradient-to-br dark:from-slate-700 dark:to-slate-800">
                <Coffee className="h-10 w-10 text-slate-400 dark:text-slate-500 transition-colors group-hover:text-amber-500/50" />

                {/* Add button overlay */}
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-amber-500/0 transition-all duration-300 group-hover:bg-amber-500/10">
                    <div className="flex h-10 w-10 scale-0 items-center justify-center rounded-full bg-amber-500 shadow-lg shadow-amber-500/30 transition-transform duration-300 group-hover:scale-100">
                        <Plus className="h-5 w-5 text-white" />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col">
                <Badge
                    variant="outline"
                    className={cn(
                        'mb-2 w-fit text-xs',
                        categoryColors[product.category] || 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    )}
                >
                    {categoryLabels[product.category] || product.category}
                </Badge>

                <h3 className="font-semibold text-slate-900 dark:text-white transition-colors group-hover:text-amber-600 dark:group-hover:text-amber-400">
                    {product.name}
                </h3>

                {product.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                        {product.description}
                    </p>
                )}

                <div className="mt-auto pt-3">
                    <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                        {formatCurrency(product.price)}
                    </span>
                </div>
            </div>

            {/* Unavailable overlay */}
            {!product.is_available && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/80 dark:bg-slate-900/80">
                    <span className="rounded-full bg-red-500/20 px-3 py-1 text-sm font-medium text-red-600 dark:text-red-400">
                        Tidak Tersedia
                    </span>
                </div>
            )}
        </button>
    );
}
