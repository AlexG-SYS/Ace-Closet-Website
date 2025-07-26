import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-wish-list',
  imports: [RouterLink],
  templateUrl: './wish-list.component.html',
  styleUrl: './wish-list.component.scss',
})
export class WishListComponent {
  removeItem() {
    throw new Error('Method not implemented.');
  }
  decreaseQuantity() {
    throw new Error('Method not implemented.');
  }
  quantity = 1;
  increaseQuantity() {
    throw new Error('Method not implemented.');
  }

  moveToCart() {
    throw new Error('Method not implemented.');
  }
}
