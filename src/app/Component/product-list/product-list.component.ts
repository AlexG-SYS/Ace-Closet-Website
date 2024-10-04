import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { QuickViewProductComponent } from '../quick-view-product/quick-view-product.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit {
  category: string | null = null;
  products: any[] = [];
  categorySubject = new BehaviorSubject<string | null>(null);

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private dialog: MatDialog) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.category = params['category'];
      this.categorySubject.next(this.category);
      console.log('Updated Category:', this.category); // Log here directly
    });
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
    this.dialog.open(QuickViewProductComponent);
  }

  heartItem(event: Event) {
    event.stopPropagation();
    console.log('Hearted Item:');
  }
}

