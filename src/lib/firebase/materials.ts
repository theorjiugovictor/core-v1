import { db, Collections } from './config';
import type { Material } from '../types';

export const materialsService = {
  // Get all materials for a user
  async getAll(userId: string): Promise<Material[]> {
    try {
      const snapshot = await db
        .collection(Collections.MATERIALS)
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Material[];
    } catch (error) {
      console.error('Error getting materials:', error);
      throw new Error('Failed to fetch materials');
    }
  },

  // Get a single material by ID
  async getById(id: string, userId: string): Promise<Material | null> {
    try {
      const doc = await db.collection(Collections.MATERIALS).doc(id).get();

      if (!doc.exists) {
        return null;
      }

      const data = doc.data();

      // Verify ownership
      if (data?.userId !== userId) {
        throw new Error('Unauthorized access to material');
      }

      return { id: doc.id, ...data } as Material;
    } catch (error) {
      console.error('Error getting material:', error);
      throw new Error('Failed to fetch material');
    }
  },

  // Create a new material
  async create(material: Omit<Material, 'id'> & { userId: string }): Promise<Material> {
    try {
      const docRef = await db.collection(Collections.MATERIALS).add({
        ...material,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const doc = await docRef.get();
      return { id: doc.id, ...doc.data() } as Material;
    } catch (error) {
      console.error('Error creating material:', error);
      throw new Error('Failed to create material');
    }
  },

  // Update a material
  async update(id: string, userId: string, updates: Partial<Material>): Promise<Material> {
    try {
      const docRef = db.collection(Collections.MATERIALS).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new Error('Material not found');
      }

      const data = doc.data();

      // Verify ownership
      if (data?.userId !== userId) {
        throw new Error('Unauthorized access to material');
      }

      await docRef.update({
        ...updates,
        updatedAt: new Date().toISOString(),
      });

      const updatedDoc = await docRef.get();
      return { id: updatedDoc.id, ...updatedDoc.data() } as Material;
    } catch (error) {
      console.error('Error updating material:', error);
      throw new Error('Failed to update material');
    }
  },

  // Delete a material
  async delete(id: string, userId: string): Promise<void> {
    try {
      const docRef = db.collection(Collections.MATERIALS).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new Error('Material not found');
      }

      const data = doc.data();

      // Verify ownership
      if (data?.userId !== userId) {
        throw new Error('Unauthorized access to material');
      }

      await docRef.delete();
    } catch (error) {
      console.error('Error deleting material:', error);
      throw new Error('Failed to delete material');
    }
  },
};
