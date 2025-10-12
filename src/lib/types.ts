export type User = {
  id: string;
  name: string;
  email: string;
  businessName: string;
  avatarUrl?: string;
};

export type Ingredient = {
  id: string;
  name: string;
  costPrice: number;
  quantity: number;
  unit: string;
  createdAt: string;
};

export type Recipe = {
  id: string;
  name: string;
  sellingPrice: number;
  ingredients: {
    ingredientId: string;
    quantity: number;
  }[];
  createdAt: string;
};


export type Sale = {
  id: string;
  productName: string;
  quantity: number;
  totalAmount: number;
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
