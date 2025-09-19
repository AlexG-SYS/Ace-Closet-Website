import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Analytics, logEvent } from '@angular/fire/analytics';
import { Performance, trace } from '@angular/fire/performance';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PageTrackingService {
  private perf = inject(Performance);
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

        // Performance trace
        const t = trace(
          this.perf,
          `page_view_${event.urlAfterRedirects.replace(/\//g, '_')}`
        );
        t.start();
        setTimeout(() => t.stop(), 1000); // optional stop after 1s
      });
  }
}
