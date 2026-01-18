'use client';

import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/page-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Package, AlertTriangle } from 'lucide-react';
import { Ingredient } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { formatNumber } from '@/lib/format';
import { useCurrency } from '@/hooks/use-currency';
import {
    createIngredient,
    updateIngredient,
    deleteIngredient,
} from '@/app/actions/ingredients';

// Demo ingredients
const demoIngredients: Ingredient[] = [
    { id: '1', name: 'Biji Espresso', unit: 'gr', current_stock: 5000, cost_per_unit: 150, min_stock: 500, created_at: '', updated_at: '' },
    { id: '2', name: 'Susu Full Cream', unit: 'ml', current_stock: 10000, cost_per_unit: 25, min_stock: 2000, created_at: '', updated_at: '' },
    { id: '3', name: 'Susu Oat', unit: 'ml', current_stock: 5000, cost_per_unit: 50, min_stock: 1000, created_at: '', updated_at: '' },
    { id: '4', name: 'Sirup Vanilla', unit: 'ml', current_stock: 200, cost_per_unit: 100, min_stock: 200, created_at: '', updated_at: '' },
    { id: '5', name: 'Sirup Caramel', unit: 'ml', current_stock: 2000, cost_per_unit: 100, min_stock: 200, created_at: '', updated_at: '' },
    { id: '6', name: 'Bubuk Coklat', unit: 'gr', current_stock: 2000, cost_per_unit: 150, min_stock: 300, created_at: '', updated_at: '' },
    { id: '7', name: 'Bubuk Matcha', unit: 'gr', current_stock: 50, cost_per_unit: 750, min_stock: 100, created_at: '', updated_at: '' },
];

