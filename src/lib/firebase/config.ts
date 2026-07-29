import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin (for server-side operations)
const initializeFirebaseAdmin = () => {
  if (getApps().length === 0) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      try {
        let keyStr = process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim();
        if (!keyStr.startsWith('{') && keyStr.length > 50) {
          keyStr = Buffer.from(keyStr, 'base64').toString('utf-8');
        }
        const serviceAccount = JSON.parse(keyStr);
        if (typeof serviceAccount.private_key === 'string') {
          serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }
        initializeApp({
          credential: cert(serviceAccount),
          projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id,
        });
      } catch (error) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY, falling back to default options:', error);
        initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project',
        });
      }
    } else {
      // Development / default mode
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
  DEBTS: 'debts',
} as const;
