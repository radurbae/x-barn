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
import { Plus, Pencil, Trash2, Coffee, DollarSign, X } from 'lucide-react';
import { Product, Ingredient } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { useCurrency } from '@/hooks/use-currency';
import { useTranslation } from '@/hooks/use-translation';
import { ImageUpload } from '@/components/image-upload';
import Image from 'next/image';
import {
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductAvailability,
} from '@/app/actions/products';
import {
    getAllIngredients,
    getRecipesForProducts,
    saveProductRecipes,
    getProductRecipes,
} from '@/app/actions/recipes';

// Demo products
const demoProducts: Product[] = [
    { id: '1', name: 'Espresso', price: 25000, category: 'Coffee', image_url: '/images/products/espresso.svg', description: 'Espresso shot kuat', is_available: true, created_at: '', updated_at: '' },
    { id: '2', name: 'Latte', price: 35000, category: 'Coffee', image_url: '/images/products/latte.svg', description: 'Espresso dengan susu steamed', is_available: true, created_at: '', updated_at: '' },
    { id: '3', name: 'Cappuccino', price: 35000, category: 'Coffee', image_url: '/images/products/cappuccino.svg', description: 'Espresso, susu, foam', is_available: true, created_at: '', updated_at: '' },
    { id: '4', name: 'Iced Latte', price: 38000, category: 'Iced', image_url: '/images/products/iced_latte.svg', description: 'Espresso dingin dengan susu', is_available: true, created_at: '', updated_at: '' },
    { id: '5', name: 'Cold Brew', price: 35000, category: 'Iced', image_url: '/images/products/cold_brew.svg', description: 'Kopi seduh dingin 12 jam', is_available: false, created_at: '', updated_at: '' },
    { id: '6', name: 'Matcha Latte', price: 38000, category: 'Non-Coffee', image_url: '/images/products/matcha_latte.svg', description: 'Teh hijau Jepang dengan susu', is_available: true, created_at: '', updated_at: '' },
    { id: '7', name: 'Butter Croissant', price: 28000, category: 'Food', image_url: '/images/products/croissant.svg', description: 'Croissant renyah', is_available: true, created_at: '', updated_at: '' },
];

const categories = ['Coffee', 'Iced', 'Non-Coffee', 'Food'];

interface RecipeItem {
    ingredient_id: string;
    ingredient_name: string;
    unit: string;
    amount_needed: number;
}

interface RecipeWithIngredient {
    id: string;
    ingredient_id: string;
    amount_needed: number;
    ingredient: Ingredient;
}

