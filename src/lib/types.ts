export type User = {
  id: string;
  name: string;
  email: string;
  businessName: string;
  avatarUrl?: string;
};

export type Material = {
  id: string;
  name: string;
  costPrice: number;
  quantity: number;
  unit: string;
  createdAt: string;
};

export type Product = {
  id: string;
  name: string;
  sellingPrice: number;
  costPrice?: number; // For retail items without recipes
  materials: {
    materialId: string;
    quantity: number;
  }[];
  createdAt: string;
};


export type Sale = {
  id: string;
  productName: string;
  quantity: number;
  totalAmount: number;
  costAmount?: number; // Cost of Goods Sold
  paymentMethod: 'Cash' | 'Card' | 'Transfer';
  date: string;
};

export type Insight = {
  id: string;
  message: string;
  relevanceScore: number;
};

export type Kpi = {
  title: string;
  value: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
  icon: React.ElementType;
  description: string;
};
