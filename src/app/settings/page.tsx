'use client';

import { useState } from 'react';
import { PageLayout } from '@/components/page-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Store,
    DollarSign,
    Receipt,
    Database,
    Palette,
    Save,
    AlertCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        shopName: 'Barn Coffee',
        currency: 'USD',
        taxRate: 0,
        taxEnabled: false,
        receiptFooter: 'Thank you for your visit!',
        darkMode: true,
    });

    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    async function handleSave() {
        setIsSaving(true);
        // Simulate save
        await new Promise((resolve) => setTimeout(resolve, 500));
        setSaveMessage('Settings saved successfully!');
        setIsSaving(false);
        setTimeout(() => setSaveMessage(''), 3000);
    }

    const isConnected = !!supabase;

    return (
        <PageLayout
            title="Settings"
            description="Configure your POS system"
            actions={
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
                >
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
            }
        >
            {saveMessage && (
                <div className="mb-6 rounded-lg bg-emerald-500/20 p-4 text-emerald-400">
                    {saveMessage}
                </div>
            )}

            <div className="max-w-2xl space-y-8">
                {/* Shop Details */}
                <section>
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20">
                            <Store className="h-5 w-5 text-amber-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Shop Details</h2>
                            <p className="text-sm text-slate-400">Basic shop information</p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-6">
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="shopName" className="text-slate-300">
                                    Shop Name
                                </Label>
                                <Input
                                    id="shopName"
                                    value={settings.shopName}
                                    onChange={(e) =>
                                        setSettings({ ...settings, shopName: e.target.value })
                                    }
                                    className="border-slate-700 bg-slate-800 text-white"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="currency" className="text-slate-300">
                                    Currency
                                </Label>
                                <Select
                                    value={settings.currency}
                                    onValueChange={(value) =>
                                        setSettings({ ...settings, currency: value })
                                    }
                                >
                                    <SelectTrigger className="border-slate-700 bg-slate-800 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="border-slate-700 bg-slate-800">
                                        <SelectItem value="USD">USD ($)</SelectItem>
                                        <SelectItem value="EUR">EUR (€)</SelectItem>
                                        <SelectItem value="GBP">GBP (£)</SelectItem>
                                        <SelectItem value="IDR">IDR (Rp)</SelectItem>
                                        <SelectItem value="JPY">JPY (¥)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </section>

                <Separator className="bg-slate-800" />

                {/* Tax Settings */}
                <section>
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                            <DollarSign className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Tax Settings</h2>
                            <p className="text-sm text-slate-400">Configure sales tax</p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-6">
                        <div className="grid gap-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-slate-300">Enable Tax</Label>
                                    <p className="text-sm text-slate-500">
                                        Apply tax to all orders
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.taxEnabled}
                                    onCheckedChange={(checked) =>
                                        setSettings({ ...settings, taxEnabled: checked })
                                    }
                                />
                            </div>

                            {settings.taxEnabled && (
                                <div className="grid gap-2">
                                    <Label htmlFor="taxRate" className="text-slate-300">
                                        Tax Rate (%)
                                    </Label>
                                    <Input
                                        id="taxRate"
                                        type="number"
                                        step="0.1"
                                        value={settings.taxRate}
                                        onChange={(e) =>
                                            setSettings({
                                                ...settings,
                                                taxRate: parseFloat(e.target.value) || 0,
                                            })
                                        }
                                        className="border-slate-700 bg-slate-800 text-white"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <Separator className="bg-slate-800" />

                {/* Receipt Settings */}
                <section>
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
                            <Receipt className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Receipt Settings</h2>
                            <p className="text-sm text-slate-400">Customize receipt message</p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-6">
                        <div className="grid gap-2">
                            <Label htmlFor="receiptFooter" className="text-slate-300">
                                Receipt Footer Message
                            </Label>
                            <Input
                                id="receiptFooter"
                                value={settings.receiptFooter}
                                onChange={(e) =>
                                    setSettings({ ...settings, receiptFooter: e.target.value })
                                }
                                className="border-slate-700 bg-slate-800 text-white"
                                placeholder="Thank you message..."
                            />
                        </div>
                    </div>
                </section>

                <Separator className="bg-slate-800" />

                {/* Display Settings */}
                <section>
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
                            <Palette className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Display</h2>
                            <p className="text-sm text-slate-400">Appearance settings</p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-slate-300">Dark Mode</Label>
                                <p className="text-sm text-slate-500">
                                    Use dark theme (recommended)
                                </p>
                            </div>
                            <Switch
                                checked={settings.darkMode}
                                onCheckedChange={(checked) =>
                                    setSettings({ ...settings, darkMode: checked })
                                }
                            />
                        </div>
                    </div>
                </section>

                <Separator className="bg-slate-800" />

                {/* Database Status */}
                <section>
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-500/20">
                            <Database className="h-5 w-5 text-slate-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Database</h2>
                            <p className="text-sm text-slate-400">Supabase connection status</p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-6">
                        <div className="flex items-center gap-3">
                            <div
                                className={`h-3 w-3 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'
                                    }`}
                            />
                            <div>
                                <p className="font-medium text-white">
                                    {isConnected ? 'Connected' : 'Demo Mode'}
                                </p>
                                <p className="text-sm text-slate-400">
                                    {isConnected
                                        ? 'Supabase database is connected'
                                        : 'Running with demo data. Configure .env.local for full functionality.'}
                                </p>
                            </div>
                        </div>

                        {!isConnected && (
                            <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-500/10 p-3">
                                <AlertCircle className="mt-0.5 h-4 w-4 text-amber-400" />
                                <div className="text-sm text-amber-400">
                                    <p className="font-medium">Setup Required</p>
                                    <p className="mt-1 text-amber-400/80">
                                        Set <code className="rounded bg-amber-500/20 px-1">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
                                        <code className="rounded bg-amber-500/20 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in your .env.local file.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </PageLayout>
    );
}
