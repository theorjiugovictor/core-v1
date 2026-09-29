import { AggregateField } from 'firebase-admin/firestore';
import { db, Collections } from './config';
import type { Sale } from '../types';

export const salesService = {
  // Get sales for a user, newest first. Pass `limit` for UI lists; omit it only
  // for exports, since it reads every sale the user has ever recorded.
  // Uses the composite index (userId ASC, date DESC) in firestore.indexes.json.
  async getAll(userId: string, limit?: number): Promise<Sale[]> {
    try {
      let query = db
        .collection(Collections.SALES)
        .where('userId', '==', userId)
        .orderBy('date', 'desc');
      if (typeof limit === 'number' && limit > 0) query = query.limit(limit);

      const snapshot = await query.get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Sale[];
    } catch (error) {
      console.error('Error getting sales:', error);
      throw new Error('Failed to fetch sales');
    }
  },

  // Sales in [start, end), newest first. Reads only the documents in range,
  // so cost stays flat as a customer's history grows.
  async getInRange(userId: string, start: Date | null, end?: Date | null): Promise<Sale[]> {
    try {
      let query = db.collection(Collections.SALES).where('userId', '==', userId);
      if (start) query = query.where('date', '>=', start.toISOString());
      if (end) query = query.where('date', '<', end.toISOString());
      const snapshot = await query.orderBy('date', 'desc').get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Sale[];
    } catch (error) {
      console.error('Error getting sales in range:', error);
      throw new Error('Failed to fetch sales');
    }
  },

  // Revenue, cost and count in [start, end) computed by Firestore itself.
  // Billed at 1 read per 1,000 index entries instead of 1 read per sale.
  async getTotals(userId: string, start?: Date | null, end?: Date | null) {
    try {
      let query = db.collection(Collections.SALES).where('userId', '==', userId);
      if (start) query = query.where('date', '>=', start.toISOString());
      if (end) query = query.where('date', '<', end.toISOString());
      const snapshot = await query
        .aggregate({
          revenue: AggregateField.sum('totalAmount'),
          cost: AggregateField.sum('costAmount'),
          count: AggregateField.count(),
        })
        .get();
      const data = snapshot.data();
      return { revenue: data.revenue || 0, cost: data.cost || 0, count: data.count || 0 };
    } catch (error) {
      console.error('Error getting sales totals:', error);
      throw new Error('Failed to fetch sales totals');
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
  // Update a sale
  async update(id: string, userId: string, data: Partial<Sale>) {
    try {
      const docRef = db.collection(Collections.SALES).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new Error('Sale not found');
      }

      const existingData = doc.data();
      if (existingData?.userId !== userId) {
        throw new Error('Unauthorized');
      }

      await docRef.update(data);
    } catch (error) {
      console.error('Error updating sale:', error);
      throw new Error('Failed to update sale');
    }
  },

  // Delete a sale
  async delete(id: string, userId: string) {
    try {
      const docRef = db.collection(Collections.SALES).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new Error('Sale not found');
      }

      const existingData = doc.data();
      if (existingData?.userId !== userId) {
        throw new Error('Unauthorized');
      }

      await docRef.delete();
    } catch (error) {
      console.error('Error deleting sale:', error);
      throw new Error('Failed to delete sale');
    }
  },
};
