'use client';

import * as React from 'react';
import { PlusCircle, MoreHorizontal, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getProductsAction, createProductAction, deleteProductAction, getMaterialsAction, updateProductAction } from '@/lib/actions';
import type { Product, Material } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

export default function ProductsPage() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [allMaterials, setAllMaterials] = React.useState<Material[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const { toast } = useToast();

  // Form State
  const [selectedMaterialId, setSelectedMaterialId] = React.useState("");
  const [selectedQty, setSelectedQty] = React.useState("1");
  const [recipe, setRecipe] = React.useState<{ materialId: string, quantity: number }[]>([]);

  React.useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [pData, mData] = await Promise.all([getProductsAction(), getMaterialsAction()]);
    setProducts(pData);
    setAllMaterials(mData);
  }

  function addToRecipe() {
    if (!selectedMaterialId) return;
    setRecipe([...recipe, { materialId: selectedMaterialId, quantity: Number(selectedQty) }]);
    setSelectedMaterialId("");
    setSelectedQty("1");
  }

  function removeFromRecipe(index: number) {
    const newRecipe = [...recipe];
    newRecipe.splice(index, 1);
    setRecipe(newRecipe);
  }

  function openCreateDialog() {
    setEditingProduct(null);
    setRecipe([]);
    setIsDialogOpen(true);
  }

  function openEditDialog(product: Product) {
    setEditingProduct(product);
    setRecipe(product.materials || []);
    setIsDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const sellingPrice = Number(formData.get('sellingPrice'));
    const costPrice = Number(formData.get('costPrice')) || 0;

    try {
      if (editingProduct) {
        // Update
        await updateProductAction(editingProduct.id, {
          name,
          sellingPrice,
          costPrice,
          materials: recipe
        });
        toast({ title: "Success", description: "Product updated successfully" });
      } else {
        // Create
        await createProductAction({
          name,
          sellingPrice,
          costPrice,
          materials: recipe
        });
        toast({ title: "Success", description: "Product created successfully" });
      }

      setIsDialogOpen(false);
      setEditingProduct(null);
      setRecipe([]);
      loadData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save product", variant: "destructive" });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProductAction(id);
      toast({ title: "Success", description: "Product deleted" });
      loadData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete product", variant: "destructive" });
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
  };

  const getMaterialName = (id: string) => {
    return allMaterials.find(i => i.id === id)?.name || 'Unknown Material';
  }

  const calculateCost = (product: Product) => {
    if (product.materials && product.materials.length > 0) {
      return product.materials.reduce((total, current) => {
        const material = allMaterials.find(i => i.id === current.materialId);
        if (!material) return total;
        return total + (material.costPrice * current.quantity);
      }, 0);
    }
    return product.costPrice || 0;
  };

  const calculateProfit = (product: Product) => {
    const cost = calculateCost(product);
    return product.sellingPrice - cost;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div></div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1" onClick={openCreateDialog}>
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Create Product
              </span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Create New Product'}</DialogTitle>
              <DialogDescription>
                {editingProduct ? 'Update product details and recipe.' : 'Define a new product. Use Cost Price for Retail, or Recipe for Manufacturing.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Product Name</Label>
                <Input id="name" name="name" defaultValue={editingProduct?.name} placeholder="e.g. Jollof Rice" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sellingPrice" className="text-right">Selling Price</Label>
                <Input id="sellingPrice" name="sellingPrice" type="number" defaultValue={editingProduct?.sellingPrice} placeholder="0.00" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="costPrice" className="text-right">Cost Price</Label>
                <Input id="costPrice" name="costPrice" type="number" defaultValue={editingProduct?.costPrice} placeholder="0.00 (Optional for Recipe items)" className="col-span-3" />
              </div>

              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right mt-2">Recipe</Label>
                <div className="col-span-3 space-y-3">
                  <div className="flex gap-2">
                    <Select value={selectedMaterialId} onValueChange={setSelectedMaterialId}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                      <SelectContent>
                        {allMaterials.map((m) => (
                          <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Qty"
                      type="number"
                      className="w-20"
                      value={selectedQty}
                      onChange={(e) => setSelectedQty(e.target.value)}
                    />
                    <Button type="button" variant="secondary" onClick={addToRecipe}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recipe.map((r, idx) => (
                      <Badge key={idx} variant="outline" className="gap-1 pr-1">
                        {getMaterialName(r.materialId)} ({r.quantity})
                        <button type="button" onClick={() => removeFromRecipe(idx)} className="ml-1 hover:text-destructive">×</button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="submit">{editingProduct ? 'Update Product' : 'Save Product'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UtensilsCrossed className="h-5 w-5 text-primary" />
                    {product.name}
                  </CardTitle>
                  <CardDescription>Selling Price: {formatCurrency(product.sellingPrice)}</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => openEditDialog(product)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(product.id)}>Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              {product.materials.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Materials</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.materials.map(mat => (
                      <Badge key={mat.materialId} variant="secondary">
                        {getMaterialName(mat.materialId)} ({mat.quantity})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            <Separator />
            <CardFooter className="pt-4 flex justify-between text-sm">
              <span className="text-muted-foreground">
                Cost: {formatCurrency(calculateCost(product))}
              </span>
              <span className={calculateProfit(product) > 0 ? "text-green-600 font-bold" : "text-red-500 font-bold"}>
                Profit: {formatCurrency(calculateProfit(product))}
              </span>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
