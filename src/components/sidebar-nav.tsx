'use client';

import { useEffect } from 'react';
import { Coffee, Package, ClipboardList, BarChart3, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/stores/settings-store';
import { useDailySalesStore } from '@/stores/daily-sales-store';
import { useCurrency } from '@/hooks/use-currency';
import { useTranslation } from '@/hooks/use-translation';

export function SidebarNav() {
    const pathname = usePathname();
    const { settings } = useSettingsStore();
    const { todayTotal, todayOrders, resetIfNewDay } = useDailySalesStore();
    const { formatCurrency } = useCurrency();
    const { t } = useTranslation();

    // Navigation items with translation keys
    const navItems = [
        { href: '/', label: t('cashier'), icon: Coffee },
        { href: '/inventory', label: t('inventory'), icon: Package },
        { href: '/menu', label: t('menu'), icon: ClipboardList },
        { href: '/reports', label: t('reports'), icon: BarChart3 },
        { href: '/settings', label: t('settings'), icon: Settings },
    ];

    // Reset daily sales if it's a new day
    useEffect(() => {
        resetIfNewDay();
    }, [resetIfNewDay]);

    return (
        <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
            {/* Logo */}
            <div className="flex h-16 items-center gap-3 border-b border-slate-200 dark:border-slate-800 px-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                    <Coffee className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-slate-900 dark:text-white">{settings.shopName}</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('posSystem')}</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200',
                                isActive
                                    ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-600 dark:text-amber-400 shadow-lg shadow-amber-500/10'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                            )}
                        >
                            <item.icon className={cn('h-5 w-5', isActive && 'text-amber-600 dark:text-amber-400')} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer - Daily Sales */}
            <div className="border-t border-slate-200 dark:border-slate-800 p-4">
                <div className="rounded-lg bg-slate-100 dark:bg-slate-800/50 p-4">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('todaySalesLabel')}</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(todayTotal)}</p>
                    <p className="text-xs text-slate-500">{todayOrders} {t('orders')}</p>
                </div>
            </div>
        </aside>
    );
}
