import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { MatDividerModule } from '@angular/material/divider';
import { QuickViewProductComponent } from '../quick-view-product/quick-view-product.component';


@Component({
    selector: 'app-product-details',
    imports: [MatIconModule, MatDividerModule, QuickViewProductComponent],
    templateUrl: './product-details.component.html',
    styleUrl: './product-details.component.scss'
})
export class ProductDetailsComponent {

  category: string | null = 'null2';
  subCategory: string | null = null;
  categorySubject = new BehaviorSubject<string | null>(null);

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private dialog: MatDialog) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.category = params['category'];
      this.categorySubject.next(this.category);
      console.log('Updated Category:', this.category); // Log here directly
    });

    this.subCategory = 'Sub Category'
  }

  viewItem(productID: string) {
    console.log('View Product: ' + productID);
    const url = `/category/${this.category}/product/${productID}`;

    // Check if the user is on a mobile device
    const isMobile = /Mobi|Android/i.test(window.navigator.userAgent);

    if (isMobile) {
      // Mobile behavior
      this.router.navigate(['/category', this.category, 'product', productID]);
    } else {
      // Desktop behavior
      window.open(url, '_blank'); // Opens the URL in a new tab
    }
  }

  quickView(event: Event) {
    event.stopPropagation();
    this.dialog.open(QuickViewProductComponent, {
      maxWidth: '900px'
    });
  }

  heartItem(event: Event) {
    event.stopPropagation();
    console.log('Hearted Item:');
  }
}
