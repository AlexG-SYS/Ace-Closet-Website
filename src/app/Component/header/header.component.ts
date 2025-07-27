import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { debounceTime, Subject } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { FormsModule } from '@angular/forms';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { ProductsService } from '../../Service/products.service';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    MatInputModule,
    MatIconModule,
    MatBadgeModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  searchText = new FormControl('');

  searchSuggestions: any[] = [];

  signInFormError = '';
  signInForm = new FormGroup({
    signInEmail: new FormControl('', [Validators.required, Validators.email]),
    signInPassword: new FormControl('', Validators.required),
  });

  resetFormError = '';
  resetForm = new FormGroup({
    resetEmail: new FormControl('', [Validators.required, Validators.email]),
  });

  registerFormError = '';
  registerForm = new FormGroup({
    registerFullName: new FormControl('', [
      Validators.required,
      Validators.maxLength(30),
    ]),
    registerEmail: new FormControl('', [Validators.required, Validators.email]),
    registerPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(8), // Minimum length for complexity
      Validators.pattern(
        '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$'
      ), // Complexity: at least one uppercase, lowercase, digit, and special character
    ]),
    registerVerifyPassword: new FormControl('', [
      Validators.required,
      this.passwordMatchValidator.bind(this), // Custom validator to match passwords
    ]),
    registerPhoneNumber: new FormControl('', [
      Validators.required,
      Validators.pattern('^[0-9]{7}$'), // Phone number should be exactly 7 digits
    ]),
  });

  sideNavHidden = false; // Initially hidden

  constructor(
    private router: Router,
    private productService: ProductsService
  ) {}

  toggleSideNav() {
    this.sideNavHidden = !this.sideNavHidden;
  }

  submitLogin() {
    this.signInFormError = '';
    if (this.signInForm.valid) {
      console.warn(this.signInForm.value);
    } else {
      this.signInFormError = 'Invalid Input';
    }
  }

  submitReset() {
    this.resetFormError = '';
    if (this.resetForm.valid) {
      console.warn(this.resetForm.value);
      this.resetFormError =
        'If the email you entered is valid, you will receive a link to reset your password via email.';
    } else {
      this.resetFormError = 'Invalid Input';
    }
  }

  submitRegister() {
    this.registerFormError = '';
    if (this.registerForm.valid) {
      console.warn(this.registerForm.value);
    } else {
      const fullNameErrors = this.registerForm.get('registerFullName')?.errors;
      const emailErrors = this.registerForm.get('registerEmail')?.errors;
      const passwordErrors = this.registerForm.get('registerPassword')?.errors;
      const verifyPasswordErrors = this.registerForm.get(
        'registerVerifyPassword'
      )?.errors;
      const phoneNumberErrors = this.registerForm.get(
        'registerPhoneNumber'
      )?.errors;

      // Full Name field error handling
      if (fullNameErrors) {
        if (fullNameErrors['required']) {
          this.registerFormError = 'Full name is required.';
        } else if (fullNameErrors['maxlength']) {
          this.registerFormError = `Full name cannot exceed ${fullNameErrors['maxlength'].requiredLength} characters.`;
        }
      }

      // Email field error handling
      else if (emailErrors) {
        if (emailErrors['required']) {
          this.registerFormError = 'Email is required.';
        } else if (emailErrors['email']) {
          this.registerFormError = 'Please enter a valid email address.';
        }
      }

      // Password field error handling
      else if (passwordErrors) {
        if (passwordErrors['required']) {
          this.registerFormError = 'Password is required.';
        } else if (passwordErrors['minlength']) {
          this.registerFormError = `Password must be at least ${passwordErrors['minlength'].requiredLength} characters long.`;
        } else if (passwordErrors['pattern']) {
          this.registerFormError =
            'Password must include uppercase, lowercase, numbers, and special characters.';
        }
      }

      // Verify Password field error handling (checking if passwords match)
      else if (verifyPasswordErrors) {
        if (verifyPasswordErrors['required']) {
          this.registerFormError = 'Verification password is required.';
        } else if (verifyPasswordErrors['passwordMismatch']) {
          this.registerFormError = 'Passwords do not match.';
        }
      }

      // Phone Number field error handling
      else if (phoneNumberErrors) {
        if (phoneNumberErrors['required']) {
          this.registerFormError = 'Phone number is required.';
        } else if (phoneNumberErrors['pattern']) {
          this.registerFormError = 'Phone number must be exactly 7 digits.';
        }
      }
    }
  }

  passwordMatchValidator(
    control: FormControl
  ): { [s: string]: boolean } | null {
    if (
      this.registerForm &&
      control.value !== this.registerForm.get('registerPassword')?.value
    ) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSearchInput() {
    let searchTerm = this.searchText.value?.toLowerCase();

    this.fetchSearchSuggestions(searchTerm!, 3);
  }

  onSearchSubmit() {
    // Get the value or fallback to empty string
    let searchTerm = this.searchText.value || '';

    // If it's just whitespace, exit
    if (!searchTerm.trim()) return;

    // Clean the input
    const queryText = searchTerm.trim().toLowerCase();

    // Optional: Clear suggestion list
    this.searchSuggestions = [];

    // Navigate with query parameter
    this.router.navigate(['/search'], {
      queryParams: { q: queryText },
    });

    this.searchText.setValue('');
  }

  goToProduct(product: any) {
    console.log('View Product: ' + product.id);
    let basePath = '/category/' + product.category;
    const url = `${basePath}/product/${product.id}`;

    const isMobile = /Mobi|Android/i.test(window.navigator.userAgent);

    if (isMobile) {
      // Mobile navigation
      this.router.navigate([basePath, 'product', product.id]);
    } else {
      // Desktop navigation
      window.open(url, '_blank');
    }
  }

  async fetchSearchSuggestions(text: string, limit: number) {
    if (!text) {
      this.searchSuggestions = [];
      return;
    }

    this.searchSuggestions = await this.productService.searchProductsByText(
      text,
      limit
    );
  }
}