export default function MenuPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        price: 0,
        category: 'Coffee',
        description: '',
        is_available: true,
        image_url: null as string | null,
    });
    const [recipeItems, setRecipeItems] = useState<RecipeItem[]>([]);
    const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);
    const [productRecipes, setProductRecipes] = useState<Record<string, RecipeWithIngredient[]>>({});
    const { formatCurrency } = useCurrency();
    const { t } = useTranslation();

    // Dynamic category labels based on translation
    const getCategoryLabel = (cat: string) => {
        const labels: Record<string, () => string> = {
            Coffee: () => t('coffee'),
            Iced: () => t('iced'),
            'Non-Coffee': () => t('nonCoffee'),
            Food: () => t('food'),
        };
        return labels[cat]?.() || cat;
    };

    useEffect(() => {
        fetchProducts();
        fetchIngredients();
    }, []);

    async function fetchIngredients() {
        try {
            const ingredients = await getAllIngredients();
            setAllIngredients(ingredients);
        } catch (err) {
            console.error('Error fetching ingredients:', err);
            setError(t('loadError'));
        }
    }

    async function fetchProducts() {
        setError('');
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

            if (error) {
                console.error('Error fetching products:', error);
                setProducts([]);
                setError(t('loadError'));
            } else {
                setProducts(data || []);
                // Fetch recipes for all products
                if (data && data.length > 0) {
                    const recipes = await getRecipesForProducts(data.map(p => p.id));
                    setProductRecipes(recipes);
                }
            }
        } catch (err) {
            console.error('Error fetching products:', err);
            setProducts([]);
            setError(t('loadError'));
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
            image_url: null,
        });
        setRecipeItems([]);
        setIsDialogOpen(true);
    }

    async function openEditDialog(product: Product) {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            price: product.price,
            category: product.category,
            description: product.description || '',
            is_available: product.is_available,
            image_url: product.image_url,
        });

        // Load existing recipes
        const recipes = await getProductRecipes(product.id);
        setRecipeItems(recipes.map(r => ({
            ingredient_id: r.ingredient_id,
            ingredient_name: r.ingredient.name,
            unit: r.ingredient.unit,
            amount_needed: r.amount_needed,
        })));

        setIsDialogOpen(true);
    }

    async function handleSubmit() {
        let productId = editingProduct?.id;

        if (editingProduct) {
            const result = await updateProduct(editingProduct.id, formData);
            if (!result.success) return;
        } else {
            const result = await createProduct(formData as Omit<Product, 'id' | 'created_at' | 'updated_at'>);
            if (!result.success) return;
            productId = result.productId;
        }

        // Save recipes
        if (productId) {
            await saveProductRecipes(productId, recipeItems.map(r => ({
                ingredient_id: r.ingredient_id,
                amount_needed: r.amount_needed,
            })));
        }

        setIsDialogOpen(false);
        fetchProducts();
    }

    async function handleDelete(id: string) {
        if (confirm(t('deleteProductConfirm'))) {
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

    function addRecipeItem(ingredientId: string) {
        const ingredient = allIngredients.find(i => i.id === ingredientId);
        if (!ingredient) return;

        // Check if already added
        if (recipeItems.some(r => r.ingredient_id === ingredientId)) return;

        setRecipeItems([...recipeItems, {
            ingredient_id: ingredientId,
            ingredient_name: ingredient.name,
            unit: ingredient.unit,
            amount_needed: 0,
        }]);
    }

    function updateRecipeAmount(ingredientId: string, amount: number) {
        setRecipeItems(recipeItems.map(r =>
            r.ingredient_id === ingredientId
                ? { ...r, amount_needed: amount }
                : r
        ));
    }

    function removeRecipeItem(ingredientId: string) {
        setRecipeItems(recipeItems.filter(r => r.ingredient_id !== ingredientId));
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

    // Get available ingredients for selection (not already in recipe)
    const availableIngredients = allIngredients.filter(
        i => !recipeItems.some(r => r.ingredient_id === i.id)
    );

    return (
        <PageLayout
            title={t('menu')}
            description={t('productManagement')}
            actions={
                <Button
                    onClick={openAddDialog}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    {t('addProduct')}
                </Button>
            }
        >
            {error && (
                <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                    {error}
                </div>
            )}
            {/* Stats */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20">
                            <Coffee className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{t('totalProducts')}</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{products.length}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
                            <Coffee className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{t('available')}</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                {products.filter((p) => p.is_available).length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                            <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{t('avgPrice')}</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                {formatCurrency(products.length > 0 ? products.reduce((sum, p) => sum + p.price, 0) / products.length : 0)}
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
                                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                                    <Badge
                                        variant="outline"
                                        className={categoryColors[category]}
                                    >
                                        {getCategoryLabel(category)}
                                    </Badge>
                                    <span className="text-slate-500 dark:text-slate-400">
                                        ({categoryProducts.length} {t('item')})
                                    </span>
                                </h2>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {categoryProducts.map((product) => {
                                        const recipes = productRecipes[product.id] || [];

                                        return (
                                            <div
                                                key={product.id}
                                                className="group relative rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 p-4 transition-all hover:border-amber-500/50 hover:bg-slate-50 dark:hover:bg-slate-800"
                                            >
                                                {/* Product Image */}
                                                <div className="mb-3 flex h-24 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700/50 overflow-hidden">
                                                    {product.image_url ? (
                                                        <Image
                                                            src={product.image_url}
                                                            alt={product.name}
                                                            width={96}
                                                            height={96}
                                                            unoptimized={
                                                                product.image_url.startsWith('data:') ||
                                                                product.image_url.endsWith('.svg')
                                                            }
                                                            className="h-full w-full object-cover"
                                                        />) : (
                                                        <Coffee className="h-10 w-10 text-slate-400 dark:text-slate-500" />
                                                    )}
                                                </div>

                                                {/* Product Info */}
                                                <div className="mb-3">
                                                    <h3 className="font-semibold text-slate-900 dark:text-white">{product.name}</h3>
                                                    <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                                                        {product.description || t('noDescription')}
                                                    </p>
                                                    <p className="mt-2 text-lg font-bold text-amber-600 dark:text-amber-400">
                                                        {formatCurrency(product.price)}
                                                    </p>
                                                </div>

                                                {/* Recipe Ingredients */}
                                                {recipes.length > 0 && (
                                                    <div className="mb-3 text-xs text-slate-500 dark:text-slate-400">
                                                        <span className="font-medium">{t('recipe')}: </span>
                                                        {recipes.map((r, i) => (
                                                            <span key={r.ingredient_id}>
                                                                {r.ingredient.name} ({r.amount_needed}{r.ingredient.unit})
                                                                {i < recipes.length - 1 ? ', ' : ''}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Availability Toggle */}
                                                <div className="mb-3 flex items-center gap-2">
                                                    <Switch
                                                        checked={product.is_available}
                                                        onCheckedChange={(checked) =>
                                                            handleToggleAvailability(product.id, checked)
                                                        }
                                                        className="data-[state=checked]:bg-emerald-500"
                                                    />
                                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                                        {product.is_available ? t('available') : t('notAvailable')}
                                                    </span>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openEditDialog(product)}
                                                        className="flex-1 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                                                    >
                                                        <Pencil className="mr-2 h-3 w-3" />
                                                        {t('edit')}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDelete(product.id)}
                                                        className="border-slate-200 dark:border-slate-700 text-red-500 dark:text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-slate-900 dark:text-white">
                            {editingProduct ? t('editProduct') : t('addProduct')}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Image Upload */}
                        <div className="grid gap-2">
                            <Label className="text-slate-600 dark:text-slate-300">{t('productImage')}</Label>
                            <ImageUpload
                                value={formData.image_url}
                                onChange={(url) => setFormData({ ...formData, image_url: url })}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-slate-600 dark:text-slate-300">{t('name')}</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="price" className="text-slate-600 dark:text-slate-300">{t('price')}</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    step="1000"
                                    value={formData.price}
                                    onChange={(e) =>
                                        setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                                    }
                                    className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="category" className="text-slate-600 dark:text-slate-300">{t('category')}</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                                >
                                    <SelectTrigger className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                                        {categories.map((cat) => (
                                            <SelectItem key={cat} value={cat}>
                                                {getCategoryLabel(cat)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description" className="text-slate-600 dark:text-slate-300">{t('description')}</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                rows={3}
                            />
                        </div>

                        {/* Recipe Ingredients Section */}
                        <div className="grid gap-2">
                            <Label className="text-slate-600 dark:text-slate-300">{t('recipeIngredients')}</Label>

                            {/* Add ingredient selector */}
                            {availableIngredients.length > 0 && (
                                <Select onValueChange={addRecipeItem}>
                                    <SelectTrigger className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                                        <SelectValue placeholder={t('selectIngredient')} />
                                    </SelectTrigger>
                                    <SelectContent className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                                        {availableIngredients.map((ingredient) => (
                                            <SelectItem key={ingredient.id} value={ingredient.id}>
                                                {ingredient.name} ({ingredient.unit})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}

                            {/* Recipe items list */}
                            <div className="space-y-2 mt-2">
                                {recipeItems.length === 0 ? (
                                    <p className="text-sm text-slate-400 italic">{t('noRecipe')}</p>
                                ) : (
                                    recipeItems.map((item) => (
                                        <div
                                            key={item.ingredient_id}
                                            className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2"
                                        >
                                            <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                                                {item.ingredient_name}
                                            </span>
                                            <Input
                                                type="number"
                                                step="0.1"
                                                value={item.amount_needed}
                                                onChange={(e) => updateRecipeAmount(item.ingredient_id, parseFloat(e.target.value) || 0)}
                                                className="w-24 h-8 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                                            />
                                            <span className="text-sm text-slate-500 dark:text-slate-400 w-8">
                                                {item.unit}
                                            </span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                                                onClick={() => removeRecipeItem(item.ingredient_id)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Switch
                                checked={formData.is_available}
                                onCheckedChange={(checked) =>
                                    setFormData({ ...formData, is_available: checked })
                                }
                            />
                            <Label className="text-slate-600 dark:text-slate-300">{t('availableForSale')}</Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                            className="border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300"
                        >
                            {t('cancel')}
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                        >
                            {editingProduct ? t('save') : t('addProduct')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </PageLayout>
    );
}
