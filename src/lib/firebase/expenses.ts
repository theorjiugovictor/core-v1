import { AggregateField } from 'firebase-admin/firestore';
import { db, Collections } from './config';
import type { Expense } from '../types';

export const expensesService = {
    // Most recent expenses for a user, newest first (for lists).
    // Uses the composite index (userId ASC, date DESC) in firestore.indexes.json.
    async getAll(userId: string, limit = 100): Promise<Expense[]> {
        try {
            const snapshot = await db
                .collection(Collections.EXPENSES)
                .where('userId', '==', userId)
                .orderBy('date', 'desc')
                .limit(limit)
                .get();
            return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Expense[];
        } catch (error) {
            console.error('Error getting expenses:', error);
            throw new Error('Failed to fetch expenses');
        }
    },

    // Every expense in [start, end). Use this for totals: getAll() is capped
    // for display and must never be summed.
    async getInRange(userId: string, start: Date | null, end?: Date | null): Promise<Expense[]> {
        try {
            let query = db.collection(Collections.EXPENSES).where('userId', '==', userId);
            if (start) query = query.where('date', '>=', start.toISOString());
            if (end) query = query.where('date', '<', end.toISOString());
            const snapshot = await query.orderBy('date', 'desc').get();
            return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Expense[];
        } catch (error) {
            console.error('Error getting expenses in range:', error);
            throw new Error('Failed to fetch expenses');
        }
    },

    // Sum and count of expenses in [start, end), computed by Firestore.
    async getTotal(userId: string, start?: Date | null, end?: Date | null) {
        try {
            let query = db.collection(Collections.EXPENSES).where('userId', '==', userId);
            if (start) query = query.where('date', '>=', start.toISOString());
            if (end) query = query.where('date', '<', end.toISOString());
            const snapshot = await query
                .aggregate({ total: AggregateField.sum('amount'), count: AggregateField.count() })
                .get();
            const data = snapshot.data();
            return { total: data.total || 0, count: data.count || 0 };
        } catch (error) {
            console.error('Error getting expense total:', error);
            throw new Error('Failed to fetch expense total');
        }
    },

    // Create a new expense
    async create(expense: Omit<Expense, 'id'>): Promise<Expense> {
        try {
            // I'll stick to 'expenses' literal for now and update config next.
            const docRef = await db.collection(Collections.EXPENSES).add({
                ...expense,
                createdAt: new Date().toISOString(),
            });

            const doc = await docRef.get();
            return { id: doc.id, ...doc.data() } as Expense;
        } catch (error) {
            console.error('Error creating expense:', error);
            throw new Error('Failed to create expense');
        }
    },

    // Delete an expense
    async delete(id: string, userId: string) {
        try {
            const docRef = db.collection(Collections.EXPENSES).doc(id);
            const doc = await docRef.get();

            if (!doc.exists) {
                throw new Error('Expense not found');
            }

            const existingData = doc.data();
            if (existingData?.userId !== userId) {
                throw new Error('Unauthorized');
            }

            await docRef.delete();
        } catch (error) {
            console.error('Error deleting expense:', error);
            throw new Error('Failed to delete expense');
        }
    },
};
