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
import { mockRecipes, mockIngredients } from '@/lib/data';
import type { Recipe } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

export default function RecipesPage() {
  const [recipes, setRecipes] = React.useState<Recipe[]>(mockRecipes);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
  };
  
  const getIngredientName = (id: string) => {
      return mockIngredients.find(i => i.id === id)?.name || 'Unknown Ingredient';
  }

  const calculateCost = (recipe: Recipe) => {
    return recipe.ingredients.reduce((total, current) => {
        const ingredient = mockIngredients.find(i => i.id === current.ingredientId);
        if (!ingredient) return total;
        return total + (ingredient.costPrice * current.quantity);
    }, 0);
  }

  return (
    <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="font-headline text-2xl font-bold">Meal Recipes</h1>
                <p className="text-muted-foreground">Define the ingredients for the meals you sell.</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Create Recipe
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Recipe</DialogTitle>
                  <DialogDescription>
                    Define a new meal by adding ingredients. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Meal Name</Label>
                    <Input id="name" placeholder="e.g. Jollof Rice (Party Pack)" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="selling-price" className="text-right">Selling Price (₦)</Label>
                    <Input id="selling-price" type="number" placeholder="0.00" className="col-span-3" />
                  </div>
                  {/* TODO: Add ingredient selection logic here */}
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={() => setIsDialogOpen(false)}>Save recipe</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
            <Card key={recipe.id}>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <UtensilsCrossed className="h-5 w-5 text-primary" />
                                {recipe.name}
                            </CardTitle>
                            <CardDescription>{formatCurrency(recipe.sellingPrice)}</CardDescription>
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
                <CardContent>
                    <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Ingredients</h4>
                        <div className="flex flex-wrap gap-2">
                            {recipe.ingredients.map(ing => (
                                <Badge key={ing.ingredientId} variant="secondary">
                                    {getIngredientName(ing.ingredientId)} ({ing.quantity})
                                </Badge>
                            ))}
                        </div>
                         <p className="text-xs text-muted-foreground pt-2">
                            Estimated Cost: {formatCurrency(calculateCost(recipe))}
                        </p>
                    </div>
                </CardContent>
            </Card>
            ))}
        </div>
    </div>
  );
}
