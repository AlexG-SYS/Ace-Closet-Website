import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Analytics, logEvent } from '@angular/fire/analytics';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PageTrackingService {
  private analytics = inject(Analytics);
  private router = inject(Router);

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        logEvent(this.analytics, 'page_view', {
          page_path: event.urlAfterRedirects,
          page_location: window.location.href,
          page_title: document.title,
        });
        console.log(`📊 page_view logged for ${event.urlAfterRedirects}`);
      });
  }
}
