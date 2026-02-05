'use client';

import { useRef } from 'react';
import {
    Dialog,
    DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Printer, X } from 'lucide-react';
import { useSettingsStore } from '@/stores/settings-store';
import { useCurrency } from '@/hooks/use-currency';
import { useTranslation } from '@/hooks/use-translation';
import { CartItem } from '@/stores/cart-store';

interface ReceiptModalProps {
    open: boolean;
    onClose: () => void;
    orderNumber: number;
    items: CartItem[];
    subtotal: number;
    taxAmount: number;
    total: number;
    paymentReceived: number;
    change: number;
    timestamp: Date;
}

export function ReceiptModal({
    open,
    onClose,
    orderNumber,
    items,
    subtotal,
    taxAmount,
    total,
    paymentReceived,
    change,
    timestamp,
}: ReceiptModalProps) {
    const { settings } = useSettingsStore();
    const { formatCurrency } = useCurrency();
    const { t, language } = useTranslation();
    const receiptRef = useRef<HTMLDivElement>(null);

    const dateLocale = language === 'id' ? 'id-ID' : 'en-US';

    const handlePrint = () => {
        if (receiptRef.current) {
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Receipt #${orderNumber}</title>
                        <style>
                            * { margin: 0; padding: 0; box-sizing: border-box; }
                            body { 
                                font-family: 'Courier New', monospace; 
                                padding: 20px;
                                max-width: 300px;
                                margin: 0 auto;
                            }
                            .receipt { text-align: center; }
                            .shop-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
                            .order-info { font-size: 12px; margin: 10px 0; }
                            .separator { border-top: 1px dashed #000; margin: 10px 0; }
                            .items { text-align: left; font-size: 12px; }
                            .item { display: flex; justify-content: space-between; margin: 5px 0; }
                            .item-name { flex: 1; }
                            .item-price { text-align: right; }
                            .totals { text-align: left; font-size: 12px; margin-top: 10px; }
                            .total-row { display: flex; justify-content: space-between; margin: 3px 0; }
                            .total-row.grand { font-weight: bold; font-size: 14px; margin-top: 5px; }
                            .footer { font-size: 11px; margin-top: 15px; text-align: center; }
                            @media print { body { padding: 0; } }
                        </style>
                    </head>
                    <body>
                        ${receiptRef.current.innerHTML}
                    </body>
                    </html>
                `);
                printWindow.document.close();
                printWindow.focus();
                printWindow.print();
                printWindow.close();
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-0">
                {/* Print Button Header */}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-4 py-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        aria-label="Close receipt"
                        className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                    <Button
                        onClick={handlePrint}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
                    >
                        <Printer className="mr-2 h-4 w-4" />
                        {t('print')}
                    </Button>
                </div>

                {/* Receipt Content */}
                <div className="p-6">
                    <div ref={receiptRef} className="receipt font-mono text-sm">
                        {/* Header */}
                        <div className="text-center">
                            <h2 className="shop-name text-lg font-bold text-slate-900 dark:text-white">
                                {settings.shopName}
                            </h2>
                            <p className="order-info text-xs text-slate-500 dark:text-slate-400 mt-2">
                                {t('orderNumber')}: #{orderNumber}
                            </p>
                            <p className="order-info text-xs text-slate-500 dark:text-slate-400">
                                {timestamp.toLocaleDateString(dateLocale, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })} - {timestamp.toLocaleTimeString(dateLocale, {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                        </div>

                        <Separator className="separator my-4 bg-slate-300 dark:bg-slate-600" />

                        {/* Items */}
                        <div className="items space-y-2">
                            {items.map((item) => (
                                <div key={item.product.id} className="item flex justify-between text-slate-700 dark:text-slate-300">
                                    <span className="item-name">
                                        {item.quantity}x {item.product.name}
                                    </span>
                                    <span className="item-price font-medium">
                                        {formatCurrency(item.product.price * item.quantity)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <Separator className="separator my-4 bg-slate-300 dark:bg-slate-600" />

                        {/* Totals */}
                        <div className="totals space-y-1">
                            <div className="total-row flex justify-between text-slate-600 dark:text-slate-400">
                                <span>{t('subtotal')}</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                            {taxAmount > 0 && (
                                <div className="total-row flex justify-between text-slate-600 dark:text-slate-400">
                                    <span>{t('tax')} ({settings.taxRate}%)</span>
                                    <span>{formatCurrency(taxAmount)}</span>
                                </div>
                            )}
                            <div className="total-row grand flex justify-between text-lg font-bold text-slate-900 dark:text-white pt-2">
                                <span>{t('total')}</span>
                                <span>{formatCurrency(total)}</span>
                            </div>

                            <Separator className="my-3 bg-slate-300 dark:bg-slate-600" />

                            <div className="total-row flex justify-between text-slate-600 dark:text-slate-400">
                                <span>{t('cash')}</span>
                                <span>{formatCurrency(paymentReceived)}</span>
                            </div>
                            <div className="total-row flex justify-between font-medium text-emerald-600 dark:text-emerald-400">
                                <span>{t('change')}</span>
                                <span>{formatCurrency(change)}</span>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="footer mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
                            <p>{settings.receiptFooter}</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
