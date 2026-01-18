'use client';

import { useState } from 'react';
import { useCartStore } from '@/stores/cart-store';
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
import { CheckCircle2, DollarSign, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckoutDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onComplete: (paymentReceived: number) => void;
}

// Quick amount buttons
const quickAmounts = [5, 10, 20, 50, 100];

export function CheckoutDialog({
    open,
    onOpenChange,
    onComplete,
}: CheckoutDialogProps) {
    const { items, getTotal, clearCart } = useCartStore();
    const [paymentInput, setPaymentInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    const total = getTotal();
    const paymentAmount = parseFloat(paymentInput) || 0;
    const change = paymentAmount - total;
    const canPay = paymentAmount >= total;

    const handleQuickAmount = (amount: number) => {
        setPaymentInput((prev) => {
            const current = parseFloat(prev) || 0;
            return (current + amount).toString();
        });
    };

    const handleExactAmount = () => {
        setPaymentInput(total.toFixed(2));
    };

    const handlePayment = async () => {
        if (!canPay) return;

        setIsProcessing(true);

        // Simulate payment processing
        await new Promise((resolve) => setTimeout(resolve, 500));

        setIsProcessing(false);
        setIsComplete(true);

        // Call complete handler (this would save to database)
        onComplete(paymentAmount);

        // Reset after a delay
        setTimeout(() => {
            clearCart();
            setPaymentInput('');
            setIsComplete(false);
            onOpenChange(false);
        }, 2000);
    };

    const handleClose = () => {
        if (!isComplete && !isProcessing) {
            setPaymentInput('');
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-lg border-slate-800 bg-slate-900 p-0">
                {isComplete ? (
                    // Success state
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/25">
                            <CheckCircle2 className="h-10 w-10 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Payment Complete!</h2>
                        <p className="mt-2 text-slate-400">
                            Change: <span className="font-bold text-emerald-400">${change.toFixed(2)}</span>
                        </p>
                    </div>
                ) : (
                    <>
                        <DialogHeader className="border-b border-slate-800 p-6">
                            <DialogTitle className="flex items-center gap-3 text-xl text-white">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                                    <Calculator className="h-5 w-5 text-white" />
                                </div>
                                Checkout
                            </DialogTitle>
                        </DialogHeader>

                        <div className="grid gap-6 p-6">
                            {/* Order Summary */}
                            <div>
                                <h3 className="mb-3 text-sm font-medium text-slate-400">
                                    Order Summary
                                </h3>
                                <ScrollArea className="max-h-40 rounded-lg bg-slate-800/50 p-3">
                                    <div className="space-y-2">
                                        {items.map((item) => (
                                            <div
                                                key={item.product.id}
                                                className="flex justify-between text-sm"
                                            >
                                                <span className="text-slate-300">
                                                    {item.quantity}x {item.product.name}
                                                </span>
                                                <span className="font-medium text-white">
                                                    ${(item.product.price * item.quantity).toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                                <Separator className="my-3 bg-slate-700" />
                                <div className="flex justify-between text-lg font-bold">
                                    <span className="text-white">Total</span>
                                    <span className="text-amber-400">${total.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Payment Input */}
                            <div>
                                <h3 className="mb-3 text-sm font-medium text-slate-400">
                                    Payment Amount
                                </h3>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={paymentInput}
                                        onChange={(e) => setPaymentInput(e.target.value)}
                                        placeholder="Enter amount..."
                                        className="h-14 border-slate-700 bg-slate-800 pl-10 text-xl font-bold text-white placeholder:text-slate-500 focus:border-amber-500 focus:ring-amber-500"
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
                                        Exact
                                    </Button>
                                    {quickAmounts.map((amount) => (
                                        <Button
                                            key={amount}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleQuickAmount(amount)}
                                            className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                                        >
                                            +${amount}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Change Display */}
                            <div
                                className={cn(
                                    'rounded-lg p-4 text-center transition-colors',
                                    canPay ? 'bg-emerald-500/10' : 'bg-slate-800'
                                )}
                            >
                                <p className="text-sm text-slate-400">Change Due</p>
                                <p
                                    className={cn(
                                        'text-3xl font-bold',
                                        canPay ? 'text-emerald-400' : 'text-red-400'
                                    )}
                                >
                                    ${change >= 0 ? change.toFixed(2) : '0.00'}
                                </p>
                                {!canPay && paymentAmount > 0 && (
                                    <p className="mt-1 text-xs text-red-400">
                                        Insufficient amount (need ${(total - paymentAmount).toFixed(2)} more)
                                    </p>
                                )}
                            </div>

                            {/* Pay Button */}
                            <Button
                                onClick={handlePayment}
                                disabled={!canPay || isProcessing}
                                className={cn(
                                    'w-full py-6 text-lg font-bold transition-all duration-300',
                                    canPay
                                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-orange-600'
                                        : 'bg-slate-800 text-slate-500'
                                )}
                            >
                                {isProcessing ? 'Processing...' : 'Complete Payment'}
                            </Button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
