import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { GlobalService } from '../../Service/global.service';
import { UsersService } from '../../Service/users.service';
import { ProductsService } from '../../Service/products.service';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-wish-list',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './wish-list.component.html',
  styleUrl: './wish-list.component.scss',
})
export class WishListComponent {
  globalUser: any;
  wishlistProducts: any[] = [];
  isProcessing: boolean = false;
  message = '';
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

      if (user?.wishlist?.length) {
        this.isProcessing = true;
        await this.loadWishlistProducts();
      } else {
        this.wishlistProducts = [];
      }
    });
  }

  async loadWishlistProducts() {
    try {
      const wishlistIds = this.globalUser.wishlist;
      this.wishlistProducts = await Promise.all(
        wishlistIds.map((product: any) =>
          this.productServices.getProductDetails(product.productId)
        )
      );
      this.isProcessing = false;
    } catch (error) {
      console.error('Error loading wishlist products:', error);
    }
  }

  async removeItem(productId: string) {
    this.wishlistProducts = [];
    this.isProcessing = true;

    const success = await this.userServices.updateUserCartWishlist(
      this.globalUser.uid,
      'wishlist',
      { productId: productId },
      'remove'
    );

    if (success) {
      if (this.globalUser?.wishlist?.length) {
        await this.loadWishlistProducts();
      }
      this.isProcessing = false;
      this.message = 'Product Removed from Wishlist';
      setTimeout(() => {
        this.message = '';
      }, 5000);
    } else {
      if (this.globalUser?.wishlist?.length) {
        await this.loadWishlistProducts();
      }
      console.error('Failed to remove product from wishlist:', productId);
    }
  }

  async moveToCart(productId: string) {
    this.wishlistProducts = [];
    this.isProcessing = true;

    const successWishlistRemove =
      await this.userServices.updateUserCartWishlist(
        this.globalUser.uid,
        'wishlist',
        { productId: productId },
        'remove'
      );

    const successCartAdd = await this.userServices.updateUserCartWishlist(
      this.globalUser.uid,
      'cart',
      { productId: productId, quantity: 1 },
      'add'
    );

    if (successWishlistRemove && successCartAdd) {
      if (this.globalUser?.wishlist?.length) {
        await this.loadWishlistProducts();
      }
      this.isProcessing = false;

      this.message = 'Product Added to Cart';
      setTimeout(() => {
        this.message = '';
      }, 5000);

      console.log('Product removed from wishlist:', productId);
      console.log('Product Added to Cart:', productId);
    } else {
      if (this.globalUser?.wishlist?.length) {
        await this.loadWishlistProducts();
      }
      console.error('Failed to remove product from wishlist:', productId);
      console.error('Failed to add product to cart:', productId);
    }
  }
}