export default function InventoryPage() {
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        unit: 'gr' as 'ml' | 'gr' | 'pcs',
        current_stock: 0,
        cost_per_unit: 0,
        min_stock: 0,
    });
    const { formatCurrency } = useCurrency();

    useEffect(() => {
        fetchIngredients();
    }, []);

    async function fetchIngredients() {
        if (!supabase) {
            setIngredients(demoIngredients);
            setIsLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('ingredients')
                .select('*')
                .order('name');

            if (error || !data) {
                setIngredients(demoIngredients);
            } else {
                setIngredients(data);
            }
        } catch {
            setIngredients(demoIngredients);
        } finally {
            setIsLoading(false);
        }
    }

    function openAddDialog() {
        setEditingIngredient(null);
        setFormData({
            name: '',
            unit: 'gr',
            current_stock: 0,
            cost_per_unit: 0,
            min_stock: 0,
        });
        setIsDialogOpen(true);
    }

    function openEditDialog(ingredient: Ingredient) {
        setEditingIngredient(ingredient);
        setFormData({
            name: ingredient.name,
            unit: ingredient.unit,
            current_stock: ingredient.current_stock,
            cost_per_unit: ingredient.cost_per_unit,
            min_stock: ingredient.min_stock,
        });
        setIsDialogOpen(true);
    }

    async function handleSubmit() {
        if (editingIngredient) {
            const result = await updateIngredient(editingIngredient.id, formData);
            if (result.success) {
                fetchIngredients();
            }
        } else {
            const result = await createIngredient(formData);
            if (result.success) {
                fetchIngredients();
            }
        }
        setIsDialogOpen(false);
    }

    async function handleDelete(id: string) {
        if (confirm('Apakah Anda yakin ingin menghapus bahan ini?')) {
            const result = await deleteIngredient(id);
            if (result.success) {
                fetchIngredients();
            }
        }
    }

    const lowStockCount = ingredients.filter(
        (i) => i.current_stock <= i.min_stock
    ).length;

    return (
        <PageLayout
            title="Inventaris"
            description="Kelola bahan baku dan stok"
            actions={
                <Button
                    onClick={openAddDialog}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Bahan
                </Button>
            }
        >
            {/* Stats Cards */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20">
                            <Package className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Total Bahan</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{ingredients.length}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/20">
                            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Stok Rendah</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{lowStockCount}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
                            <Package className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Total Nilai</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                {formatCurrency(ingredients.reduce((sum, i) => sum + i.current_stock * i.cost_per_unit, 0))}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50">
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <TableHead className="text-slate-500 dark:text-slate-400">Nama</TableHead>
                            <TableHead className="text-slate-500 dark:text-slate-400">Satuan</TableHead>
                            <TableHead className="text-slate-500 dark:text-slate-400">Stok Saat Ini</TableHead>
                            <TableHead className="text-slate-500 dark:text-slate-400">Stok Minimum</TableHead>
                            <TableHead className="text-slate-500 dark:text-slate-400">Harga/Satuan</TableHead>
                            <TableHead className="text-slate-500 dark:text-slate-400">Status</TableHead>
                            <TableHead className="text-right text-slate-500 dark:text-slate-400">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-slate-500 dark:text-slate-400">
                                    Memuat...
                                </TableCell>
                            </TableRow>
                        ) : ingredients.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-slate-500 dark:text-slate-400">
                                    Tidak ada bahan ditemukan
                                </TableCell>
                            </TableRow>
                        ) : (
                            ingredients.map((ingredient) => {
                                const isLowStock = ingredient.current_stock <= ingredient.min_stock;
                                return (
                                    <TableRow
                                        key={ingredient.id}
                                        className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                    >
                                        <TableCell className="font-medium text-slate-900 dark:text-white">
                                            {ingredient.name}
                                        </TableCell>
                                        <TableCell className="text-slate-600 dark:text-slate-300">{ingredient.unit}</TableCell>
                                        <TableCell className="text-slate-600 dark:text-slate-300">
                                            {formatNumber(ingredient.current_stock)}
                                        </TableCell>
                                        <TableCell className="text-slate-600 dark:text-slate-300">
                                            {formatNumber(ingredient.min_stock)}
                                        </TableCell>
                                        <TableCell className="text-slate-600 dark:text-slate-300">
                                            {formatCurrency(ingredient.cost_per_unit)}
                                        </TableCell>
                                        <TableCell>
                                            {isLowStock ? (
                                                <Badge className="bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30">
                                                    Stok Rendah
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                                                    Tersedia
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openEditDialog(ingredient)}
                                                    className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(ingredient.id)}
                                                    className="text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    <DialogHeader>
                        <DialogTitle className="text-slate-900 dark:text-white">
                            {editingIngredient ? 'Edit Bahan' : 'Tambah Bahan'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-slate-600 dark:text-slate-300">Nama</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="unit" className="text-slate-600 dark:text-slate-300">Satuan</Label>
                            <Select
                                value={formData.unit}
                                onValueChange={(value: 'ml' | 'gr' | 'pcs') =>
                                    setFormData({ ...formData, unit: value })
                                }
                            >
                                <SelectTrigger className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                                    <SelectItem value="gr">Gram (gr)</SelectItem>
                                    <SelectItem value="ml">Mililiter (ml)</SelectItem>
                                    <SelectItem value="pcs">Buah (pcs)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="current_stock" className="text-slate-600 dark:text-slate-300">Stok Saat Ini</Label>
                                <Input
                                    id="current_stock"
                                    type="number"
                                    value={formData.current_stock}
                                    onChange={(e) =>
                                        setFormData({ ...formData, current_stock: parseFloat(e.target.value) || 0 })
                                    }
                                    className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="min_stock" className="text-slate-600 dark:text-slate-300">Stok Minimum</Label>
                                <Input
                                    id="min_stock"
                                    type="number"
                                    value={formData.min_stock}
                                    onChange={(e) =>
                                        setFormData({ ...formData, min_stock: parseFloat(e.target.value) || 0 })
                                    }
                                    className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="cost_per_unit" className="text-slate-600 dark:text-slate-300">Harga per Satuan (Rp)</Label>
                            <Input
                                id="cost_per_unit"
                                type="number"
                                step="100"
                                value={formData.cost_per_unit}
                                onChange={(e) =>
                                    setFormData({ ...formData, cost_per_unit: parseFloat(e.target.value) || 0 })
                                }
                                className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                            className="border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300"
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                        >
                            {editingIngredient ? 'Simpan' : 'Tambah Bahan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </PageLayout>
    );
}
