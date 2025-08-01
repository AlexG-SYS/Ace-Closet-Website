import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  doc,
  setDoc,
  DocumentData,
  where,
  getDocs,
  query,
} from '@angular/fire/firestore';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
  onAuthStateChanged,
} from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private usersCollection;

  constructor(
    private firestore: Firestore,
    private auth: Auth,
    private globalService: GlobalService
  ) {
    this.usersCollection = collection(this.firestore, 'users');
  }

  async registerUser(
    email: string,
    password: string,
    userData: any
  ): Promise<void> {
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
      this.auth,
      email,
      password
    );
    const uid = userCredential.user.uid;

    // Save user in Firestore using UID as document ID
    await setDoc(doc(this.usersCollection), {
      uid,
      email,
      ...userData, // e.g., name, phone, role
    });
  }

  // 🔍 Helper: Get user doc by UID field
  private async getUserDocByUID(uid: string): Promise<DocumentData> {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('uid', '==', uid));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error('No user document found for UID: ' + uid);
    }

    const userDoc = querySnapshot.docs[0];
    return {
      id: userDoc.id,
      ...userDoc.data(),
    };
  }

  async signInUser(email: string, password: string): Promise<DocumentData> {
    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      const uid = userCredential.user.uid;
      const userData = await this.getUserDocByUID(uid);

      // ✅ Cache user data in localStorage
      localStorage.setItem('userData', JSON.stringify(userData));

      return userData;
    } catch (error) {
      throw error; // Re-throw so caller can handle it
    }
  }

  logout() {
    signOut(this.auth)
      .then(() => {
        // Sign-out successful.
        console.log('User logged out');
      })
      .catch((error) => {
        // An error happened.
        console.error('Logout error:', error);
      });
  }

  initializeUser(): Promise<void> {
    return new Promise((resolve) => {
      onAuthStateChanged(this.auth, async (user) => {
        if (user) {
          const cached = localStorage.getItem('userData');
          let parsed = null;

          if (cached) {
            try {
              parsed = JSON.parse(cached);
            } catch (e) {
              console.warn('Error parsing cached user:', e);
            }
          }

          if (parsed && parsed.email === user.email) {
            this.globalService.setUser(parsed);
          } else {
            const userDoc = await this.getUserDocByUID(user.uid);
            if (userDoc) {
              localStorage.setItem('userData', JSON.stringify(userDoc));
              this.globalService.setUser(userDoc);
            } else {
              console.warn('❌ No user doc found in Firestore');
            }
          }
        } else {
          console.log('🚫 No user currently logged in');
        }
        resolve(); // ✅ Always resolve when done
      });
    });
  }
}
