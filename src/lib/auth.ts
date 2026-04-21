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
    if (authError.code !== 'auth/popup-closed-by-user') {
      alert('Failed to sign in securely. Please try again.');
    }
  }
};

export const logout = () => signOut(auth);
