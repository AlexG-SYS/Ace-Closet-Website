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
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
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
    try {
      // Create user and automatically sign them in
      const userCredential: UserCredential =
        await createUserWithEmailAndPassword(this.auth, email, password);
      const uid = userCredential.user.uid;

      // Create Firestore doc for the user
      const userDoc = {
        uid,
        email,
        ...userData,
      };

      await setDoc(doc(this.usersCollection, uid), userDoc);

      // Save user in GlobalService
      this.globalService.setUser(userDoc);
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

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

      localStorage.setItem('userData', JSON.stringify(userData));

      return userData;
    } catch (error) {
      throw error;
    }
  }

  logout() {
    signOut(this.auth)
      .then(() => console.log('User logged out'))
      .catch((error) => console.error('Logout error:', error));
  }

  /**
   * Real-time listener for user document
   */
  private listenToUserDoc(uid: string) {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('uid', '==', uid));

    // We first get the doc id for this UID
    getDocs(q).then((snapshot) => {
      if (!snapshot.empty) {
        const docId = snapshot.docs[0].id;
        const userRef = doc(this.firestore, 'users', docId);

        onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const updatedData = { id: docSnap.id, ...docSnap.data() };
            localStorage.setItem('userData', JSON.stringify(updatedData));
            this.globalService.setUser(updatedData);
          }
        });
      }
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

          // ✅ Start listening for real-time updates
          this.listenToUserDoc(user.uid);
        } else {
          console.log('🚫 No user currently logged in');
        }
        resolve();
      });
    });
  }

  getCartItems(): Observable<DocumentData[]> {
    const cartCollection = collection(this.firestore, 'cart');
    return collectionData(cartCollection, { idField: 'id' }) as Observable<
      DocumentData[]
    >;
  }

  setCartItem(
    userId: string,
    productId: string,
    quantity: number
  ): Promise<void> {
    const cartDoc = doc(this.firestore, 'cart', userId);
    return setDoc(cartDoc, {
      productId,
      quantity,
    });
  }

  async updateUserCartWishlist(
    uid: string,
    field: 'cart' | 'wishlist',
    item: any,
    action: 'add' | 'remove' = 'add'
  ): Promise<boolean> {
    try {
      const userDoc = await this.getUserDocByUID(uid);
      const userRef = doc(this.firestore, 'users', userDoc['id']);

      const docSnap = await getDoc(userRef);
      if (!docSnap.exists()) throw new Error('User document not found');

      let arr = docSnap.data()[field] || [];

      if (action === 'add') {
        const existingIndex = arr.findIndex(
          (i: any) => i.productId === item.productId
        );

        if (existingIndex !== -1) {
          arr[existingIndex] = {
            ...arr[existingIndex],
            quantity: item.quantity || 1,
          };
        } else {
          arr.push(item);
        }
      } else if (action === 'remove') {
        arr = arr.filter((i: any) => i.productId !== item.productId);
      }

      await updateDoc(userRef, { [field]: arr });

      return true;
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      return false;
    }
  }

  async updateCartQuantity(
    uid: string,
    productId: string,
    quantity: number
  ): Promise<boolean> {
    try {
      const userDoc = await this.getUserDocByUID(uid);
      const userRef = doc(this.firestore, 'users', userDoc['id']);

      let updatedCart = (userDoc['cart'] || []).map((item: any) =>
        item.productId === productId ? { ...item, quantity } : item
      );

      await updateDoc(userRef, { cart: updatedCart });

      return true;
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      return false;
    }
  }
}
