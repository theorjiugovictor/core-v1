'use client';

import * as React from 'react';
import { Plus, MoreHorizontal, Pencil, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { getSalesAction, createSaleAction, updateSaleAction, deleteSaleAction, getProductsAction } from '@/lib/actions';
import type { Sale, Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function SalesPage() {
  const [sales, setSales] = React.useState<Sale[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [iscreateOpen, setIsCreateOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [editingSale, setEditingSale] = React.useState<Sale | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Sale | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [salesData, productsData] = await Promise.all([getSalesAction(), getProductsAction()]);
      setSales(salesData);
      setProducts(productsData);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-calculate total based on product price for manual entry
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [qty, setQty] = React.useState("1");
  const [totalAmountState, setTotalAmountState] = React.useState<string>("");

  React.useEffect(() => {
    if (selectedProduct) {
      const calculated = selectedProduct.sellingPrice * (Number(qty) || 1);
      setTotalAmountState(String(calculated));
    }
  }, [selectedProduct, qty]);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productName = formData.get('productName') as string;
    const quantity = Number(formData.get('quantity'));
    const totalAmount = Number(formData.get('totalAmount'));
    const paymentMethod = formData.get('paymentMethod') as 'Cash' | 'Card' | 'Transfer';

    if (!productName) {
      toast({ title: "Validation Error", description: "Please select a product", variant: "destructive" });
      return;
    }

    const result = await createSaleAction({ productName, quantity, totalAmount, paymentMethod });

    if (result.success) {
      toast({ title: "Success", description: "Sale recorded successfully" });
      setIsCreateOpen(false);
      setSelectedProduct(null);
      setQty("1");
      setTotalAmountState("");
      loadData();
    } else {
      toast({ title: "Error", description: result.error || "Failed to record sale", variant: "destructive" });
    }
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingSale) return;
    const formData = new FormData(e.currentTarget);
    const quantity = Number(formData.get('quantity'));
    const totalAmount = Number(formData.get('totalAmount'));
    const paymentMethod = formData.get('paymentMethod') as 'Cash' | 'Card' | 'Transfer';

    const result = await updateSaleAction(editingSale.id, { quantity, totalAmount, paymentMethod });

    if (result.success) {
      toast({ title: "Success", description: "Sale updated successfully" });
      setIsEditOpen(false);
      setEditingSale(null);
      loadData();
    } else {
      toast({ title: "Error", description: result.error || "Failed to update sale", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deleteSaleAction(id);
    if (result.success) {
      toast({ title: "Deleted", description: "Sale deleted successfully" });
      loadData();
    } else {
      toast({ title: "Error", description: result.error || "Failed to delete sale", variant: "destructive" });
    }
  };

  const openEditDialog = (sale: Sale) => {
    setEditingSale(sale);
    setIsEditOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Dialog open={iscreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Record Sale
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record New Sale</DialogTitle>
              <DialogDescription>Manually record a transaction.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Product</Label>
                <Select name="productName" onValueChange={(val) => setSelectedProduct(products.find(p => p.name === val) || null)} required>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select Product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(p => (
                      <SelectItem key={p.id} value={p.name}>{p.name} ({formatCurrency(p.sellingPrice)})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Quantity</Label>
                <Input name="quantity" type="number" className="col-span-3" value={qty} onChange={e => setQty(e.target.value)} required min="1" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Total (₦)</Label>
                <Input name="totalAmount" type="number" className="col-span-3" value={totalAmountState} onChange={e => setTotalAmountState(e.target.value)} required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Payment</Label>
                <Select name="paymentMethod" defaultValue="Cash" required>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Transfer">Transfer</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit">Save Transaction</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Sale</DialogTitle>
            </DialogHeader>
            {editingSale && (
              <form onSubmit={handleEdit} className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Product</Label>
                  <Input className="col-span-3" value={editingSale.productName} disabled />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Quantity</Label>
                  <Input name="quantity" type="number" className="col-span-3" defaultValue={editingSale.quantity} required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Total Amount</Label>
                  <Input name="totalAmount" type="number" className="col-span-3" defaultValue={editingSale.totalAmount} required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Payment</Label>
                  <Select name="paymentMethod" defaultValue={editingSale.paymentMethod} required>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Transfer">Transfer</SelectItem>
                      <SelectItem value="Card">Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="submit">Update Sale</Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>A list of all recent sales transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-center">Payment Method</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell className="text-center"><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                      <TableCell className="text-center"><Skeleton className="h-5 w-16 mx-auto" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-md" /></TableCell>
                    </TableRow>
                  ))
                ) : sales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      No sales recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.productName}</TableCell>
                    <TableCell className="text-center">{sale.quantity}</TableCell>
                    <TableCell className="text-right">
                      {sale.quantity > 0 ? formatCurrency(sale.totalAmount / sale.quantity) : '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={sale.paymentMethod === 'Transfer' ? 'default' : 'secondary'}>
                        {sale.paymentMethod}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(sale.totalAmount)}</TableCell>
                    <TableCell className="text-right">{formatDate(sale.date)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openEditDialog(sale)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeleteTarget(sale)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
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
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this sale?"
        description="This can't be undone — inventory changes from this sale won't be reversed automatically."
        onConfirm={() => {
          if (deleteTarget) handleDelete(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
