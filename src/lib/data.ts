import type { Material, Sale, Kpi, User, Product } from '@/lib/types';
import { TrendingUp, TrendingDown, DollarSign, Package, ShoppingCart } from 'lucide-react';

export const mockUser: User = {
  id: 'usr_1',
  name: 'Tunde Adebayo',
  email: 'tunde@corebiz.me',
  businessName: 'Tunde\'s Provisions',
  avatarUrl: 'https://picsum.photos/seed/100/100/100',
};

export const mockMaterials: Material[] = [
  { id: 'ing_1', name: 'Flour', costPrice: 1000, quantity: 50, unit: 'kg', createdAt: '2023-10-01T10:00:00Z' },
  { id: 'ing_2', name: 'Sugar', costPrice: 800, quantity: 25, unit: 'kg', createdAt: '2023-10-01T10:00:00Z' },
  { id: 'ing_3', name: 'Eggs', costPrice: 100, quantity: 120, unit: 'piece', createdAt: '2023-10-02T11:30:00Z' },
  { id: 'ing_4', name: 'Butter', costPrice: 1500, quantity: 10, unit: 'kg', createdAt: '2023-10-03T09:00:00Z' },
  { id: 'ing_5', name: 'Tomatoes', costPrice: 500, quantity: 20, unit: 'kg', createdAt: '2023-10-04T14:00:00Z' },
  { id: 'ing_6', name: 'Rice', costPrice: 75000, quantity: 1, unit: 'bag (50kg)', createdAt: '2023-10-05T16:45:00Z' },
];

export const mockProducts: Product[] = [
  {
    id: 'recipe_1',
    name: 'Classic Cake',
    sellingPrice: 5000,
    materials: [
      { materialId: 'ing_1', quantity: 1 }, // 1kg flour
      { materialId: 'ing_2', quantity: 0.5 }, // 0.5kg sugar
      { materialId: 'ing_3', quantity: 6 }, // 6 eggs
      { materialId: 'ing_4', quantity: 0.25 }, // 0.25kg butter
    ],
    createdAt: '2023-10-10T09:00:00Z',
  },
  {
    id: 'recipe_2',
    name: 'Jollof Rice (Party Pack)',
    sellingPrice: 25000,
    materials: [
      { materialId: 'ing_6', quantity: 0.2 }, // 10kg rice (0.2 of 50kg bag)
      { materialId: 'ing_5', quantity: 5 }, // 5kg tomatoes
    ],
    createdAt: '2023-10-11T12:00:00Z',
  }
];

export const mockSales: Sale[] = [
  { id: 'sale_1', productName: 'Jollof Rice (Party Pack)', quantity: 2, totalAmount: 50000, paymentMethod: 'Transfer', date: '2023-10-28T14:20:00Z' },
  { id: 'sale_2', productName: 'Classic Cake', quantity: 5, totalAmount: 25000, paymentMethod: 'Cash', date: '2023-10-28T15:05:00Z' },
  { id: 'sale_3', productName: 'Classic Cake', quantity: 2, totalAmount: 10000, paymentMethod: 'Card', date: '2023-10-27T18:10:00Z' },
];

export const mockKpis: Kpi[] = [
  {
    title: 'Total Revenue',
    value: '₦85,000',
    change: '+15.2%',
    changeType: 'increase',
    icon: DollarSign,
    description: 'from last month',
  },
  {
    title: 'Total Profit',
    value: '₦25,500',
    change: '+21.0%',
    changeType: 'increase',
    icon: TrendingUp,
    description: 'from last month',
  },
  {
    title: 'Top Selling Product',
    value: 'Classic Cake',
    icon: Package,
    description: 'by sales volume',
  },
  {
    title: 'Low Stock Items',
    value: '1',
    change: 'Rice',
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

export const mockInsights = [
  {
    id: 'ins_1',
    message: 'Consider restocking Rice (50kg) as inventory is critically low (1 unit left). Customer demand is rising.',
    relevanceScore: 0.95,
  },
  {
    id: 'ins_2',
    message: 'Classic Cake is your top seller. Suggest creating a "Weekend Bundle" with drinks to increase average order value.',
    relevanceScore: 0.88,
  },
  {
    id: 'ins_3',
    message: 'Cash flow is healthy (₦85,000 revenue), but 40% of sales are "Transfer". Check transfer confirmation diligently to avoid fraud.',
    relevanceScore: 0.75,
  },
];
