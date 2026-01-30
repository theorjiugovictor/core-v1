import { db, Collections } from './config';
import type { Expense } from '../types';

export const expensesService = {
    // Get all expenses for a user
    async getAll(userId: string): Promise<Expense[]> {
        try {
            const snapshot = await db
                .collection(Collections.EXPENSES || 'expenses')
                .where('userId', '==', userId)
                .get();

            // Sort in memory to avoid composite index requirement
            const expenses = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Expense[];

            return expenses
                .sort((a, b) => {
                    const dateA = new Date(a.date || 0).getTime();
                    const dateB = new Date(b.date || 0).getTime();
                    return dateB - dateA; // desc order
                })
                .slice(0, 100); // limit to 100 results for now
        } catch (error) {
            console.error('Error getting expenses:', error);
            throw new Error('Failed to fetch expenses');
        }
    },

    // Create a new expense
    async create(expense: Omit<Expense, 'id'>): Promise<Expense> {
        try {
            // Use 'expenses' as collection name if not in Collections enum yet, 
            // but ideally we should update config.ts. 
            // For safety, I'll use the string 'expenses' if enum fails, but let's assume I'll update config too.
            // Actually, let's just use 'expenses' string to be safe or update config.
            // I'll stick to 'expenses' literal for now and update config next.
            const docRef = await db.collection('expenses').add({
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
            const docRef = db.collection('expenses').doc(id);
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
