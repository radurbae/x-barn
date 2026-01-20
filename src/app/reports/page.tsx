'use client';

import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/page-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DollarSign,
    TrendingUp,
    ShoppingBag,
    Calendar,
    Coffee,
    Download,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatTime } from '@/lib/format';
import { useCurrency } from '@/hooks/use-currency';
import { useTranslation } from '@/hooks/use-translation';

interface SalesStats {
    today: { total: number; orders: number };
    week: { total: number; orders: number };
    month: { total: number; orders: number };
}

interface OrderSummary {
    id: string;
    order_number: number;
    total: number;
    created_at: string;
    items_count: number;
}

interface TopProduct {
    name: string;
    quantity: number;
    revenue: number;
}

// Demo data
const demoStats: SalesStats = {
    today: { total: 1850000, orders: 18 },
    week: { total: 12500000, orders: 98 },
    month: { total: 48750000, orders: 412 },
};

const demoOrders: OrderSummary[] = [
    { id: '1', order_number: 1042, total: 155000, created_at: new Date().toISOString(), items_count: 3 },
    { id: '2', order_number: 1041, total: 80000, created_at: new Date(Date.now() - 3600000).toISOString(), items_count: 2 },
    { id: '3', order_number: 1040, total: 225000, created_at: new Date(Date.now() - 7200000).toISOString(), items_count: 4 },
    { id: '4', order_number: 1039, total: 55000, created_at: new Date(Date.now() - 10800000).toISOString(), items_count: 1 },
    { id: '5', order_number: 1038, total: 180000, created_at: new Date(Date.now() - 14400000).toISOString(), items_count: 3 },
];

const demoTopProducts: TopProduct[] = [
    { name: 'Latte', quantity: 156, revenue: 5460000 },
    { name: 'Cappuccino', quantity: 132, revenue: 4620000 },
    { name: 'Iced Latte', quantity: 98, revenue: 3724000 },
    { name: 'Americano', quantity: 87, revenue: 2436000 },
    { name: 'Mocha', quantity: 65, revenue: 2470000 },
];

