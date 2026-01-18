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
import { useTranslation } from '@/hooks/use-translation';

export default function SettingsPage() {
    const { settings, updateSettings } = useSettingsStore();
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const { t, language } = useTranslation();

    async function handleSave() {
        setIsSaving(true);
        await new Promise((resolve) => setTimeout(resolve, 300));
        setSaveMessage(t('settingsSaved'));
        setIsSaving(false);
        setTimeout(() => setSaveMessage(''), 3000);
    }

    const isConnected = !!supabase;

    return (
        <PageLayout
            title={t('settings')}
            description={t('configurePos')}
            actions={
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
                >
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? t('saving') : t('save')}
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
                            <h2 className="text-lg font-semibold text-white">{t('shopDetails')}</h2>
                            <p className="text-sm text-slate-400">{t('basicInfo')}</p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-6">
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="shopName" className="text-slate-300">
                                    {t('shopName')}
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
                                    {t('currency')} ({language === 'id' ? 'Bahasa Indonesia' : 'English'})
                                </Label>
                                <Select
                                    value={settings.currency}
                                    onValueChange={(value) => updateSettings({ currency: value })}
                                >
                                    <SelectTrigger className="border-slate-700 bg-slate-800 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="border-slate-700 bg-slate-800">
                                        <SelectItem value="IDR">🇮🇩 IDR (Rp) - Bahasa Indonesia</SelectItem>
                                        <SelectItem value="USD">🇺🇸 USD ($) - English</SelectItem>
                                        <SelectItem value="EUR">🇪🇺 EUR (€) - English</SelectItem>
                                        <SelectItem value="GBP">🇬🇧 GBP (£) - English</SelectItem>
                                        <SelectItem value="JPY">🇯🇵 JPY (¥) - English</SelectItem>
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
                            <h2 className="text-lg font-semibold text-white">{t('taxSettings')}</h2>
                            <p className="text-sm text-slate-400">{t('configureTax')}</p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-6">
                        <div className="grid gap-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-slate-300">{t('enableTax')}</Label>
                                    <p className="text-sm text-slate-500">
                                        {t('applyTax')}
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
                                        {t('taxRate')} (%)
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
                            <h2 className="text-lg font-semibold text-white">{t('receiptSettings')}</h2>
                            <p className="text-sm text-slate-400">{t('customizeReceipt')}</p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-6">
                        <div className="grid gap-2">
                            <Label htmlFor="receiptFooter" className="text-slate-300">
                                {t('receiptFooter')}
                            </Label>
                            <Input
                                id="receiptFooter"
                                value={settings.receiptFooter}
                                onChange={(e) => updateSettings({ receiptFooter: e.target.value })}
                                className="border-slate-700 bg-slate-800 text-white"
                                placeholder={t('thankYouMessage')}
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
                            <h2 className="text-lg font-semibold text-white">{t('display')}</h2>
                            <p className="text-sm text-slate-400">{t('displaySettings')}</p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-slate-300">{t('darkMode')}</Label>
                                <p className="text-sm text-slate-500">
                                    {t('useDarkTheme')}
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
                            <h2 className="text-lg font-semibold text-white">{t('database')}</h2>
                            <p className="text-sm text-slate-400">{t('connectionStatus')}</p>
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
                                    {isConnected ? t('connected') : t('demoMode')}
                                </p>
                                <p className="text-sm text-slate-400">
                                    {isConnected
                                        ? t('dbConnected')
                                        : t('runningDemo')}
                                </p>
                            </div>
                        </div>

                        {!isConnected && (
                            <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-500/10 p-3">
                                <AlertCircle className="mt-0.5 h-4 w-4 text-amber-400" />
                                <div className="text-sm text-amber-400">
                                    <p className="font-medium">{t('setupRequired')}</p>
                                    <p className="mt-1 text-amber-400/80">
                                        {t('setEnvVars')} <code className="rounded bg-amber-500/20 px-1">NEXT_PUBLIC_SUPABASE_URL</code> {language === 'id' ? 'dan' : 'and'}{' '}
                                        <code className="rounded bg-amber-500/20 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> {t('inEnvFile')}
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
