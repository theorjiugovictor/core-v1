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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mockProducts, mockMaterials } from '@/lib/data';
import type { Product } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function ProductsPage() {
  const [products, setProducts] = React.useState<Product[]>(mockProducts);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
  };
  
  const getMaterialName = (id: string) => {
      return mockMaterials.find(i => i.id === id)?.name || 'Unknown Material';
  }

  const calculateCost = (product: Product) => {
    return product.materials.reduce((total, current) => {
        const material = mockMaterials.find(i => i.id === current.materialId);
        if (!material) return total;
        return total + (material.costPrice * current.quantity);
    }, 0);
  }

  return (
    <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="font-headline text-2xl font-bold">Products</h1>
                <p className="text-muted-foreground">Define the materials for the products you sell, or track individual items.</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Create Product
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Product</DialogTitle>
                  <DialogDescription>
                    Define a new product by adding materials, or leave materials blank for standalone items. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Product Name</Label>
                    <Input id="name" placeholder="e.g. Jollof Rice (Party Pack)" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="selling-price" className="text-right">Selling Price (₦)</Label>
                    <Input id="selling-price" type="number" placeholder="0.00" className="col-span-3" />
                  </div>
                  {/* TODO: Add material selection logic here */}
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={() => setIsDialogOpen(false)}>Save product</Button>
                </DialogFooter>
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
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
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
                <CardFooter className="pt-4">
                    <p className="text-sm font-semibold text-muted-foreground">
                        Estimated Cost: {formatCurrency(calculateCost(product))}
                    </p>
                </CardFooter>
            </Card>
            ))}
        </div>
    </div>
  );
}
