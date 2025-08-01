import { Routes } from '@angular/router';
import { HomePageComponent } from './Page/home-page/home-page.component';
import { ErrorPageComponent } from './Page/error-page/error-page.component';
import { HomeComponent } from './Component/home/home.component';
import { ProductListComponent } from './Component/product-list/product-list.component';
import { WishListComponent } from './Component/wish-list/wish-list.component';
import { CartComponent } from './Component/cart/cart.component';
import { FaqComponent } from './Component/faq/faq.component';
import { ProductDetailsComponent } from './Component/product-details/product-details.component';
import { CheckoutComponent } from './Component/checkout/checkout.component';
import { ProfileComponent } from './Component/profile/profile.component';

export const routes: Routes = [
  {
    path: '',
    title: 'Ace Closet BZ',
    component: HomePageComponent,
    children: [
      { path: '', title: 'Ace Closet Bz', component: HomeComponent },
      {
        path: 'search',
        title: 'Search Results | Ace Closet Bz',
        component: ProductListComponent,
      },
      {
        path: 'category/:category',
        title: 'Shop | Ace Closet Bz',
        component: ProductListComponent,
      },
      {
        path: 'tags/:tags',
        title: 'Shop | Ace Closet Bz',
        component: ProductListComponent,
      },
      {
        path: 'category/:category/product/:product',
        title: 'Shop | Ace Closet Bz',
        component: ProductDetailsComponent,
      },

      {
        path: 'tags/:tags/product/:product',
        title: 'Shop | Ace Closet Bz',
        component: ProductDetailsComponent,
      },
      {
        path: 'profile',
        title: 'Shop | Ace Closet Bz',
        component: ProfileComponent,
      },

      {
        path: 'wish-list',
        title: 'Wish List | Ace Closet Bz',
        component: WishListComponent,
      },
      { path: 'cart', title: 'Cart | Ace Closet Bz', component: CartComponent },
      { path: 'faq', title: 'FAQ | Ace Closet Bz', component: FaqComponent },
    ],
  },
  {
    path: 'checkout',
    title: 'Checkout | Ace Closet Bz',
    component: CheckoutComponent,
  },
  { path: '**', title: 'Page Not Found', component: ErrorPageComponent },
];
