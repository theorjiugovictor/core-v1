'use client';

import * as React from 'react';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/confirm-dialog';

import { getMaterialsAction, createMaterialAction, updateMaterialAction, deleteMaterialAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import type { Material } from '@/lib/types';

export default function MaterialsPage() {
  const [materials, setMaterials] = React.useState<Material[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [editingMaterial, setEditingMaterial] = React.useState<Material | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Material | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    loadMaterials();
  }, []);

  async function loadMaterials() {
    setIsLoading(true);
    try {
      const data = await getMaterialsAction();
      setMaterials(data);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const result = await createMaterialAction({
      name: formData.get('name') as string,
      quantity: Number(formData.get('quantity')),
      unit: formData.get('unit') as string,
      costPrice: Number(formData.get('costPrice'))
    });

    if (result.success) {
      toast({ title: "Success", description: "Material added successfully" });
      setIsDialogOpen(false);
      loadMaterials();
    } else {
      toast({ title: "Error", description: result.error || "Failed to add material", variant: "destructive" });
    }
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingMaterial) return;
    const formData = new FormData(e.currentTarget);

    const result = await updateMaterialAction(editingMaterial.id, {
      name: formData.get('name') as string,
      quantity: Number(formData.get('quantity')),
      unit: formData.get('unit') as string,
      costPrice: Number(formData.get('costPrice'))
    });

    if (result.success) {
      toast({ title: "Success", description: "Material updated successfully" });
      setIsEditOpen(false);
      setEditingMaterial(null);
      loadMaterials();
    } else {
      toast({ title: "Error", description: result.error || "Failed to update material", variant: "destructive" });
    }
  }

  async function handleDelete(id: string) {
    try {
      const result = await deleteMaterialAction(id);
      if (result.success) {
        toast({ title: "Success", description: "Material deleted" });
        loadMaterials();
      } else {
        toast({ title: "Error", description: result.error || "Failed to delete material", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete material", variant: "destructive" });
    }
  }

  function openEditModal(mat: Material) {
    setEditingMaterial(mat);
    setIsEditOpen(true);
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Current Stock</CardTitle>
            <CardDescription>Manage your raw materials and their stock levels.</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add Material
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Material</DialogTitle>
                <DialogDescription>
                  Add a new raw material to your inventory. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input id="name" name="name" placeholder="e.g. Flour" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="quantity" className="text-right">Quantity</Label>
                  <Input id="quantity" name="quantity" type="number" placeholder="0" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="unit" className="text-right">Unit</Label>
                  <Input id="unit" name="unit" placeholder="e.g. kg, pcs" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="costPrice" className="text-right">Cost Price (₦)</Label>
                  <Input id="costPrice" name="costPrice" type="number" placeholder="0.00" className="col-span-3" required />
                </div>

                <DialogFooter>
                  <Button type="submit">Save material</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Material</DialogTitle>
                <DialogDescription>Update material inventory details.</DialogDescription>
              </DialogHeader>
              {editingMaterial && (
                <form onSubmit={handleEdit} className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-name" className="text-right">Name</Label>
                    <Input id="edit-name" name="name" defaultValue={editingMaterial.name} className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-quantity" className="text-right">Quantity</Label>
                    <Input id="edit-quantity" name="quantity" type="number" defaultValue={editingMaterial.quantity} className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-unit" className="text-right">Unit</Label>
                    <Input id="edit-unit" name="unit" defaultValue={editingMaterial.unit} className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-costPrice" className="text-right">Cost Price (₦)</Label>
                    <Input id="edit-costPrice" name="costPrice" type="number" defaultValue={editingMaterial.costPrice} className="col-span-3" required />
                  </div>
                  <DialogFooter>
                    <Button type="submit">Update material</Button>
                  </DialogFooter>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead className="text-right">Cost Price</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 rounded-md" /></TableCell>
                  </TableRow>
                ))
              ) : materials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                    No materials yet. Add one above, or just tell CORE what you have from the dashboard.
                  </TableCell>
                </TableRow>
              ) : (
                materials.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell className="font-medium">{material.name}</TableCell>
                    <TableCell>{material.quantity} {material.unit}</TableCell>
                    <TableCell className="text-right">{formatCurrency(material.costPrice)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openEditModal(material)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => setDeleteTarget(material)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete ${deleteTarget?.name}?`}
        description="This can't be undone. Existing sales and product recipes that reference it won't be affected, but the stock record itself will be gone."
        onConfirm={() => {
          if (deleteTarget) handleDelete(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </Card>
  );
}
