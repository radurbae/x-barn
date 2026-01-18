'use client';

import { useState, useEffect } from 'react';
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
    RotateCcw,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { translations, getLanguageFromCurrency } from '@/lib/translations';

// Draft settings type
interface DraftSettings {
    shopName: string;
    currency: string;
    taxRate: number;
    taxEnabled: boolean;
    receiptFooter: string;
    darkMode: boolean;
}

export default function SettingsPage() {
    const { settings, updateSettings } = useSettingsStore();
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [hasChanges, setHasChanges] = useState(false);

    // Draft state - local copy that doesn't affect the app until saved
    const [draft, setDraft] = useState<DraftSettings>({
        shopName: settings.shopName,
        currency: settings.currency,
        taxRate: settings.taxRate,
        taxEnabled: settings.taxEnabled,
        receiptFooter: settings.receiptFooter,
        darkMode: settings.darkMode,
    });

    // Get language based on draft currency for preview
    const draftLanguage = getLanguageFromCurrency(draft.currency);
    const t = (key: keyof typeof translations.id) => translations[draftLanguage][key];

    // Check if draft differs from saved settings
    useEffect(() => {
        const changed =
            draft.shopName !== settings.shopName ||
            draft.currency !== settings.currency ||
            draft.taxRate !== settings.taxRate ||
            draft.taxEnabled !== settings.taxEnabled ||
            draft.receiptFooter !== settings.receiptFooter ||
            draft.darkMode !== settings.darkMode;
        setHasChanges(changed);
    }, [draft, settings]);

    // Reset draft when settings change externally
    useEffect(() => {
        setDraft({
            shopName: settings.shopName,
            currency: settings.currency,
            taxRate: settings.taxRate,
            taxEnabled: settings.taxEnabled,
            receiptFooter: settings.receiptFooter,
            darkMode: settings.darkMode,
        });
    }, [settings]);

    function updateDraft(updates: Partial<DraftSettings>) {
        setDraft(prev => ({ ...prev, ...updates }));
    }

    async function handleSave() {
        setIsSaving(true);
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Apply all draft changes to the real settings
        updateSettings(draft);

        setSaveMessage(t('settingsSaved'));
        setIsSaving(false);
        setHasChanges(false);
        setTimeout(() => setSaveMessage(''), 3000);
    }

    function handleReset() {
        setDraft({
            shopName: settings.shopName,
            currency: settings.currency,
            taxRate: settings.taxRate,
            taxEnabled: settings.taxEnabled,
            receiptFooter: settings.receiptFooter,
            darkMode: settings.darkMode,
        });
        setHasChanges(false);
    }

    const isConnected = !!supabase;

    return (
        <PageLayout
            title={t('settings')}
            description={t('configurePos')}
            actions={
                <div className="flex items-center gap-2">
                    {hasChanges && (
                        <Button
                            variant="outline"
                            onClick={handleReset}
                            className="border-slate-700 text-slate-300"
                        >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            {t('cancel')}
                        </Button>
                    )}
                    <Button
                        onClick={handleSave}
                        disabled={isSaving || !hasChanges}
                        className={hasChanges
                            ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-400 cursor-not-allowed"
                        }
                    >
                        <Save className="mr-2 h-4 w-4" />
                        {isSaving ? t('saving') : t('save')}
                    </Button>
                </div>
            }
        >
            {saveMessage && (
                <div className="mb-6 rounded-lg bg-emerald-500/20 p-4 text-emerald-400">
                    {saveMessage}
                </div>
            )}

            {hasChanges && (
                <div className="mb-6 rounded-lg bg-amber-500/20 p-4 text-amber-400 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {draftLanguage === 'id' ? 'Ada perubahan yang belum disimpan' : 'You have unsaved changes'}
                </div>
            )}

            <div className="max-w-2xl space-y-8">
                {/* Shop Details */}
                <section>
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20">
                            <Store className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('shopDetails')}</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{t('basicInfo')}</p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 p-6">
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="shopName" className="text-slate-600 dark:text-slate-300">
                                    {t('shopName')}
                                </Label>
                                <Input
                                    id="shopName"
                                    value={draft.shopName}
                                    onChange={(e) => updateDraft({ shopName: e.target.value })}
                                    className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="currency" className="text-slate-600 dark:text-slate-300">
                                    {t('currency')} ({draftLanguage === 'id' ? 'Bahasa Indonesia' : 'English'})
                                </Label>
                                <Select
                                    value={draft.currency}
                                    onValueChange={(value) => updateDraft({ currency: value })}
                                >
                                    <SelectTrigger className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
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

                <Separator className="bg-slate-200 dark:bg-slate-800" />

                {/* Tax Settings */}
                <section>
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                            <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('taxSettings')}</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{t('configureTax')}</p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 p-6">
                        <div className="grid gap-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-slate-600 dark:text-slate-300">{t('enableTax')}</Label>
                                    <p className="text-sm text-slate-500">{t('applyTax')}</p>
                                </div>
                                <Switch
                                    checked={draft.taxEnabled}
                                    onCheckedChange={(checked) => updateDraft({ taxEnabled: checked })}
                                />
                            </div>

                            {draft.taxEnabled && (
                                <div className="grid gap-2">
                                    <Label htmlFor="taxRate" className="text-slate-600 dark:text-slate-300">
                                        {t('taxRate')} (%)
                                    </Label>
                                    <Input
                                        id="taxRate"
                                        type="number"
                                        step="0.1"
                                        value={draft.taxRate}
                                        onChange={(e) =>
                                            updateDraft({ taxRate: parseFloat(e.target.value) || 0 })
                                        }
                                        className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <Separator className="bg-slate-200 dark:bg-slate-800" />

                {/* Receipt Settings */}
                <section>
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
                            <Receipt className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('receiptSettings')}</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{t('customizeReceipt')}</p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 p-6">
                        <div className="grid gap-2">
                            <Label htmlFor="receiptFooter" className="text-slate-600 dark:text-slate-300">
                                {t('receiptFooter')}
                            </Label>
                            <Input
                                id="receiptFooter"
                                value={draft.receiptFooter}
                                onChange={(e) => updateDraft({ receiptFooter: e.target.value })}
                                className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                placeholder={t('thankYouMessage')}
                            />
                        </div>
                    </div>
                </section>

                <Separator className="bg-slate-200 dark:bg-slate-800" />

                {/* Display Settings */}
                <section>
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
                            <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('display')}</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{t('displaySettings')}</p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-slate-600 dark:text-slate-300">{t('darkMode')}</Label>
                                <p className="text-sm text-slate-500">
                                    {t('useDarkTheme')}
                                </p>
                            </div>
                            <Switch
                                checked={draft.darkMode}
                                onCheckedChange={(checked) => updateDraft({ darkMode: checked })}
                            />
                        </div>
                    </div>
                </section>

                <Separator className="bg-slate-200 dark:bg-slate-800" />

                {/* Database Status */}
                <section>
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-500/20">
                            <Database className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('database')}</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{t('connectionStatus')}</p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 p-6">
                        <div className="flex items-center gap-3">
                            <div
                                className={`h-3 w-3 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'
                                    }`}
                            />
                            <div>
                                <p className="font-medium text-slate-900 dark:text-white">
                                    {isConnected ? t('connected') : t('demoMode')}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {isConnected
                                        ? t('dbConnected')
                                        : t('runningDemo')}
                                </p>
                            </div>
                        </div>

                        {!isConnected && (
                            <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-500/10 p-3">
                                <AlertCircle className="mt-0.5 h-4 w-4 text-amber-600 dark:text-amber-400" />
                                <div className="text-sm text-amber-600 dark:text-amber-400">
                                    <p className="font-medium">{t('setupRequired')}</p>
                                    <p className="mt-1 text-amber-600/80 dark:text-amber-400/80">
                                        {t('setEnvVars')} <code className="rounded bg-amber-500/20 px-1">NEXT_PUBLIC_SUPABASE_URL</code> {draftLanguage === 'id' ? 'dan' : 'and'}{' '}
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
