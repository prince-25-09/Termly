import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User,
  Auth
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Firestore
} from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';
import { BorrowerSession, LoanOfferFacts } from '../types';
import { SAMPLE_OFFERS } from '../data/sampleOffers';

// Firebase Config
const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId,
  firestoreDatabaseId: firebaseConfigData.firestoreDatabaseId
};

// Initialize Firebase App instance safely
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let isFirebaseInitialized = false;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  // Initialize Firestore with specific databaseId if provided
  if (firebaseConfig.firestoreDatabaseId) {
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  } else {
    db = getFirestore(app);
  }
  isFirebaseInitialized = true;
} catch (err) {
  console.warn('Firebase client initialization note (will use local fallback):', err);
}

export { app, auth, db, isFirebaseInitialized };

// Trusted Reviewer Email check
export function isAuthorizedReviewerEmail(email?: string | null): boolean {
  if (!email) return false;
  const lower = email.toLowerCase().trim();
  return (
    lower === 'rs2631298@gmail.com' ||
    lower.endsWith('@demolender.in') ||
    lower.endsWith('@demolender.fictional.in') ||
    lower.endsWith('@google.com')
  );
}

// Sign In With Google (For Reviewers)
export async function signInReviewerWithGoogle(): Promise<{ user: User | null; isReviewer: boolean; error?: string }> {
  try {
    if (!auth) throw new Error('Firebase Auth not initialized');
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const isReviewer = isAuthorizedReviewerEmail(user.email);
    return { user, isReviewer };
  } catch (error: any) {
    console.warn('Google sign-in error:', error);
    return { user: null, isReviewer: false, error: error.message || 'Google sign-in failed' };
  }
}

// Ensure Borrower is Authenticated (Anonymous Sign-In for demo privacy)
export async function ensureBorrowerAuth(): Promise<User | null> {
  try {
    if (!auth) return null;
    if (auth.currentUser) return auth.currentUser;
    const userCred = await signInAnonymously(auth);
    return userCred.user;
  } catch (error) {
    console.warn('Anonymous sign-in notice (falling back to local session ID):', error);
    return null;
  }
}

// Log Out
export async function logOutUser(): Promise<void> {
  if (auth) {
    await signOut(auth);
  }
}

// Firestore Session Persistence Service
export async function saveSessionToFirestore(session: BorrowerSession, userId?: string): Promise<{ success: boolean; storage: 'firestore' | 'local_fallback'; error?: string }> {
  try {
    if (!db || !isFirebaseInitialized) {
      return { success: true, storage: 'local_fallback' };
    }

    const effectiveOwnerId = userId || auth?.currentUser?.uid || session.ownerId || 'guest_demo_user';
    const sessionDocRef = doc(db, 'sessions', session.sessionId);

    const payload = {
      ...session,
      ownerId: effectiveOwnerId,
      updatedAt: new Date().toISOString()
    };

    await setDoc(sessionDocRef, payload, { merge: true });
    return { success: true, storage: 'firestore' };
  } catch (err: any) {
    console.warn('Firestore save notice (fallback stored locally):', err);
    return { success: true, storage: 'local_fallback', error: err.message };
  }
}

// Firestore Session Fetch / Resume Service
export async function getSessionFromFirestore(sessionId: string): Promise<BorrowerSession | null> {
  try {
    if (!db || !isFirebaseInitialized) return null;
    const sessionDocRef = doc(db, 'sessions', sessionId);
    const snap = await getDoc(sessionDocRef);

    if (snap.exists()) {
      return snap.data() as BorrowerSession;
    }
    return null;
  } catch (err) {
    console.warn('Firestore load notice:', err);
    return null;
  }
}

// Firestore Session Delete Service
export async function deleteSessionFromFirestore(sessionId: string): Promise<boolean> {
  try {
    if (!db || !isFirebaseInitialized) return true;
    const sessionDocRef = doc(db, 'sessions', sessionId);
    await deleteDoc(sessionDocRef);
    return true;
  } catch (err) {
    console.warn('Firestore delete notice:', err);
    return false;
  }
}

// Firestore Approved Offers Service
export async function getApprovedOffersFromFirestore(): Promise<LoanOfferFacts[]> {
  try {
    if (!db || !isFirebaseInitialized) return SAMPLE_OFFERS;
    const offersCol = collection(db, 'approvedOffers');
    const snap = await getDocs(offersCol);
    if (!snap.empty) {
      return snap.docs.map(d => d.data() as LoanOfferFacts);
    }
    return SAMPLE_OFFERS;
  } catch (err) {
    console.warn('Firestore offers fetch notice, using default verified fixtures:', err);
    return SAMPLE_OFFERS;
  }
}

export async function saveApprovedOfferToFirestore(offer: LoanOfferFacts, reviewerEmail: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!db || !isFirebaseInitialized) return { success: true };
    const offerDocRef = doc(db, 'approvedOffers', offer.id);
    await setDoc(offerDocRef, {
      ...offer,
      approvedBy: reviewerEmail,
      approvedAt: new Date().toISOString()
    }, { merge: true });
    return { success: true };
  } catch (err: any) {
    console.warn('Firestore offer save notice:', err);
    return { success: false, error: err.message };
  }
}

// In-memory fallback queue when offline or simulated
const localAssistanceQueue: any[] = [];

// Assistance Request Queue Service
export async function submitAssistanceRequest(req: {
  sessionId: string;
  borrowerName?: string;
  language: string;
  topic: string;
  preferredContact?: string;
  borrowerNote?: string;
}): Promise<{
  success: boolean;
  requestId: string;
  queueNumber: number;
  storage: 'firestore' | 'local_fallback';
  error?: string;
}> {
  const requestId = `SBS-REQ-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const timestamp = new Date().toISOString();

  try {
    if (db && isFirebaseInitialized) {
      const queueCol = collection(db, 'assistanceQueue');
      const existingSnap = await getDocs(queueCol);
      const queueNumber = existingSnap.size + 1;

      const docRef = doc(db, 'assistanceQueue', requestId);
      await setDoc(docRef, {
        id: requestId,
        ...req,
        requestedAt: timestamp,
        status: 'queued',
        queueNumber,
        assignedAgent: null
      });

      return {
        success: true,
        requestId,
        queueNumber,
        storage: 'firestore'
      };
    }
  } catch (err: any) {
    console.warn('Firestore assistance queue notice (using server/local fallback):', err);
  }

  // Local/Server Fallback
  const queueNumber = localAssistanceQueue.length + 1;
  const record = {
    id: requestId,
    ...req,
    requestedAt: timestamp,
    status: 'queued',
    queueNumber,
    assignedAgent: null
  };
  localAssistanceQueue.push(record);

  // Sync to server API
  try {
    await fetch('/api/assistance-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
  } catch (e) {}

  return {
    success: true,
    requestId,
    queueNumber,
    storage: 'local_fallback'
  };
}

export async function getAssistanceQueueFromFirestore(): Promise<any[]> {
  try {
    if (db && isFirebaseInitialized) {
      const queueCol = collection(db, 'assistanceQueue');
      const snap = await getDocs(queueCol);
      if (!snap.empty) {
        return snap.docs.map(d => d.data());
      }
    }
  } catch (err) {
    console.warn('Assistance queue fetch notice:', err);
  }
  return localAssistanceQueue;
}

