import type { Product, Sale, Kpi, User } from '@/lib/types';
import { TrendingUp, TrendingDown, DollarSign, Package, ShoppingCart, Lightbulb } from 'lucide-react';

export const mockUser: User = {
  id: 'usr_1',
  name: 'Tunde Adebayo',
  email: 'tunde@corebiz.me',
  businessName: 'Tunde\'s Provisions',
  avatarUrl: 'https://picsum.photos/seed/100/100/100',
};

export const mockProducts: Product[] = [
  { id: 'prod_1', name: 'Bag of Rice (50kg)', costPrice: 75000, sellingPrice: 80000, quantity: 15, createdAt: '2023-10-01T10:00:00Z' },
  { id: 'prod_2', name: 'Carton of Indomie', costPrice: 12000, sellingPrice: 13500, quantity: 40, createdAt: '2023-10-01T10:00:00Z' },
  { id: 'prod_3', name: 'Carton of Milo (Refill)', costPrice: 18000, sellingPrice: 20000, quantity: 25, createdAt: '2023-10-02T11:30:00Z' },
  { id: 'prod_4', name: 'Loaf of Bread', costPrice: 800, sellingPrice: 1000, quantity: 50, createdAt: '2023-10-03T09:00:00Z' },
  { id: 'prod_5', name: 'Crate of Eggs', costPrice: 3000, sellingPrice: 3500, quantity: 30, createdAt: '2023-10-04T14:00:00Z' },
  { id: 'prod_6', name: 'Bottle of Groundnut Oil', costPrice: 2500, sellingPrice: 2800, quantity: 4, createdAt: '2023-10-05T16:45:00Z' },
];

export const mockSales: Sale[] = [
  { id: 'sale_1', productName: 'Bag of Rice (50kg)', quantity: 2, totalAmount: 160000, paymentMethod: 'Transfer', date: '2023-10-28T14:20:00Z' },
  { id: 'sale_2', productName: 'Carton of Indomie', quantity: 5, totalAmount: 67500, paymentMethod: 'Cash', date: '2023-10-28T15:05:00Z' },
  { id: 'sale_3', productName: 'Crate of Eggs', quantity: 10, totalAmount: 35000, paymentMethod: 'Card', date: '2023-10-27T18:10:00Z' },
  { id: 'sale_4', productName: 'Loaf of Bread', quantity: 20, totalAmount: 20000, paymentMethod: 'Cash', date: '2023-10-27T12:30:00Z' },
  { id: 'sale_5', productName: 'Carton of Milo (Refill)', quantity: 3, totalAmount: 60000, paymentMethod: 'Transfer', date: '2023-10-26T11:00:00Z' },
];

export const mockKpis: Kpi[] = [
  { 
    title: 'Total Revenue', 
    value: '₦1,250,500', 
    change: '+15.2%', 
    changeType: 'increase',
    icon: DollarSign,
    description: 'from last month',
  },
  { 
    title: 'Total Profit', 
    value: '₦312,625', 
    change: '+21.0%', 
    changeType: 'increase',
    icon: TrendingUp,
    description: 'from last month',
  },
  { 
    title: 'Top Product', 
    value: 'Bag of Rice', 
    icon: Package,
    description: 'by sales volume',
  },
  { 
    title: 'Low Stock Items', 
    value: '1',
    change: 'Groundnut Oil',
    changeType: 'decrease',
    icon: TrendingDown,
    description: 'needs re-stocking',
  },
];

export const mockRevenueData = [
  { date: 'Jan 23', Desktop: 186, Mobile: 80 },
  { date: 'Feb 23', Desktop: 305, Mobile: 200 },
  { date: 'Mar 23', Desktop: 237, Mobile: 120 },
  { date: 'Apr 23', Desktop: 73, Mobile: 190 },
  { date: 'May 23', Desktop: 209, Mobile: 130 },
  { date: 'Jun 23', Desktop: 214, Mobile: 140 },
];
