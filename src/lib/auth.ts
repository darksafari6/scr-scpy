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
    if (authError.code === 'auth/cancelled-popup-request' || authError.code === 'auth/popup-closed-by-user') {
      // User closed the popup, don't log as an error
      console.warn('Sign-in cancelled by user');
    } else {
      console.error('Login error:', authError);
    }
    throw error;
  }
};

export const logout = () => signOut(auth);
