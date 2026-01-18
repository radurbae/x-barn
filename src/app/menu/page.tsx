'use client';

import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/page-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import { Plus, Pencil, Trash2, Coffee, DollarSign } from 'lucide-react';
import { Product } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import {
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductAvailability,
} from '@/app/actions/products';

// Demo products
const demoProducts: Product[] = [
    { id: '1', name: 'Espresso', price: 3.50, category: 'Coffee', image_url: null, description: 'Rich, bold single shot', is_available: true, created_at: '', updated_at: '' },
    { id: '2', name: 'Latte', price: 5.00, category: 'Coffee', image_url: null, description: 'Espresso with steamed milk', is_available: true, created_at: '', updated_at: '' },
    { id: '3', name: 'Cappuccino', price: 5.00, category: 'Coffee', image_url: null, description: 'Equal parts espresso, milk, foam', is_available: true, created_at: '', updated_at: '' },
    { id: '4', name: 'Iced Latte', price: 5.50, category: 'Iced', image_url: null, description: 'Chilled espresso with cold milk', is_available: true, created_at: '', updated_at: '' },
    { id: '5', name: 'Cold Brew', price: 5.00, category: 'Iced', image_url: null, description: '12-hour steeped cold coffee', is_available: false, created_at: '', updated_at: '' },
    { id: '6', name: 'Matcha Latte', price: 5.50, category: 'Non-Coffee', image_url: null, description: 'Japanese green tea with milk', is_available: true, created_at: '', updated_at: '' },
    { id: '7', name: 'Butter Croissant', price: 4.00, category: 'Food', image_url: null, description: 'Flaky French croissant', is_available: true, created_at: '', updated_at: '' },
];

const categories = ['Coffee', 'Iced', 'Non-Coffee', 'Food'];

export default function MenuPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        price: 0,
        category: 'Coffee',
        description: '',
        is_available: true,
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    async function fetchProducts() {
        if (!supabase) {
            setProducts(demoProducts);
            setIsLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('category')
                .order('name');

            if (error || !data) {
                setProducts(demoProducts);
            } else {
                setProducts(data);
            }
        } catch {
            setProducts(demoProducts);
        } finally {
            setIsLoading(false);
        }
    }

    function openAddDialog() {
        setEditingProduct(null);
        setFormData({
            name: '',
            price: 0,
            category: 'Coffee',
            description: '',
            is_available: true,
        });
        setIsDialogOpen(true);
    }

    function openEditDialog(product: Product) {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            price: product.price,
            category: product.category,
            description: product.description || '',
            is_available: product.is_available,
        });
        setIsDialogOpen(true);
    }

    async function handleSubmit() {
        if (editingProduct) {
            const result = await updateProduct(editingProduct.id, formData);
            if (result.success) {
                fetchProducts();
            }
        } else {
            const result = await createProduct({
                ...formData,
                image_url: null,
            } as Omit<Product, 'id' | 'created_at' | 'updated_at'>);
            if (result.success) {
                fetchProducts();
            }
        }
        setIsDialogOpen(false);
    }

    async function handleDelete(id: string) {
        if (confirm('Are you sure you want to delete this product?')) {
            const result = await deleteProduct(id);
            if (result.success) {
                fetchProducts();
            }
        }
    }

    async function handleToggleAvailability(id: string, isAvailable: boolean) {
        await toggleProductAvailability(id, isAvailable);
        fetchProducts();
    }

    const categoryColors: Record<string, string> = {
        Coffee: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        Iced: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        'Non-Coffee': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        Food: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    };

    // Group products by category
    const productsByCategory = categories.reduce((acc, category) => {
        acc[category] = products.filter((p) => p.category === category);
        return acc;
    }, {} as Record<string, Product[]>);

    return (
        <PageLayout
            title="Menu"
            description="Manage your products and pricing"
            actions={
                <Button
                    onClick={openAddDialog}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                </Button>
            }
        >
            {/* Stats */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20">
                            <Coffee className="h-5 w-5 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Total Products</p>
                            <p className="text-2xl font-bold text-white">{products.length}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
                            <Coffee className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Available</p>
                            <p className="text-2xl font-bold text-white">
                                {products.filter((p) => p.is_available).length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                            <DollarSign className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Avg. Price</p>
                            <p className="text-2xl font-bold text-white">
                                ${products.length > 0 ? (products.reduce((sum, p) => sum + p.price, 0) / products.length).toFixed(2) : '0.00'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products by Category */}
            {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500/20 border-t-amber-500" />
                </div>
            ) : (
                <div className="space-y-8">
                    {categories.map((category) => {
                        const categoryProducts = productsByCategory[category];
                        if (categoryProducts.length === 0) return null;

                        return (
                            <div key={category}>
                                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                                    <Badge
                                        variant="outline"
                                        className={categoryColors[category]}
                                    >
                                        {category}
                                    </Badge>
                                    <span className="text-slate-400">
                                        ({categoryProducts.length} items)
                                    </span>
                                </h2>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {categoryProducts.map((product) => (
                                        <div
                                            key={product.id}
                                            className="group relative rounded-xl border border-slate-700/50 bg-slate-800/50 p-4 transition-all hover:border-slate-600"
                                        >
                                            {/* Product Image Placeholder */}
                                            <div className="mb-3 flex h-24 items-center justify-center rounded-lg bg-slate-700/50">
                                                <Coffee className="h-10 w-10 text-slate-500" />
                                            </div>

                                            {/* Product Info */}
                                            <div className="mb-3">
                                                <h3 className="font-semibold text-white">{product.name}</h3>
                                                <p className="mt-1 line-clamp-2 text-sm text-slate-400">
                                                    {product.description || 'No description'}
                                                </p>
                                                <p className="mt-2 text-lg font-bold text-amber-400">
                                                    ${product.price.toFixed(2)}
                                                </p>
                                            </div>

                                            {/* Availability Toggle */}
                                            <div className="mb-3 flex items-center gap-2">
                                                <Switch
                                                    checked={product.is_available}
                                                    onCheckedChange={(checked) =>
                                                        handleToggleAvailability(product.id, checked)
                                                    }
                                                    className="data-[state=checked]:bg-emerald-500"
                                                />
                                                <span className="text-sm text-slate-400">
                                                    {product.is_available ? 'Available' : 'Unavailable'}
                                                </span>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openEditDialog(product)}
                                                    className="flex-1 border-slate-700 text-slate-300"
                                                >
                                                    <Pencil className="mr-2 h-3 w-3" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(product.id)}
                                                    className="border-slate-700 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="border-slate-800 bg-slate-900">
                    <DialogHeader>
                        <DialogTitle className="text-white">
                            {editingProduct ? 'Edit Product' : 'Add Product'}
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

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="price" className="text-slate-300">Price ($)</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) =>
                                        setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                                    }
                                    className="border-slate-700 bg-slate-800 text-white"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="category" className="text-slate-300">Category</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                                >
                                    <SelectTrigger className="border-slate-700 bg-slate-800 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="border-slate-700 bg-slate-800">
                                        {categories.map((cat) => (
                                            <SelectItem key={cat} value={cat}>
                                                {cat}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description" className="text-slate-300">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                className="border-slate-700 bg-slate-800 text-white"
                                rows={3}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Switch
                                checked={formData.is_available}
                                onCheckedChange={(checked) =>
                                    setFormData({ ...formData, is_available: checked })
                                }
                            />
                            <Label className="text-slate-300">Available for sale</Label>
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
                            {editingProduct ? 'Save Changes' : 'Add Product'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </PageLayout>
    );
}
