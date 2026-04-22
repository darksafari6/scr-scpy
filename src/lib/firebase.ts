import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);

/**
 * Mandatory Firestore error handler for AI Studio integration.
 * Throws a JSON string of FirestoreErrorInfo when permissions are denied.
 */
export async function handleFirestoreError(error: any, operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write', path: string | null = null) {
  if (error && error.code === 'permission-denied') {
    const user = auth.currentUser;
    const errorInfo = {
      error: error.message || 'Missing or insufficient permissions',
      operationType: operationType,
      path: path,
      authInfo: {
        userId: user?.uid || 'unauthenticated',
        email: user?.email || 'unauthenticated',
        emailVerified: user?.emailVerified || false,
        isAnonymous: user?.isAnonymous || false,
        providerInfo: user?.providerData.map(p => ({
          providerId: p.providerId,
          displayName: p.displayName || '',
          email: p.email || ''
        })) || []
      }
    };
    throw new Error(JSON.stringify(errorInfo));
  }
  throw error;
}
