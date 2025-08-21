import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { MatDividerModule } from '@angular/material/divider';
import { QuickViewProductComponent } from '../quick-view-product/quick-view-product.component';
import { ProductsService } from '../../Service/products.service';
import { DecimalPipe } from '@angular/common';
import { DocumentData, QueryDocumentSnapshot } from '@angular/fire/firestore';
import { UsersService } from '../../Service/users.service';
import { GlobalService } from '../../Service/global.service';

@Component({
  selector: 'app-product-details',
  imports: [MatIconModule, MatDividerModule, DecimalPipe],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss',
})
export class ProductDetailsComponent implements OnInit {
  category: string | null = null;
  tags: string | null = null;
  subCategory: string | null = null;
  categorySubject = new BehaviorSubject<string | null>(null);
  tagsSubject = new BehaviorSubject<string | null>(null);
  product: any = { imagesURL: [''] };
  isProcessing = false;
  productID: string | null = null;
  selectedSize: string = '';
  quantityOptions: number[] = [];
  selectedQuantity: number = 0;
  products: any[] = [];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null = null;
  addingError = '';
  addingSuccess = '';

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private productService: ProductsService,
    private userService: UsersService,
    private globalService: GlobalService
  ) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe((params) => {
      this.category = params['category'];
      this.tags = params['tags'];
      this.productID = params['product'];
      this.categorySubject.next(this.category);
      this.tagsSubject.next(this.tags);
    });

    this.getProductDetails(this.productID);
    this.loadProductList();
  }

  viewItem(productID: string) {
    console.log('View Product: ' + productID);

    // Determine base path
    let basePath = '';
    if (this.category) {
      basePath = `/category/${this.category}`;
    } else if (this.tags) {
      basePath = `/tags/${this.tags}`;
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

  quickView(event: Event, product: any) {
    event.stopPropagation();
    this.dialog.open(QuickViewProductComponent, {
      maxWidth: '900px',
      data: product,
    });
  }

  getProductDetails(productID: string | null) {
    if (!productID) {
      console.warn('Product ID is not provided');
      this.product = {};
      return;
    } else {
      this.productService
        .getProductDetails(productID)
        .then((product) => {
          this.product = product;
          this.subCategory = this.product.productName;

          const availableQty = this.product.quantity || 0;
          const maxQty = Math.min(availableQty, 5); // Optional: limit to max 10
          this.quantityOptions = Array.from(
            { length: maxQty },
            (_, i) => i + 1
          );
        })
        .catch((error) => {
          console.error('Error fetching product details:', error);
          this.product = {};
          this.productID = null;
        });
    }
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

  loadProductList(loadMore: boolean = false) {
    this.isProcessing = true;

    // Only clear list if it's not a load-more call
    if (!loadMore) {
      this.products = [];
      this.lastDoc = null;
    }

    let fetchPromise: Promise<{
      products: any[];
      lastDoc: QueryDocumentSnapshot<DocumentData> | null;
    }>;

    if (this.category === 'all') {
      fetchPromise = this.productService.getAllProducts(4, this.lastDoc);
    } else if (this.tags) {
      fetchPromise = this.productService.getProductsByTags(
        this.tags!,
        4,
        this.lastDoc
      );
    } else {
      fetchPromise = this.productService.getProductsByCategory(
        this.category!,
        4,
        this.lastDoc
      );
    }

    fetchPromise
      .then(({ products, lastDoc }) => {
        this.products = [...this.products, ...products];
        this.lastDoc = lastDoc;
        this.isProcessing = false;
      })
      .catch((error) => {
        console.error('Error loading products:', error);
        this.isProcessing = false;
      });
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

    if (!quantity || quantity == '0') {
      this.addingToCart = false;
      this.addingError = 'Out of Stock';
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
