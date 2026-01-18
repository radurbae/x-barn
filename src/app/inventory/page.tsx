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
import {
    createIngredient,
    updateIngredient,
    deleteIngredient,
} from '@/app/actions/ingredients';

// Demo ingredients
const demoIngredients: Ingredient[] = [
    { id: '1', name: 'Espresso Beans', unit: 'gr', current_stock: 5000, cost_per_unit: 0.15, min_stock: 500, created_at: '', updated_at: '' },
    { id: '2', name: 'Whole Milk', unit: 'ml', current_stock: 10000, cost_per_unit: 0.005, min_stock: 2000, created_at: '', updated_at: '' },
    { id: '3', name: 'Oat Milk', unit: 'ml', current_stock: 5000, cost_per_unit: 0.01, min_stock: 1000, created_at: '', updated_at: '' },
    { id: '4', name: 'Vanilla Syrup', unit: 'ml', current_stock: 200, cost_per_unit: 0.02, min_stock: 200, created_at: '', updated_at: '' },
    { id: '5', name: 'Caramel Syrup', unit: 'ml', current_stock: 2000, cost_per_unit: 0.02, min_stock: 200, created_at: '', updated_at: '' },
    { id: '6', name: 'Chocolate Powder', unit: 'gr', current_stock: 2000, cost_per_unit: 0.03, min_stock: 300, created_at: '', updated_at: '' },
    { id: '7', name: 'Matcha Powder', unit: 'gr', current_stock: 50, cost_per_unit: 0.15, min_stock: 100, created_at: '', updated_at: '' },
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
        if (confirm('Are you sure you want to delete this ingredient?')) {
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
            title="Inventory"
            description="Manage your ingredients and stock levels"
            actions={
                <Button
                    onClick={openAddDialog}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Ingredient
                </Button>
            }
        >
            {/* Stats Cards */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20">
                            <Package className="h-5 w-5 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Total Ingredients</p>
                            <p className="text-2xl font-bold text-white">{ingredients.length}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/20">
                            <AlertTriangle className="h-5 w-5 text-red-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Low Stock Items</p>
                            <p className="text-2xl font-bold text-white">{lowStockCount}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
                            <Package className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Total Value</p>
                            <p className="text-2xl font-bold text-white">
                                ${ingredients.reduce((sum, i) => sum + i.current_stock * i.cost_per_unit, 0).toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-slate-800 bg-slate-800/50">
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-700 hover:bg-slate-800/50">
                            <TableHead className="text-slate-400">Name</TableHead>
                            <TableHead className="text-slate-400">Unit</TableHead>
                            <TableHead className="text-slate-400">Current Stock</TableHead>
                            <TableHead className="text-slate-400">Min Stock</TableHead>
                            <TableHead className="text-slate-400">Cost/Unit</TableHead>
                            <TableHead className="text-slate-400">Status</TableHead>
                            <TableHead className="text-right text-slate-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-slate-400">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : ingredients.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-slate-400">
                                    No ingredients found
                                </TableCell>
                            </TableRow>
                        ) : (
                            ingredients.map((ingredient) => {
                                const isLowStock = ingredient.current_stock <= ingredient.min_stock;
                                return (
                                    <TableRow
                                        key={ingredient.id}
                                        className="border-slate-700 hover:bg-slate-800/50"
                                    >
                                        <TableCell className="font-medium text-white">
                                            {ingredient.name}
                                        </TableCell>
                                        <TableCell className="text-slate-300">{ingredient.unit}</TableCell>
                                        <TableCell className="text-slate-300">
                                            {ingredient.current_stock.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-slate-300">
                                            {ingredient.min_stock.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-slate-300">
                                            ${ingredient.cost_per_unit.toFixed(3)}
                                        </TableCell>
                                        <TableCell>
                                            {isLowStock ? (
                                                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                                                    Low Stock
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                                    In Stock
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openEditDialog(ingredient)}
                                                    className="text-slate-400 hover:text-white"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(ingredient.id)}
                                                    className="text-slate-400 hover:text-red-400"
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
                <DialogContent className="border-slate-800 bg-slate-900">
                    <DialogHeader>
                        <DialogTitle className="text-white">
                            {editingIngredient ? 'Edit Ingredient' : 'Add Ingredient'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-slate-300">Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="border-slate-700 bg-slate-800 text-white"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="unit" className="text-slate-300">Unit</Label>
                            <Select
                                value={formData.unit}
                                onValueChange={(value: 'ml' | 'gr' | 'pcs') =>
                                    setFormData({ ...formData, unit: value })
                                }
                            >
                                <SelectTrigger className="border-slate-700 bg-slate-800 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="border-slate-700 bg-slate-800">
                                    <SelectItem value="gr">Grams (gr)</SelectItem>
                                    <SelectItem value="ml">Milliliters (ml)</SelectItem>
                                    <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="current_stock" className="text-slate-300">Current Stock</Label>
                                <Input
                                    id="current_stock"
                                    type="number"
                                    value={formData.current_stock}
                                    onChange={(e) =>
                                        setFormData({ ...formData, current_stock: parseFloat(e.target.value) || 0 })
                                    }
                                    className="border-slate-700 bg-slate-800 text-white"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="min_stock" className="text-slate-300">Min Stock</Label>
                                <Input
                                    id="min_stock"
                                    type="number"
                                    value={formData.min_stock}
                                    onChange={(e) =>
                                        setFormData({ ...formData, min_stock: parseFloat(e.target.value) || 0 })
                                    }
                                    className="border-slate-700 bg-slate-800 text-white"
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="cost_per_unit" className="text-slate-300">Cost per Unit ($)</Label>
                            <Input
                                id="cost_per_unit"
                                type="number"
                                step="0.001"
                                value={formData.cost_per_unit}
                                onChange={(e) =>
                                    setFormData({ ...formData, cost_per_unit: parseFloat(e.target.value) || 0 })
                                }
                                className="border-slate-700 bg-slate-800 text-white"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                            className="border-slate-700 text-slate-300"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                        >
                            {editingIngredient ? 'Save Changes' : 'Add Ingredient'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </PageLayout>
    );
}
