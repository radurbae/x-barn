'use client';

import { useSettingsStore } from '@/stores/settings-store';
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
import { useState } from 'react';

export default function SettingsPage() {
    const { settings, updateSettings } = useSettingsStore();
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    async function handleSave() {
        setIsSaving(true);
        await new Promise((resolve) => setTimeout(resolve, 300));
        setSaveMessage('Pengaturan berhasil disimpan!');
        setIsSaving(false);
        setTimeout(() => setSaveMessage(''), 3000);
    }

    const isConnected = !!supabase;

    return (
        <PageLayout
            title="Pengaturan"
            description="Konfigurasi sistem kasir Anda"
            actions={
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
                >
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Menyimpan...' : 'Simpan'}
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
                            <h2 className="text-lg font-semibold text-white">Detail Toko</h2>
                            <p className="text-sm text-slate-400">Informasi dasar toko</p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-6">
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="shopName" className="text-slate-300">
                                    Nama Toko
                                </Label>
                                <Input
                                    id="shopName"
                                    value={settings.shopName}
                                    onChange={(e) => updateSettings({ shopName: e.target.value })}
                                    className="border-slate-700 bg-slate-800 text-white"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="currency" className="text-slate-300">
                                    Mata Uang
                                </Label>
                                <Select
                                    value={settings.currency}
                                    onValueChange={(value) => updateSettings({ currency: value })}
                                >
                                    <SelectTrigger className="border-slate-700 bg-slate-800 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="border-slate-700 bg-slate-800">
                                        <SelectItem value="IDR">IDR (Rp)</SelectItem>
                                        <SelectItem value="USD">USD ($)</SelectItem>
                                        <SelectItem value="EUR">EUR (€)</SelectItem>
                                        <SelectItem value="GBP">GBP (£)</SelectItem>
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
                            <h2 className="text-lg font-semibold text-white">Pengaturan Pajak</h2>
                            <p className="text-sm text-slate-400">Konfigurasi pajak penjualan</p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-6">
                        <div className="grid gap-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-slate-300">Aktifkan Pajak</Label>
                                    <p className="text-sm text-slate-500">
                                        Terapkan pajak ke semua pesanan
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.taxEnabled}
                                    onCheckedChange={(checked) => updateSettings({ taxEnabled: checked })}
                                />
                            </div>

                            {settings.taxEnabled && (
                                <div className="grid gap-2">
                                    <Label htmlFor="taxRate" className="text-slate-300">
                                        Tarif Pajak (%)
                                    </Label>
                                    <Input
                                        id="taxRate"
                                        type="number"
                                        step="0.1"
                                        value={settings.taxRate}
                                        onChange={(e) =>
                                            updateSettings({ taxRate: parseFloat(e.target.value) || 0 })
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
                            <h2 className="text-lg font-semibold text-white">Pengaturan Struk</h2>
                            <p className="text-sm text-slate-400">Kustomisasi pesan struk</p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-6">
                        <div className="grid gap-2">
                            <Label htmlFor="receiptFooter" className="text-slate-300">
                                Pesan Footer Struk
                            </Label>
                            <Input
                                id="receiptFooter"
                                value={settings.receiptFooter}
                                onChange={(e) => updateSettings({ receiptFooter: e.target.value })}
                                className="border-slate-700 bg-slate-800 text-white"
                                placeholder="Pesan terima kasih..."
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
                            <h2 className="text-lg font-semibold text-white">Tampilan</h2>
                            <p className="text-sm text-slate-400">Pengaturan tampilan</p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-slate-300">Mode Gelap</Label>
                                <p className="text-sm text-slate-500">
                                    Gunakan tema gelap (disarankan)
                                </p>
                            </div>
                            <Switch
                                checked={settings.darkMode}
                                onCheckedChange={(checked) => updateSettings({ darkMode: checked })}
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
                            <p className="text-sm text-slate-400">Status koneksi Supabase</p>
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
                                    {isConnected ? 'Terhubung' : 'Mode Demo'}
                                </p>
                                <p className="text-sm text-slate-400">
                                    {isConnected
                                        ? 'Database Supabase terhubung'
                                        : 'Berjalan dengan data demo. Konfigurasi .env.local untuk fungsionalitas penuh.'}
                                </p>
                            </div>
                        </div>

                        {!isConnected && (
                            <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-500/10 p-3">
                                <AlertCircle className="mt-0.5 h-4 w-4 text-amber-400" />
                                <div className="text-sm text-amber-400">
                                    <p className="font-medium">Pengaturan Diperlukan</p>
                                    <p className="mt-1 text-amber-400/80">
                                        Atur <code className="rounded bg-amber-500/20 px-1">NEXT_PUBLIC_SUPABASE_URL</code> dan{' '}
                                        <code className="rounded bg-amber-500/20 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> di file .env.local Anda.
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
