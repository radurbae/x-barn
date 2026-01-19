'use client';

import { useState } from 'react';
import { useCartStore, CartItem } from '@/stores/cart-store';
import { useSettingsStore } from '@/stores/settings-store';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/hooks/use-currency';
import { useTranslation } from '@/hooks/use-translation';
import { ReceiptModal } from '@/components/receipt-modal';
import { processTransaction } from '@/app/actions/transaction';

interface CheckoutDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onComplete: (paymentReceived: number) => void;
}

interface CompletedOrder {
    orderNumber: number;
    items: CartItem[];
    subtotal: number;
    taxAmount: number;
    total: number;
    paymentReceived: number;
    change: number;
    timestamp: Date;
}

export function CheckoutDialog({
    open,
    onOpenChange,
    onComplete,
}: CheckoutDialogProps) {
    const { items, getTotal, clearCart } = useCartStore();
    const { settings } = useSettingsStore();
    const { formatCurrency, currency } = useCurrency();
    const { t } = useTranslation();
    const [paymentInput, setPaymentInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [completedOrder, setCompletedOrder] = useState<CompletedOrder | null>(null);

    const subtotal = getTotal();
    const taxAmount = settings.taxEnabled ? subtotal * (settings.taxRate / 100) : 0;
    const total = subtotal + taxAmount;
    const paymentAmount = parseFloat(paymentInput) || 0;
    const change = paymentAmount - total;
    const canPay = paymentAmount >= total;

    // Quick amount buttons based on currency
    const quickAmounts = currency === 'IDR'
        ? [10000, 20000, 50000, 100000]
        : [5, 10, 20, 50];

    const currencySymbol = currency === 'IDR' ? 'Rp' : currency === 'USD' ? '$' : currency;

    const handleQuickAmount = (amount: number) => {
        setPaymentInput((prev) => {
            const current = parseFloat(prev) || 0;
            return (current + amount).toString();
        });
    };

    const handleExactAmount = () => {
        setPaymentInput(total.toString());
    };

    const handlePayment = async () => {
        if (!canPay) return;

        setIsProcessing(true);

        try {
            // Process transaction with inventory deduction
            const result = await processTransaction({
                items,
                subtotal,
                taxAmount,
                total,
                paymentReceived: paymentAmount,
            });

            if (!result.success) {
                console.error('Transaction failed:', result.error);
                // Still show receipt for demo mode
            }

            // Use order number from database or generate demo one
            const orderNumber = result.orderNumber || Math.floor(1000 + Math.random() * 9000);

            // Store completed order for receipt
            setCompletedOrder({
                orderNumber,
                items: [...items],
                subtotal,
                taxAmount,
                total,
                paymentReceived: paymentAmount,
                change,
                timestamp: new Date(),
            });

            // Call complete handler
            onComplete(paymentAmount);

            // Clear cart
            clearCart();
        } catch (error) {
            console.error('Payment error:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReceiptClose = () => {
        setCompletedOrder(null);
        setPaymentInput('');
        onOpenChange(false);
    };

    const handleClose = () => {
        if (!isProcessing && !completedOrder) {
            setPaymentInput('');
            onOpenChange(false);
        }
    };

    // Show receipt modal if order is completed
    if (completedOrder) {
        return (
            <ReceiptModal
                open={true}
                onClose={handleReceiptClose}
                orderNumber={completedOrder.orderNumber}
                items={completedOrder.items}
                subtotal={completedOrder.subtotal}
                taxAmount={completedOrder.taxAmount}
                total={completedOrder.total}
                paymentReceived={completedOrder.paymentReceived}
                change={completedOrder.change}
                timestamp={completedOrder.timestamp}
            />
        );
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-0 text-slate-900 dark:text-white">
                <DialogHeader className="border-b border-slate-200 dark:border-slate-800 p-6">
                    <DialogTitle className="flex items-center gap-3 text-xl text-slate-900 dark:text-white">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                            <Calculator className="h-5 w-5 text-white" />
                        </div>
                        {t('payment')}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 p-6">
                    {/* Order Summary */}
                    <div>
                        <h3 className="mb-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                            {t('orderSummary')}
                        </h3>
                        <ScrollArea className="max-h-40 rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3">
                            <div className="space-y-2">
                                {items.map((item) => (
                                    <div
                                        key={item.product.id}
                                        className="flex justify-between text-sm"
                                    >
                                        <span className="text-slate-600 dark:text-slate-300">
                                            {item.quantity}x {item.product.name}
                                        </span>
                                        <span className="font-medium text-slate-900 dark:text-white">
                                            {formatCurrency(item.product.price * item.quantity)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                        <Separator className="my-3 bg-slate-200 dark:bg-slate-700" />
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500 dark:text-slate-400">{t('subtotal')}</span>
                                <span className="text-slate-900 dark:text-white">{formatCurrency(subtotal)}</span>
                            </div>
                            {settings.taxEnabled && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 dark:text-slate-400">{t('tax')} ({settings.taxRate}%)</span>
                                    <span className="text-slate-900 dark:text-white">{formatCurrency(taxAmount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg font-bold pt-2">
                                <span className="text-slate-900 dark:text-white">{t('total')}</span>
                                <span className="text-amber-600 dark:text-amber-400">{formatCurrency(total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Input */}
                    <div>
                        <h3 className="mb-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                            {t('paymentAmount')}
                        </h3>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">{currencySymbol}</span>
                            <Input
                                type="number"
                                step={currency === 'IDR' ? '1000' : '0.01'}
                                value={paymentInput}
                                onChange={(e) => setPaymentInput(e.target.value)}
                                placeholder={t('enterAmount')}
                                className="h-14 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 text-xl font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-amber-500 focus:ring-amber-500"
                            />
                        </div>

                        {/* Quick amounts */}
                        <div className="mt-3 flex flex-wrap gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleExactAmount}
                                className="border-amber-500/50 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                            >
                                {t('exact')}
                            </Button>
                            {quickAmounts.map((amount) => (
                                <Button
                                    key={amount}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleQuickAmount(amount)}
                                    className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                                >
                                    +{formatCurrency(amount)}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Change Display */}
                    <div
                        className={cn(
                            'rounded-lg p-4 text-center transition-colors',
                            canPay ? 'bg-emerald-500/10' : 'bg-slate-100 dark:bg-slate-800'
                        )}
                    >
                        <p className="text-sm text-slate-400">{t('change')}</p>
                        <p
                            className={cn(
                                'text-3xl font-bold',
                                canPay ? 'text-emerald-400' : 'text-red-400'
                            )}
                        >
                            {formatCurrency(change >= 0 ? change : 0)}
                        </p>
                        {!canPay && paymentAmount > 0 && (
                            <p className="mt-1 text-xs text-red-400">
                                {t('insufficient')} {formatCurrency(total - paymentAmount)}
                            </p>
                        )}
                    </div>

                    <Button
                        onClick={handlePayment}
                        disabled={!canPay || isProcessing}
                        className={cn(
                            'w-full py-6 text-lg font-bold transition-all duration-300',
                            canPay
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-orange-600'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                        )}
                    >
                        {isProcessing ? t('processing') : t('completePayment')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
