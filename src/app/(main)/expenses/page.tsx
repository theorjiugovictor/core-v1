'use client';

import * as React from 'react';
import { Plus, MoreHorizontal, Pencil, Trash2, Calendar as CalendarIcon, TrendingDown } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { getExpensesAction, createExpenseAction, deleteExpenseAction } from '@/lib/actions';
import type { Expense } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function ExpensesPage() {
    const [expenses, setExpenses] = React.useState<Expense[]>([]);
    const [isCreateOpen, setIsCreateOpen] = React.useState(false);
    const [deleteTarget, setDeleteTarget] = React.useState<Expense | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const { toast } = useToast();

    React.useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const data = await getExpensesAction();
            setExpenses(data);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const description = formData.get('description') as string;
        const amount = Number(formData.get('amount'));
        const category = formData.get('category') as string || 'General';

        const result = await createExpenseAction({ description, amount, category });

        if (result.success) {
            toast({ title: "Success", description: "Expense recorded successfully" });
            setIsCreateOpen(false);
            loadData();
        } else {
            toast({ title: "Error", description: "Failed to record expense", variant: "destructive" });
        }
    };

    const handleDelete = async (id: string) => {
        const result = await deleteExpenseAction(id);
        if (result.success) {
            toast({ title: "Deleted", description: "Expense deleted successfully" });
            loadData();
        } else {
            toast({ title: "Error", description: "Failed to delete expense", variant: "destructive" });
        }
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

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    return (
        <div className="flex flex-col gap-6 animate-fade-in-up">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
                    <p className="text-muted-foreground">Track and manage your operating costs.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-red-600 hover:bg-red-700 text-white">
                            <Plus className="h-4 w-4" /> Record Expense
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Record New Expense</DialogTitle>
                            <DialogDescription>Manually record a cost (e.g. Rent, Fuel, Salaries).</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Description</Label>
                                <Input name="description" placeholder="e.g. Fuel for generator" className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Amount (₦)</Label>
                                <Input name="amount" type="number" className="col-span-3" required min="0" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Category</Label>
                                <Input name="category" placeholder="General" className="col-span-3" />
                            </div>
                            <DialogFooter>
                                <Button type="submit" variant="destructive">Save Expense</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Summary Card */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-l-4 border-l-red-500 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Expenses (All Time)</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Expense History</CardTitle>
                    <CardDescription>A list of all recorded expenses.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-right">Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 4 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-md" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : expenses.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No expenses recorded yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    expenses.map((expense) => (
                                        <TableRow key={expense.id}>
                                            <TableCell className="font-medium">{expense.description}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{expense.category}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-red-600">
                                                -{formatCurrency(expense.amount)}
                                            </TableCell>
                                            <TableCell className="text-right text-muted-foreground">{formatDate(expense.date)}</TableCell>
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
                                                        <DropdownMenuItem onClick={() => setDeleteTarget(expense)} className="text-red-600">
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
                title="Delete this expense?"
                description="This can't be undone."
                onConfirm={() => {
                    if (deleteTarget) handleDelete(deleteTarget.id);
                    setDeleteTarget(null);
                }}
            />
        </div>
    );
}
