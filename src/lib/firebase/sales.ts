import { db, Collections } from './config';
import type { Sale } from '../types';

export const salesService = {
  // Get all sales for a user
  async getAll(userId: string): Promise<Sale[]> {
    try {
      const snapshot = await db
        .collection(Collections.SALES)
        .where('userId', '==', userId)
        .get();

      // Sort in memory to avoid composite index requirement
      const sales = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Sale[];

      return sales
        .sort((a, b) => {
          const dateA = new Date(a.date || 0).getTime();
          const dateB = new Date(b.date || 0).getTime();
          return dateB - dateA; // desc order
        })
        .slice(0, 100); // limit to 100 results
    } catch (error) {
      console.error('Error getting sales:', error);
      throw new Error('Failed to fetch sales');
    }
  },

  // Get a single sale by ID
  async getById(id: string, userId: string): Promise<Sale | null> {
    try {
      const doc = await db.collection(Collections.SALES).doc(id).get();

      if (!doc.exists) {
        return null;
      }

      const data = doc.data();

      // Verify ownership
      if (data?.userId !== userId) {
        throw new Error('Unauthorized access to sale');
      }

      return { id: doc.id, ...data } as Sale;
    } catch (error) {
      console.error('Error getting sale:', error);
      throw new Error('Failed to fetch sale');
    }
  },

  // Create a new sale
  async create(sale: Omit<Sale, 'id'> & { userId: string }): Promise<Sale> {
    try {
      const docRef = await db.collection(Collections.SALES).add({
        ...sale,
        createdAt: new Date().toISOString(),
      });

      const doc = await docRef.get();
      return { id: doc.id, ...doc.data() } as Sale;
    } catch (error) {
      console.error('Error creating sale:', error);
      throw new Error('Failed to create sale');
    }
  },

  // Get sales analytics
  async getAnalytics(userId: string, startDate?: Date, endDate?: Date) {
    try {
      let query = db.collection(Collections.SALES).where('userId', '==', userId);

      if (startDate) {
        query = query.where('date', '>=', startDate.toISOString());
      }

      if (endDate) {
        query = query.where('date', '<=', endDate.toISOString());
      }

      const snapshot = await query.get();
      const sales = snapshot.docs.map((doc) => doc.data() as Sale);

      const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
      const totalSales = sales.length;
      const averageSaleAmount = totalSales > 0 ? totalRevenue / totalSales : 0;

      // Payment method breakdown
      const paymentMethodBreakdown = sales.reduce((acc, sale) => {
        acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalRevenue,
        totalSales,
        averageSaleAmount,
        paymentMethodBreakdown,
      };
    } catch (error) {
      console.error('Error getting sales analytics:', error);
      throw new Error('Failed to fetch sales analytics');
    }
  },
};
