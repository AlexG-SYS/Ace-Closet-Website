import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, min } from 'rxjs';
import { QuickViewProductComponent } from '../quick-view-product/quick-view-product.component';
import { ProductsService } from '../../Service/products.service';
import { DecimalPipe } from '@angular/common';
import { DocumentData, QueryDocumentSnapshot } from '@angular/fire/firestore';

@Component({
  selector: 'app-product-list',
  imports: [MatIconModule, DecimalPipe],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
})
export class ProductListComponent implements OnInit {
  lastDoc: QueryDocumentSnapshot<DocumentData> | null = null;
  category: string | null = null;
  tags: string | null = null;
  products: any[] = [];
  categorySubject = new BehaviorSubject<string | null>(null);
  tagsSubject = new BehaviorSubject<string | null>(null);
  isProcessing = false;
  priceSort: string = 'Low To High';

  filterSizes: string[] = [];
  filterPriceRanges: { min: number; max: number }[] = [];
  filterColor: string[] = [];
  filterCategories: string[] = [];

  filteredProducts: any[] = [];
  selectedSizes: string[] = [];
  selectedPriceRanges: { min: number; max: number }[] = [];
  selectedColors: string[] = [];
  selectedCategories: string[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private productService: ProductsService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe((params) => {
      this.category = params['category'];
      this.tags = params['tags'];
      this.categorySubject.next(this.category);
      this.tagsSubject.next(this.tags);
    });

    this.loadProductList(false);
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
      this.router.navigate([basePath, 'product', productID]);
    } else {
      // Desktop navigation
      window.open(url, '_blank');
    }
  }

  quickView(event: Event, product: any) {
    event.stopPropagation();
    this.dialog.open(QuickViewProductComponent, {
      maxWidth: '900px',
      data: product,
    });
  }

  heartItem(event: Event) {
    event.stopPropagation();
    console.log('Hearted Item:');
  }

  loadProductList(loadMore: boolean) {
    this.isProcessing = true;

    // Reset product list and pagination if not loading more
    if (!loadMore) {
      this.products = [];
      this.lastDoc = null;
    }

    let fetchPromise: Promise<{
      products: any[];
      lastDoc: QueryDocumentSnapshot<DocumentData> | null;
    }>;

    if (this.category === 'all') {
      fetchPromise = this.productService.getAllProducts(this.lastDoc);
    } else if (this.tags) {
      fetchPromise = this.productService.getProductsByTags(
        this.tags!,
        this.lastDoc
      );
    } else {
      fetchPromise = this.productService.getProductsByCategory(
        this.category!,
        this.lastDoc
      );
    }

    fetchPromise
      .then(({ products, lastDoc }) => {
        this.products = [...this.products, ...products];
        this.lastDoc = lastDoc;
        this.isProcessing = false;

        // Only apply filters after first (non-paginated) load
        if (!loadMore) {
          this.getFilterOptions();
        }
      })
      .catch((error) => {
        console.error('Error loading products:', error);
        this.isProcessing = false;
      });
  }

  sortPrice(order: string) {
    this.priceSort = order;
    if (order === 'Low to High') {
      this.filteredProducts.sort((a, b) => a.price - b.price);
    } else if (order === 'High to Low') {
      this.filteredProducts.sort((a, b) => b.price - a.price);
    }
  }

  getFilterOptions() {
    const sizesSet = new Set<string>();
    const colorsSet = new Set<string>();
    const categoriesSet = new Set<string>();
    const prices: number[] = [];

    this.products.forEach((product) => {
      // Collect sizes
      if (product.size) {
        if (Array.isArray(product.size)) {
          product.size.forEach((s: string) => sizesSet.add(s.toLowerCase()));
        } else {
          sizesSet.add(product.size.toLowerCase());
        }
      }

      // Collect colors
      if (product.productColor) {
        if (Array.isArray(product.productColor)) {
          product.productColor.forEach((c: string) =>
            colorsSet.add(c.toLowerCase())
          );
        } else {
          colorsSet.add(product.productColor.toLowerCase());
        }
      }

      // Collect categories
      if (product.category) {
        categoriesSet.add(product.category);
      }

      // Collect prices
      if (product.price != null) {
        prices.push(product.price);
      }
    });

    const sizeOrder = [
      'x-small',
      'small',
      'medium',
      'large',
      'x-large',
      'one size',
    ];
    // Assign unique sets to component arrays
    this.filterSizes = Array.from(sizesSet).sort((a, b) => {
      const indexA = sizeOrder.indexOf(a.toLowerCase());
      const indexB = sizeOrder.indexOf(b.toLowerCase());
      return indexA - indexB;
    });
    this.filterColor = Array.from(colorsSet).sort();
    this.filterCategories = Array.from(categoriesSet).sort();

    const predefinedRanges = [
      { min: 0, max: 50 },
      { min: 50.01, max: 100 },
      { min: 100.01, max: 150 },
      { min: 150.01, max: 200 },
      { min: 200.01, max: 250 },
      { min: 250.01, max: Infinity },
    ];

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // Filter ranges that intersect with the actual price span
    this.filterPriceRanges = predefinedRanges.filter((range) => {
      return range.max >= minPrice && range.min <= maxPrice;
    });

    // Set Sorted Products
    this.filteredProducts = [...this.products];
  }

  applyFilters() {
    this.filteredProducts = this.products.filter((product) => {
      const matchesSize =
        this.selectedSizes.length === 0 ||
        (product.size &&
          this.selectedSizes.some(
            (selectedSize) =>
              product.size.toLowerCase() === selectedSize.toLowerCase()
          ));

      const matchesPrice =
        this.selectedPriceRanges.length === 0 ||
        this.selectedPriceRanges.some(
          (range) => product.price >= range.min && product.price <= range.max
        );

      return matchesSize && matchesPrice;
    });

    this.sortPrice(this.priceSort);
  }

  onSizeChange(event: Event, size: string) {
    const checkbox = event.target as HTMLInputElement;
    const normalizedSize = size.toLowerCase();

    if (checkbox.checked) {
      this.selectedSizes.push(normalizedSize);
    } else {
      this.selectedSizes = this.selectedSizes.filter(
        (s) => s !== normalizedSize
      );
    }

    this.applyFilters();
  }

  onPriceChange(event: Event, priceRange: { min: number; max: number }) {
    const checkbox = event.target as HTMLInputElement;

    if (checkbox.checked) {
      this.selectedPriceRanges.push(priceRange);
    } else {
      this.selectedPriceRanges = this.selectedPriceRanges.filter(
        (range) =>
          !(range.min === priceRange.min && range.max === priceRange.max)
      );
    }

    this.applyFilters();
  }
}
