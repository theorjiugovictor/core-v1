'use client';

import { useState } from 'react';
import { Download, FileSpreadsheet, Package, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { getMaterialsAction, getProductsAction, getSalesAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

export function DataExport() {
    const [loading, setLoading] = useState<string | null>(null);
    const { toast } = useToast();

    const downloadCSV = (data: any[], filename: string) => {
        if (!data || data.length === 0) {
            toast({
                title: "No Data",
                description: "There is no data to export.",
                variant: "destructive",
            });
            return;
        }

        // Get headers
        const headers = Object.keys(data[0]);

        // Create CSV content
        const csvContent = [
            headers.join(','),
            ...data.map(row =>
                headers.map(header => {
                    const value = row[header];
                    // Handle types: strings with commas need quotes, dates need formatting, objects need JSON.stringify
                    if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
                    if (value instanceof Date) return value.toISOString();
                    if (typeof value === 'object' && value !== null) return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
                    return value;
                }).join(',')
            )
        ].join('\n');

        // Create blob and download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportSales = async () => {
        setLoading('sales');
        try {
            const data = await getSalesAction();
            downloadCSV(data, 'sales_history');
            toast({ title: "Export Successful", description: "Sales history downloaded." });
        } catch (error) {
            toast({ title: "Export Failed", description: "Could not fetch sales data.", variant: "destructive" });
        } finally {
            setLoading(null);
        }
    };

    const handleExportInventory = async () => {
        setLoading('inventory');
        try {
            const data = await getMaterialsAction();
            // Simplify data for CSV (flatten objects if needed, but for now direct dump is okay)
            const simplifiedData = data.map(m => ({
                Name: m.name,
                Quantity: m.quantity,
                Unit: m.unit,
                CostPrice: m.costPrice,
                CreatedAt: m.createdAt
            }));
            downloadCSV(simplifiedData, 'inventory_stock');
            toast({ title: "Export Successful", description: "Inventory data downloaded." });
        } catch (error) {
            toast({ title: "Export Failed", description: "Could not fetch inventory data.", variant: "destructive" });
        } finally {
            setLoading(null);
        }
    };

    const handleExportProducts = async () => {
        setLoading('products');
        try {
            const data = await getProductsAction();
            const simplifiedData = data.map(p => ({
                Name: p.name,
                SellingPrice: p.sellingPrice,
                IngredientsCount: p.materials?.length || 0,
                CreatedAt: p.createdAt
            }));
            downloadCSV(simplifiedData, 'product_catalog');
            toast({ title: "Export Successful", description: "Product catalog downloaded." });
        } catch (error) {
            toast({ title: "Export Failed", description: "Could not fetch product data.", variant: "destructive" });
        } finally {
            setLoading(null);
        }
    };

    return (
        <Card className="max-w-2xl mx-auto border-none shadow-lg bg-card/50 backdrop-blur-md">
            <CardHeader>
                <CardTitle>Export Data</CardTitle>
                <CardDescription>
                    Download your business data as CSV files for analysis.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
                <Button
                    variant="outline"
                    className="h-auto flex-col gap-2 p-4"
                    onClick={handleExportSales}
                    disabled={loading !== null}
                >
                    <ShoppingCart className="h-6 w-6" />
                    <span className="text-sm font-medium">Export Sales</span>
                    {loading === 'sales' && <span className="text-xs text-muted-foreground animate-pulse">Downloading...</span>}
                </Button>
                <Button
                    variant="outline"
                    className="h-auto flex-col gap-2 p-4"
                    onClick={handleExportInventory}
                    disabled={loading !== null}
                >
                    <Package className="h-6 w-6" />
                    <span className="text-sm font-medium">Export Inventory</span>
                    {loading === 'inventory' && <span className="text-xs text-muted-foreground animate-pulse">Downloading...</span>}

                </Button>
                <Button
                    variant="outline"
                    className="h-auto flex-col gap-2 p-4"
                    onClick={handleExportProducts}
                    disabled={loading !== null}
                >
                    <FileSpreadsheet className="h-6 w-6" />
                    <span className="text-sm font-medium">Export Products</span>
                    {loading === 'products' && <span className="text-xs text-muted-foreground animate-pulse">Downloading...</span>}
                </Button>
            </CardContent>
        </Card>
    );
}
