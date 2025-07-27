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
    docLimit: number,
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
        limit(docLimit),
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

      console.log('Products fetched:', products.length);
      console.log('New lastDoc:', newLastDoc?.id);

      return { products, lastDoc: newLastDoc };
    } catch (error) {
      console.error('Error retrieving products:', error);
      throw new Error('Failed to retrieve products. Please try again later.');
    }
  }

  // ---------- LOAD MORE: By Category ----------
  async getProductsByCategory(
    category: string,
    docLimit: number,
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
        limit(docLimit),
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
    docLimit: number,
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
        limit(docLimit),
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

  // ---------- Search Products (for live suggestions) ----------
  async searchProductsByText(
    searchText: string,
    docLimit: number = 10
  ): Promise<any[]> {
    try {
      const productsQuery = query(
        this.productsCollection,
        where('status', '==', 'active'),
        where('online', '==', true),
        limit(30)
      );

      const querySnapshot = await getDocs(productsQuery);

      const allProducts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(), // 👈 this adds all fields like name, description, brand, price, etc.
      }));

      const lowerText = searchText.toLowerCase();

      const matchingProducts = allProducts.filter((product: any) => {
        return product.description?.toLowerCase().includes(lowerText);
      });

      return matchingProducts.slice(0, docLimit); // return trimmed list
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }
}
