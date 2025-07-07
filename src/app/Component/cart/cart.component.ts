import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
    selector: 'app-cart',
    imports: [RouterOutlet, RouterLink],
    templateUrl: './cart.component.html',
    styleUrl: './cart.component.scss'
})
export class CartComponent {
  quantity: number = 1;

  increaseQuantity() {
    this.quantity += 1;
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity -= 1;
    }
  }

  removeItem() {
    // Logic to remove the item from the cart
    console.log('Item removed from cart');
  }

  moveToWishlist() {
    console.log('Item moved to wish list');
  }
  editItem() {
    console.log('Item edited');
  }
}
