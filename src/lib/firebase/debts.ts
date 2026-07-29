import { db, Collections } from './config';

export interface Debt {
  id: string;
  userId: string;
  customerName: string;
  amountOwed: number;
  originalAmount: number;
  type: 'CUSTOMER' | 'SUPPLIER';
  status: 'UNPAID' | 'PARTIAL' | 'PAID';
  notes?: string;
  lastPaymentDate?: string;
  createdAt: string;
  updatedAt: string;
}

export const debtsService = {
  // Get all debts for a user
  async getAll(userId: string): Promise<Debt[]> {
    try {
      const snapshot = await db
        .collection(Collections.DEBTS)
        .where('userId', '==', userId)
        .get();

      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Debt));
    } catch (error) {
      console.error('Error fetching debts:', error);
      return [];
    }
  },

  // Get active unpaid/partial debts
  async getUnpaid(userId: string): Promise<Debt[]> {
    try {
      const all = await this.getAll(userId);
      return all.filter(d => d.amountOwed > 0);
    } catch (error) {
      console.error('Error fetching unpaid debts:', error);
      return [];
    }
  },

  // Find debt by customer name
  async getByCustomer(userId: string, customerName: string): Promise<Debt | null> {
    try {
      const all = await this.getAll(userId);
      const target = customerName.trim().toLowerCase();
      return all.find(d => d.customerName.trim().toLowerCase() === target && d.amountOwed > 0) || null;
    } catch (error) {
      console.error('Error getting debt by customer:', error);
      return null;
    }
  },

  // Create or add to debt
  async recordDebt(data: {
    userId: string;
    customerName: string;
    amount: number;
    notes?: string;
    type?: 'CUSTOMER' | 'SUPPLIER';
  }): Promise<Debt> {
    try {
      const existing = await this.getByCustomer(data.userId, data.customerName);
      const now = new Date().toISOString();

      if (existing) {
        const newAmountOwed = existing.amountOwed + data.amount;
        const newOriginal = existing.originalAmount + data.amount;
        await db.collection(Collections.DEBTS).doc(existing.id).update({
          amountOwed: newAmountOwed,
          originalAmount: newOriginal,
          status: 'UNPAID',
          updatedAt: now,
        });
        return { ...existing, amountOwed: newAmountOwed, originalAmount: newOriginal, status: 'UNPAID', updatedAt: now };
      }

      const newDocRef = await db.collection(Collections.DEBTS).add({
        userId: data.userId,
        customerName: data.customerName.trim(),
        amountOwed: data.amount,
        originalAmount: data.amount,
        type: data.type || 'CUSTOMER',
        status: 'UNPAID',
        notes: data.notes || '',
        createdAt: now,
        updatedAt: now,
      });

      const doc = await newDocRef.get();
      return { id: doc.id, ...doc.data() } as Debt;
    } catch (error) {
      console.error('Error recording debt:', error);
      throw new Error('Failed to record debt');
    }
  },

  // Record a payment against a customer's debt
  async recordPayment(userId: string, customerName: string, amountPaid: number): Promise<{ success: boolean; message: string; remaining: number }> {
    try {
      const existing = await this.getByCustomer(userId, customerName);
      if (!existing) {
        return {
          success: false,
          message: `No active unpaid debt found for "${customerName}".`,
          remaining: 0,
        };
      }

      const now = new Date().toISOString();
      const remaining = Math.max(0, existing.amountOwed - amountPaid);
      const newStatus = remaining === 0 ? 'PAID' : 'PARTIAL';

      await db.collection(Collections.DEBTS).doc(existing.id).update({
        amountOwed: remaining,
        status: newStatus,
        lastPaymentDate: now,
        updatedAt: now,
      });

      return {
        success: true,
        message: remaining === 0
          ? `Recorded ₦${amountPaid.toLocaleString()} payment from ${existing.customerName}. Debt is fully paid off! 🎉`
          : `Recorded ₦${amountPaid.toLocaleString()} payment from ${existing.customerName}. Remaining balance: ₦${remaining.toLocaleString()}.`,
        remaining,
      };
    } catch (error) {
      console.error('Error recording debt payment:', error);
      throw new Error('Failed to record debt payment');
    }
  },
};
