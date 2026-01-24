import { db, Collections } from './config';
import type { Product } from '../types';

export const productsService = {
  // Get all products for a user
  async getAll(userId: string): Promise<Product[]> {
    try {
      const snapshot = await db
        .collection(Collections.PRODUCTS)
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
    } catch (error) {
      console.error('Error getting products:', error);
      throw new Error('Failed to fetch products');
    }
  },

  // Get a single product by ID
  async getById(id: string, userId: string): Promise<Product | null> {
    try {
      const doc = await db.collection(Collections.PRODUCTS).doc(id).get();

      if (!doc.exists) {
        return null;
      }

      const data = doc.data();

      // Verify ownership
      if (data?.userId !== userId) {
        throw new Error('Unauthorized access to product');
      }

      return { id: doc.id, ...data } as Product;
    } catch (error) {
      console.error('Error getting product:', error);
      throw new Error('Failed to fetch product');
    }
  },

  // Create a new product
  async create(product: Omit<Product, 'id'> & { userId: string }): Promise<Product> {
    try {
      const docRef = await db.collection(Collections.PRODUCTS).add({
        ...product,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const doc = await docRef.get();
      return { id: doc.id, ...doc.data() } as Product;
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error('Failed to create product');
    }
  },

  // Update a product
  async update(id: string, userId: string, updates: Partial<Product>): Promise<Product> {
    try {
      const docRef = db.collection(Collections.PRODUCTS).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new Error('Product not found');
      }

      const data = doc.data();

      // Verify ownership
      if (data?.userId !== userId) {
        throw new Error('Unauthorized access to product');
      }

      await docRef.update({
        ...updates,
        updatedAt: new Date().toISOString(),
      });

      const updatedDoc = await docRef.get();
      return { id: updatedDoc.id, ...updatedDoc.data() } as Product;
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error('Failed to update product');
    }
  },

  // Delete a product
  async delete(id: string, userId: string): Promise<void> {
    try {
      const docRef = db.collection(Collections.PRODUCTS).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new Error('Product not found');
      }

      const data = doc.data();

      // Verify ownership
      if (data?.userId !== userId) {
        throw new Error('Unauthorized access to product');
      }

      await docRef.delete();
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error('Failed to delete product');
    }
  },
};
