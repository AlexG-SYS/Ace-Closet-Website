import { Component, Inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-quick-view-product',
  imports: [MatIconModule, MatDividerModule, MatDialogModule, DecimalPipe],
  templateUrl: './quick-view-product.component.html',
  styleUrl: './quick-view-product.component.scss',
})
export class QuickViewProductComponent implements OnInit {
  selectedSize: string = '';
  quantityOptions: number[] = [];
  selectedQuantity: number = 0;

  constructor(@Inject(MAT_DIALOG_DATA) public product: any) {}

  ngOnInit() {
    const availableQty = this.product?.quantity || 0;
    const maxQty = Math.min(availableQty, 5); // Optional: limit to max 10
    this.quantityOptions = Array.from({ length: maxQty }, (_, i) => i + 1);
  }

  isSizeApplicable(size: string): boolean {
    const productSize = this.product?.size?.trim() || '';
    return productSize === size;
  }

  SizeSelected(size: string): void {
    if (this.isSizeApplicable(size)) {
      this.selectedSize = size;
      // Additional logic here
    }
  }

  viewItem(productID: string) {
    console.log('View Product: ' + productID);

    // Determine base path
    let basePath = '';
    if (this.product.category) {
      basePath = `/category/${this.product.category}`;
    } else if (this.product.tags) {
      basePath = `/tags/${this.product.tags}`;
    } else {
      console.warn('No category or tags found!');
      return;
    }

    const url = `${basePath}/product/${productID}`;

    const isMobile = /Mobi|Android/i.test(window.navigator.userAgent);

    if (isMobile) {
      // Mobile navigation
      window.open(url, '_self');
    } else {
      // Desktop navigation
      window.open(url, '_self');
    }
  }

  addToCart(productId: string, quantity: string) {
    console.log(`Cart -- Product ID: ${productId}, Quantity: ${quantity}`);
  }

  addToWishlist(productId: string, quantity: string) {
    console.log(`Wishlist -- Product ID: ${productId}, Quantity: ${quantity}`);
  }
}
