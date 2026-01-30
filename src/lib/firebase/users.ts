import { db, Collections } from './config';
import type { User } from '../types';
import * as bcrypt from 'bcryptjs';

export const usersService = {
  // Get user by ID
  async getById(id: string): Promise<User | null> {
    try {
      const doc = await db.collection(Collections.USERS).doc(id).get();

      if (!doc.exists) {
        return null;
      }

      return { id: doc.id, ...doc.data() } as User;
    } catch (error) {
      console.error('Error getting user:', error);
      throw new Error('Failed to fetch user');
    }
  },

  // Get user by email
  async getByEmail(email: string): Promise<(User & { password?: string }) | null> {
    try {
      const snapshot = await db
        .collection(Collections.USERS)
        .where('email', '==', email.toLowerCase())
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as User & { password?: string };
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw new Error('Failed to fetch user');
    }
  },

  // Create a new user
  async create(userData: {
    email: string;
    password: string;
    name: string;
    businessName: string;
  }): Promise<User> {
    try {
      // Check if user already exists
      const existingUser = await this.getByEmail(userData.email);

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create user document
      const docRef = await db.collection(Collections.USERS).add({
        email: userData.email.toLowerCase(),
        password: hashedPassword,
        name: userData.name,
        businessName: userData.businessName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const doc = await docRef.get();
      const user = { id: doc.id, ...doc.data() } as User;

      // Remove password from returned object
      const { password, ...userWithoutPassword } = user as any;

      return userWithoutPassword;
    } catch (error: any) {
      console.error('Error creating user:', error);
      if (error.message === 'User with this email already exists') {
        throw error;
      }
      throw new Error('Failed to create user');
    }
  },

  // Update user
  async update(id: string, updates: Partial<User>): Promise<User> {
    try {
      const docRef = db.collection(Collections.USERS).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new Error('User not found');
      }

      await docRef.update({
        ...updates,
        updatedAt: new Date().toISOString(),
      });

      const updatedDoc = await docRef.get();
      const user = { id: updatedDoc.id, ...updatedDoc.data() } as User;

      // Remove password from returned object
      const { password, ...userWithoutPassword } = user as any;

      return userWithoutPassword;
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  },

  // Verify user credentials
  async verifyCredentials(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.getByEmail(email);

      if (!user || !user.password) {
        throw new Error('User not found');
      }

      const isValid = await bcrypt.compare(password, user.password);

      if (!isValid) {
        throw new Error('Invalid password');
      }

      // Remove password from returned object
      const { password: _, ...userWithoutPassword } = user;

      return userWithoutPassword as User;
    } catch (error) {
      console.error('Error verifying credentials:', error);
      throw error;
    }
  },
};