export default function ReportsPage() {
    const [stats, setStats] = useState<SalesStats>(demoStats);
    const [recentOrders, setRecentOrders] = useState<OrderSummary[]>(demoOrders);
    const [topProducts, setTopProducts] = useState<TopProduct[]>(demoTopProducts);
    const [isLoading, setIsLoading] = useState(true);
    const { formatCurrency } = useCurrency();
    const { t } = useTranslation();

    useEffect(() => {
        fetchReportData();
    }, []);

    async function fetchReportData() {
        if (!supabase) {
            setIsLoading(false);
            return;
        }

        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);

            const monthAgo = new Date(today);
            monthAgo.setDate(monthAgo.getDate() - 30);

            const { data: todayData } = await supabase
                .from('orders')
                .select('total')
                .gte('created_at', today.toISOString())
                .eq('status', 'completed');

            const { data: weekData } = await supabase
                .from('orders')
                .select('total')
                .gte('created_at', weekAgo.toISOString())
                .eq('status', 'completed');

            const { data: monthData } = await supabase
                .from('orders')
                .select('total')
                .gte('created_at', monthAgo.toISOString())
                .eq('status', 'completed');

            if (todayData && weekData && monthData) {
                setStats({
                    today: {
                        total: todayData.reduce((sum, o) => sum + o.total, 0),
                        orders: todayData.length,
                    },
                    week: {
                        total: weekData.reduce((sum, o) => sum + o.total, 0),
                        orders: weekData.length,
                    },
                    month: {
                        total: monthData.reduce((sum, o) => sum + o.total, 0),
                        orders: monthData.length,
                    },
                });
            }

            const { data: orders } = await supabase
                .from('orders')
                .select('id, order_number, total, created_at')
                .eq('status', 'completed')
                .order('created_at', { ascending: false })
                .limit(10);

            if (orders) {
                const ordersWithItems = await Promise.all(
                    orders.map(async (order) => {
                        const { count } = await supabase!
                            .from('order_items')
                            .select('*', { count: 'exact', head: true })
                            .eq('order_id', order.id);
                        return { ...order, items_count: count || 0 };
                    })
                );
                setRecentOrders(ordersWithItems);
            }

            const { data: topItems } = await supabase
                .from('order_items')
                .select('product_name, quantity, subtotal')
                .gte('created_at', monthAgo.toISOString());

            if (topItems) {
                const productMap = new Map<string, { quantity: number; revenue: number }>();
                topItems.forEach((item) => {
                    const existing = productMap.get(item.product_name) || { quantity: 0, revenue: 0 };
                    productMap.set(item.product_name, {
                        quantity: existing.quantity + item.quantity,
                        revenue: existing.revenue + item.subtotal,
                    });
                });

                const sorted = Array.from(productMap.entries())
                    .map(([name, data]) => ({ name, ...data }))
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 5);

                if (sorted.length > 0) {
                    setTopProducts(sorted);
                }
            }
        } catch (error) {
            console.error('Error fetching report data:', error);
        } finally {
            setIsLoading(false);
        }
    }

    function downloadCSV() {
        // Create CSV header
        const headers = ['Order ID', 'Order #', 'Total', 'Date', 'Items'];

        // Create CSV rows from recent orders
        const rows = recentOrders.map(order => [
            order.id,
            order.order_number,
            order.total,
            new Date(order.created_at).toLocaleString(),
            order.items_count,
        ]);

        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `sales_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <PageLayout
            title={t('reports')}
            description={t('salesAnalytics')}
            actions={
                <Button
                    onClick={downloadCSV}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
                >
                    <Download className="mr-2 h-4 w-4" />
                    {t('downloadReport')}
                </Button>
            }
        >
            {/* Stats Cards */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                            <DollarSign className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{t('todaySales')}</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(stats.today.total)}</p>
                            <p className="text-xs text-slate-500">{stats.today.orders} {t('orders')}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/20">
                            <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{t('thisWeek')}</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(stats.week.total)}</p>
                            <p className="text-xs text-slate-500">{stats.week.orders} {t('orders')}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/20">
                            <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{t('thisMonth')}</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(stats.month.total)}</p>
                            <p className="text-xs text-slate-500">{stats.month.orders} {t('orders')}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/20">
                            <ShoppingBag className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{t('avgOrderValue')}</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                {formatCurrency(stats.month.orders > 0 ? stats.month.total / stats.month.orders : 0)}
                            </p>
                            <p className="text-xs text-slate-500">{t('perOrder')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="recent" className="space-y-4">
                <TabsList className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50">
                    <TabsTrigger value="recent" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=inactive]:text-slate-600 dark:data-[state=inactive]:text-slate-400">
                        {t('recentOrders')}
                    </TabsTrigger>
                    <TabsTrigger value="top" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=inactive]:text-slate-600 dark:data-[state=inactive]:text-slate-400">
                        {t('topProducts')}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="recent">
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <TableHead className="text-slate-500 dark:text-slate-400">{t('orderNumber')}</TableHead>
                                    <TableHead className="text-slate-500 dark:text-slate-400">{t('time')}</TableHead>
                                    <TableHead className="text-slate-500 dark:text-slate-400">{t('items')}</TableHead>
                                    <TableHead className="text-right text-slate-500 dark:text-slate-400">{t('total')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-slate-500 dark:text-slate-400">
                                            {t('loading')}
                                        </TableCell>
                                    </TableRow>
                                ) : recentOrders.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-slate-500 dark:text-slate-400">
                                            {t('noOrders')}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    recentOrders.map((order) => (
                                        <TableRow key={order.id} className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <TableCell className="font-medium text-slate-900 dark:text-white">
                                                #{order.order_number}
                                            </TableCell>
                                            <TableCell className="text-slate-600 dark:text-slate-300">
                                                {formatTime(order.created_at)}
                                            </TableCell>
                                            <TableCell className="text-slate-600 dark:text-slate-300">
                                                {order.items_count} {t('item')}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold text-amber-600 dark:text-amber-400">
                                                {formatCurrency(order.total)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                <TabsContent value="top">
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <TableHead className="text-slate-500 dark:text-slate-400">{t('rank')}</TableHead>
                                    <TableHead className="text-slate-500 dark:text-slate-400">{t('product')}</TableHead>
                                    <TableHead className="text-slate-500 dark:text-slate-400">{t('quantitySold')}</TableHead>
                                    <TableHead className="text-right text-slate-500 dark:text-slate-400">{t('revenue')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-slate-500 dark:text-slate-400">
                                            {t('loading')}
                                        </TableCell>
                                    </TableRow>
                                ) : topProducts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-slate-500 dark:text-slate-400">
                                            {t('noSalesData')}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    topProducts.map((product, index) => (
                                        <TableRow key={product.name} className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <TableCell>
                                                <Badge
                                                    className={
                                                        index === 0
                                                            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                                                            : index === 1
                                                                ? 'bg-slate-500/20 text-slate-600 dark:text-slate-300'
                                                                : index === 2
                                                                    ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400'
                                                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                                    }
                                                >
                                                    #{index + 1}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-medium text-slate-900 dark:text-white">
                                                <div className="flex items-center gap-2">
                                                    <Coffee className="h-4 w-4 text-slate-500" />
                                                    {product.name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-slate-600 dark:text-slate-300">
                                                {product.quantity}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold text-emerald-600 dark:text-emerald-400">
                                                {formatCurrency(product.revenue)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
            </Tabs>
        </PageLayout>
    );
}
