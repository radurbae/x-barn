'use client';

import { ProductCategory } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Coffee, Snowflake, Leaf, Cookie, LayoutGrid } from 'lucide-react';

interface CategoryFilterProps {
    selectedCategory: ProductCategory;
    onCategoryChange: (category: ProductCategory) => void;
}

const categories: { value: ProductCategory; label: string; icon: React.ElementType }[] = [
    { value: 'All', label: 'Semua', icon: LayoutGrid },
    { value: 'Coffee', label: 'Kopi', icon: Coffee },
    { value: 'Iced', label: 'Minuman Es', icon: Snowflake },
    { value: 'Non-Coffee', label: 'Non-Kopi', icon: Leaf },
    { value: 'Food', label: 'Makanan', icon: Cookie },
];

export function CategoryFilter({
    selectedCategory,
    onCategoryChange,
}: CategoryFilterProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
                const isSelected = selectedCategory === category.value;
                return (
                    <button
                        key={category.value}
                        onClick={() => onCategoryChange(category.value)}
                        className={cn(
                            'flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200',
                            isSelected
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-transparent hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200'
                        )}
                    >
                        <category.icon className="h-4 w-4" />
                        {category.label}
                    </button>
                );
            })}
        </div>
    );
}
