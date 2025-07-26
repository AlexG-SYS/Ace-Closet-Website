import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  setDoc,
  Timestamp,
  query,
  where,
  getDocs,
  orderBy,
  getDoc,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private productsCollection;

  constructor(private firestore: Firestore) {
    this.productsCollection = collection(this.firestore, 'products');
  }

  // ---------- LOAD MORE: All Products ----------
  async getAllProducts(
    lastDoc: QueryDocumentSnapshot<DocumentData> | null = null
  ): Promise<{
    products: any[];
    lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  }> {
    console.log(lastDoc);
    try {
      let constraints: any[] = [
        where('status', '==', 'active'),
        where('online', '==', true),
        orderBy('price', 'asc'),
        limit(3),
      ];

      if (lastDoc) {
        constraints.push(startAfter(lastDoc));
      }

      const productsQuery = query(this.productsCollection, ...constraints);
      const querySnapshot = await getDocs(productsQuery);

      const products = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Partial<any>),
      }));

      const newLastDoc =
        querySnapshot.docs[querySnapshot.docs.length - 1] || null;

      return { products, lastDoc: newLastDoc };
    } catch (error) {
      console.error('Error retrieving products:', error);
      throw new Error('Failed to retrieve products. Please try again later.');
    }
  }

  // ---------- LOAD MORE: By Category ----------
  async getProductsByCategory(
    category: string,
    lastDoc: QueryDocumentSnapshot<DocumentData> | null = null
  ): Promise<{
    products: any[];
    lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  }> {
    try {
      let constraints: any[] = [
        where('status', '==', 'active'),
        where('online', '==', true),
        where('category', '==', category),
        orderBy('price', 'asc'),
        limit(12),
      ];

      if (lastDoc) {
        constraints.push(startAfter(lastDoc));
      }

      const productsQuery = query(this.productsCollection, ...constraints);
      const querySnapshot = await getDocs(productsQuery);

      const products = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Partial<any>),
      }));

      const newLastDoc =
        querySnapshot.docs[querySnapshot.docs.length - 1] || null;

      return { products, lastDoc: newLastDoc };
    } catch (error) {
      console.error('Error retrieving products by category:', error);
      throw new Error('Failed to retrieve products. Please try again later.');
    }
  }

  // ---------- LOAD MORE: By Tags ----------
  async getProductsByTags(
    tags: string,
    lastDoc: QueryDocumentSnapshot<DocumentData> | null = null
  ): Promise<{
    products: any[];
    lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  }> {
    try {
      let constraints: any[] = [
        where('status', '==', 'active'),
        where('online', '==', true),
        where('tags', '==', tags),
        orderBy('price', 'asc'),
        limit(12),
      ];

      if (lastDoc) {
        constraints.push(startAfter(lastDoc));
      }

      const productsQuery = query(this.productsCollection, ...constraints);
      const querySnapshot = await getDocs(productsQuery);

      const products = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Partial<any>),
      }));

      const newLastDoc =
        querySnapshot.docs[querySnapshot.docs.length - 1] || null;

      return { products, lastDoc: newLastDoc };
    } catch (error) {
      console.error('Error retrieving products by tags:', error);
      throw new Error('Failed to retrieve products. Please try again later.');
    }
  }

  // ---------- Single Product Detail ----------
  async getProductDetails(productId: string): Promise<any> {
    try {
      const productRef = doc(this.firestore, 'products', productId);
      const productSnap = await getDoc(productRef);

      if (productSnap.exists()) {
        return {
          id: productSnap.id,
          ...(productSnap.data() as Partial<any>),
        };
      } else {
        throw new Error('Product not found');
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      throw new Error(
        'Failed to retrieve product details. Please try again later.'
      );
    }
  }
}
