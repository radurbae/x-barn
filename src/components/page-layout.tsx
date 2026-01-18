'use client';

import { SidebarNav } from '@/components/sidebar-nav';

interface PageLayoutProps {
    children: React.ReactNode;
    title: string;
    description?: string;
    actions?: React.ReactNode;
}

export function PageLayout({ children, title, description, actions }: PageLayoutProps) {
    return (
        <div className="flex min-h-screen">
            {/* Sidebar Navigation */}
            <SidebarNav />

            {/* Main Content Area */}
            <main className="ml-64 flex flex-1 flex-col">
                {/* Header */}
                <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-slate-900/80">
                    <div className="flex items-center justify-between gap-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
                            {description && (
                                <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
                            )}
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
