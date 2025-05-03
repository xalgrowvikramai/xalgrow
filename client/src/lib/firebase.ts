import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  type User
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project"}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project"}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "demo-app-id",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Authentication functions
export const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // Get Firebase ID token to authenticate with our backend
    const idToken = await userCredential.user.getIdToken();
    
    // Authenticate with our backend, passing user details
    const response = await fetch('/api/auth/firebase-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        idToken,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to authenticate with server');
    }
    
    return userCredential.user;
  } catch (error) {
    console.error("Email login error:", error);
    throw error;
  }
};

export const registerWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Get Firebase ID token to authenticate with our backend
    const idToken = await userCredential.user.getIdToken();
    
    // Register with our backend
    const response = await fetch('/api/auth/firebase-register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        idToken,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to register with server');
    }
    
    return userCredential.user;
  } catch (error) {
    console.error("Email registration error:", error);
    throw error;
  }
};

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // Get Firebase ID token to authenticate with our backend
    const idToken = await result.user.getIdToken();
    
    // Authenticate with our backend, including user details
    const response = await fetch('/api/auth/firebase-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        idToken,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to authenticate with server');
    }
    
    return result.user;
  } catch (error) {
    console.error("Google login error:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    // Logout from Firebase
    await signOut(auth);
    
    // Logout from our backend
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.warn('Failed to logout from server, but logged out from Firebase');
    }
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      
      if (user) {
        try {
          // If we have a user, ensure server session is synchronized
          const idToken = await user.getIdToken();
          
          // Silently attempt to authenticate with our backend
          try {
            await fetch('/api/auth/firebase-login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                idToken,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL
              }),
            });
          } catch (err) {
            console.warn('Silent auth refresh failed', err);
          }
        } catch (err) {
          console.error('Error getting ID token', err);
        }
      }
      
      resolve(user);
    });
  });
};

export { auth };
