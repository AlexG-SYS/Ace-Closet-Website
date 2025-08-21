import { Component, Inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import { DecimalPipe } from '@angular/common';
import { UsersService } from '../../Service/users.service';
import { GlobalService } from '../../Service/global.service';

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
  addingError = '';
  addingSuccess = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public product: any,
    private userService: UsersService,
    private globalService: GlobalService
  ) {}

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

  addingToCart: boolean = false;
  async addToCart(productId: string, quantity: string) {
    let user = this.globalService.getUser();
    this.addingToCart = true;

    if (!this.selectedSize) {
      this.addingToCart = false;
      this.addingError = 'Select a Size Before Adding to Cart';
      setTimeout(() => {
        this.addingError = '';
      }, 5000);
      return;
    }

    if (!user) {
      this.addingToCart = false;
      this.addingError = 'Sign-in to Add Items to your Cart';
      setTimeout(() => {
        this.addingError = '';
      }, 5000);
      return;
    }

    if (!quantity || quantity == '0') {
      this.addingToCart = false;
      this.addingError = 'Out of Stock';
      setTimeout(() => {
        this.addingError = '';
      }, 5000);
      return;
    }

    const success = await this.userService.updateUserCartWishlist(
      user.uid,
      'cart',
      { productId: productId, quantity: Number(quantity) },
      'add'
    );

    if (success) {
      this.addingSuccess = 'Product Added to Cart';
      setTimeout(() => {
        this.addingSuccess = '';
      }, 5000);
      this.addingError = '';
      this.addingToCart = false;
    } else {
      this.addingError = 'Error adding Product to Cart';
      setTimeout(() => {
        this.addingError = '';
      }, 5000);
      this.addingToCart = false;
    }
  }

  addingToWishlist: boolean = false;
  async addToWishlist(productId: string, quantity: string) {
    let user = this.globalService.getUser();
    this.addingToWishlist = true;

    if (!user) {
      this.addingToWishlist = false;
      this.addingError = 'Sign-in to Add Items to your Wishlist';
      return;
    }

    if (!quantity || quantity === '0') {
      this.addingToWishlist = false;
      this.addingError = 'Out of Stock';
      setTimeout(() => {
        this.addingError = '';
      }, 5000);
      return;
    }

    const success = await this.userService.updateUserCartWishlist(
      user.uid,
      'wishlist',
      { productId: productId },
      'add'
    );

    if (success) {
      this.addingSuccess = 'Product Added to Wishlist';
      setTimeout(() => {
        this.addingSuccess = '';
      }, 5000);
      this.addingError = '';
      this.addingToWishlist = false;
    } else {
      this.addingError = 'Error adding Product to Wishlist';
      setTimeout(() => {
        this.addingError = '';
      }, 5000);

      this.addingToWishlist = false;
    }
  }
}
