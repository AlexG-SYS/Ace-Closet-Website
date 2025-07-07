import { Component, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, Router, ActivatedRoute } from '@angular/router';
import { QuickViewProductComponent } from '../quick-view-product/quick-view-product.component';
import { MatDialog } from '@angular/material/dialog';


@Component({
    selector: 'app-home',
    imports: [RouterOutlet, RouterLink],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent implements OnDestroy {
  public targetDate!: Date; // Replace with your desired future date
  public days: number = 0;
  public hours: number = 0;
  public minutes: number = 0;
  public seconds: number = 0;
  private intervalId: any;

  category: string | null = 'null';

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private dialog: MatDialog) { }


  ngOnInit() {
    this.targetDate = new Date(2025, 7, 11, 23, 59, 59);
    this.updateTimer();
    this.intervalId = setInterval(() => this.updateTimer(), 1000);
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

  updateTimer() {
    const now = new Date();
    const difference = this.targetDate.getTime() - now.getTime();

    // Calculate remaining days, hours, minutes, and seconds
    this.days = Math.floor(difference / (1000 * 60 * 60 * 24));
    this.hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    this.minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    this.seconds = Math.floor((difference % (1000 * 60)) / 1000);

    // Ensure values are always non-negative
    this.days = Math.max(this.days, 0);
    this.hours = Math.max(this.hours, 0);
    this.minutes = Math.max(this.minutes, 0);
    this.seconds = Math.max(this.seconds, 0);
  }

  navRoute(route: string) {
    this.router.navigate([
      '/category/' + route,
    ]);
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
