'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { SidebarNav } from '@/components/sidebar-nav';
import { Button } from '@/components/ui/button';

interface PageLayoutProps {
    children: React.ReactNode;
    title: string;
    description?: string;
    actions?: React.ReactNode;
}

export function PageLayout({ children, title, description, actions }: PageLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="relative flex min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Sidebar Navigation */}
            <SidebarNav
                onClose={() => setIsSidebarOpen(false)}
                className={`fixed left-0 top-0 z-40 h-screen transform transition-transform duration-300 lg:translate-x-0 ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            />

            {isSidebarOpen && (
                <button
                    type="button"
                    aria-label="Close menu"
                    onClick={() => setIsSidebarOpen(false)}
                    className="fixed inset-0 z-30 bg-slate-900/60 backdrop-blur-sm lg:hidden"
                />
            )}

            {/* Main Content Area */}
            <main className="flex flex-1 flex-col lg:ml-64">
                {/* Header */}
                <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-slate-900/80">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Open menu"
                                onClick={() => setIsSidebarOpen(true)}
                                className="lg:hidden"
                            >
                                <Menu className="h-4 w-4" />
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
                                {description && (
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
                                )}
                            </div>
                        </div>
                        {actions && <div className="flex items-center gap-3">{actions}</div>}
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6 bg-slate-50 dark:bg-transparent">{children}</div>
            </main>
        </div>
    );
}
