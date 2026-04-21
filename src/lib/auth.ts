import { AuthError, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from './firebase';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const loginWithGoogle = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    const authError = error as AuthError;
    console.error('Login error:', authError);
    if (authError.code === 'auth/cancelled-popup-request' || authError.code === 'auth/popup-closed-by-user') {
      // Graceful ignore or minimal warning can be done here.
      // E.g., just returning instead of throwing avoids unhandled promises, but since Home.tsx expects errors for alerts,
      // we throw a specific exception if we want to alert. For popup cancellations, usually we don't alert the user
      // aggressively, just fail silently. Let's throw so the UI can reset its loading state.
    }
    throw error;
  }
};

export const logout = () => signOut(auth);
