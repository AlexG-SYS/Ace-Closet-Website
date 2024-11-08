import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  doc,
  setDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private productsCollection;

  constructor(private firestore: Firestore) {
    this.productsCollection = collection(this.firestore, 'products');
  }

  // Method to write data to Firestore
  addItem(data: any): Promise<any> {
    return addDoc(this.productsCollection, data);
  }

  // Method to read data from Firestore
  getItems(): Observable<any[]> {
    return collectionData(this.productsCollection, { idField: 'id' });
  }

  // Method to update a specific document
  updateItem(id: string, data: any): Promise<void> {
    const docRef = doc(this.firestore, `products/${id}`);
    return setDoc(docRef, data, { merge: true });
  }
}