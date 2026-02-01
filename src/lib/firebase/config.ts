import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin (for server-side operations)
const initializeFirebaseAdmin = () => {
  if (getApps().length === 0) {
    // In production, use service account credentials
    // For development, Firebase will use application default credentials
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    } else {
      // Development mode - requires Firebase emulator or default credentials
      initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project',
      });
    }
  }
};

// Initialize admin on server
initializeFirebaseAdmin();

// Get Firestore instance
export const db = getFirestore();

// Collections
export const Collections = {
  USERS: 'users',
  MATERIALS: 'materials',
  PRODUCTS: 'products',
  SALES: 'sales',
  INSIGHTS: 'insights',
  EXPENSES: 'expenses',
  IDEAS: 'ideas',
} as const;
