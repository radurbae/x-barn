'use client';

import { Coffee, Package, ClipboardList, BarChart3, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/', label: 'POS', icon: Coffee },
    { href: '/inventory', label: 'Inventory', icon: Package },
    { href: '/menu', label: 'Menu', icon: ClipboardList },
    { href: '/reports', label: 'Reports', icon: BarChart3 },
    { href: '/settings', label: 'Settings', icon: Settings },
];

export function SidebarNav() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-slate-900 border-r border-slate-800">
            {/* Logo */}
            <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                    <Coffee className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-white">Barn Coffee</h1>
                    <p className="text-xs text-slate-400">Point of Sale</p>
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
                                    ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-400 shadow-lg shadow-amber-500/10'
                                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                            )}
                        >
                            <item.icon className={cn('h-5 w-5', isActive && 'text-amber-400')} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="border-t border-slate-800 p-4">
                <div className="rounded-lg bg-slate-800/50 p-4">
                    <p className="text-xs font-medium text-slate-400">Today&apos;s Sales</p>
                    <p className="mt-1 text-2xl font-bold text-white">$0.00</p>
                    <p className="text-xs text-slate-500">0 orders</p>
                </div>
            </div>
        </aside>
    );
}
