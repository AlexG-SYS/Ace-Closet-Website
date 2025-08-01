import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GlobalService {
  private userSource = new BehaviorSubject<any>(null);
  currentUser$ = this.userSource.asObservable();

  setUser(user: any) {
    this.userSource.next(user);
  }

  getUser() {
    return this.userSource.value;
  }

  clearUser() {
    this.userSource.next(null);
  }
}
