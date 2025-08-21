import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { GlobalService } from '../../Service/global.service';
import { UsersService } from '../../Service/users.service';
import { ProductsService } from '../../Service/products.service';
import { DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-cart',
  imports: [RouterLink, DecimalPipe, MatIconModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent {
  globalUser: any;
  cartProducts: any[] = [];
  isProcessing: boolean = false;
  message = '';
  errorMessage = '';
  subtotal = 0;
  discount = 0;
  tax = 0;
  grandTotal = 0;
  themeDark = false;

  constructor(
    private globalService: GlobalService,
    private userServices: UsersService,
    private productServices: ProductsService
  ) {
    const savedTheme = localStorage.getItem('theme') || 'light-mode';
    this.themeDark = savedTheme === 'dark-mode';
  }

  async ngOnInit() {
    this.globalService.currentUser$.subscribe(async (user) => {
      this.globalUser = user;

      if (user?.cart?.length) {
        this.isProcessing = true;

        await this.loadCartProducts();
      } else {
        this.cartProducts = [];
        this.calculateTotals();
      }
    });
  }

  async loadCartProducts() {
    try {
      const cartItems = this.globalUser.cart; // [{ productId, qty }, ...]

      this.cartProducts = await Promise.all(
        cartItems.map(async (cartItem: any) => {
          const productDetails = await this.productServices.getProductDetails(
            cartItem.productId
          );

          // Override quantity with the cart qty
          return {
            ...productDetails,
            quantity: productDetails.quantity,
            cartQuantity: cartItem.quantity,
          };
        })
      );
      this.calculateTotals();
      this.isProcessing = false;
    } catch (error) {
      console.error('Error loading Cart products:', error);
      this.isProcessing = false;
    }
  }

  async removeItem(productId: string) {
    this.cartProducts = [];
    this.isProcessing = true;

    const success = await this.userServices.updateUserCartWishlist(
      this.globalUser.uid,
      'cart',
      { productId: productId },
      'remove'
    );

    if (success) {
      await this.loadCartProducts();
      this.isProcessing = false;
      this.message = 'Product Removed from Cart';
      setTimeout(() => {
        this.message = '';
      }, 5000);
    } else {
      await this.loadCartProducts();
      console.error('Failed to remove product from cart:', productId);
    }
  }

  async increaseQuantity(productId: string) {
    this.isProcessing = true;
    const cartItem = this.globalUser.cart.find(
      (i: any) => i.productId === productId
    );
    const product = this.cartProducts.find((p: any) => p.id === productId);

    if (!cartItem || !product) {
      console.error('Product not found in cart or cartProducts');
      this.isProcessing = false;
      return;
    }

    // Check stock availability
    if (cartItem.quantity >= product.quantity) {
      this.errorMessage =
        'Only ' + cartItem.quantity + ' Available for: ' + product.productName;
      setTimeout(() => (this.errorMessage = ''), 5000);
      this.isProcessing = false;
      return;
    }

    const newQty = cartItem.quantity + 1;
    const success = await this.userServices.updateCartQuantity(
      this.globalUser.uid,
      productId,
      newQty
    );

    if (success) {
      // Reload cart products
      await this.loadCartProducts();
    }
  }

  async decreaseQuantity(productId: string) {
    this.isProcessing = true;
    var success = false;

    const cartItem = this.globalUser.cart.find(
      (i: any) => i.productId === productId
    );

    if (!cartItem) {
      console.error('Product not found in cart');
      this.isProcessing = false;
      return;
    }

    // Prevent going below 1
    if (cartItem.quantity <= 1) {
      success = await this.userServices.updateUserCartWishlist(
        this.globalUser.uid,
        'cart',
        { productId: productId },
        'remove'
      );
    } else {
      const newQty = cartItem.quantity - 1;
      success = await this.userServices.updateCartQuantity(
        this.globalUser.uid,
        productId,
        newQty
      );
    }

    if (success) {
      this.isProcessing = false;
      await this.loadCartProducts();
    }
  }

  async moveToWishlist(productId: string) {
    this.cartProducts = [];
    this.isProcessing = true;

    const successCartRemove = await this.userServices.updateUserCartWishlist(
      this.globalUser.uid,
      'cart',
      { productId: productId },
      'remove'
    );

    const successWishlistAdd = await this.userServices.updateUserCartWishlist(
      this.globalUser.uid,
      'wishlist',
      { productId: productId },
      'add'
    );

    if (successCartRemove && successWishlistAdd) {
      await this.loadCartProducts();

      this.isProcessing = false;

      this.message = 'Product Added to Wishlist';
      setTimeout(() => {
        this.message = '';
      }, 5000);

      console.log('Product removed from Cart:', productId);
      console.log('Product Added to Wishlist:', productId);
    } else {
      await this.loadCartProducts();

      console.error('Failed to remove product from cart:', productId);
      console.error('Failed to add product to wishlist:', productId);
    }
  }

  editItem() {
    console.log('Item edited');
  }

  private calculateTotals() {
    let subtotal = 0;
    let totalDiscount = 0;

    this.cartProducts
      .filter((product) => (product.quantity || 0) > 0) // exclude out of stock
      .forEach((product) => {
        subtotal += product.price * product.cartQuantity;

        // Apply discount if any
        if (product.discountPercentage && product.discountPercentage > 0) {
          totalDiscount +=
            product.cartQuantity *
            (product.price * (product.discountPercentage / 100));
        }
      });

    this.discount = totalDiscount;
    this.subtotal = subtotal;
    this.tax = (this.subtotal - this.discount) * 0.125; // 12.5% tax
    this.grandTotal = this.subtotal - this.discount + this.tax;
  }
}
