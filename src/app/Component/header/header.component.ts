import { Component, OnInit } from '@angular/core';
import {
  RouterOutlet,
  RouterLink,
  Router,
  RouterModule,
} from '@angular/router';
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
import { UsersService } from '../../Service/users.service';
import { Timestamp } from '@angular/fire/firestore';
import { GlobalService } from '../../Service/global.service';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    RouterModule,
    MatInputModule,
    MatIconModule,
    MatBadgeModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  globalUser: any;
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
      Validators.pattern(/^\d{3}-\d{4}$/), // Pattern for phone number
    ]),
  });

  sideNavHidden = false; // Initially hidden

  constructor(
    private router: Router,
    private productService: ProductsService,
    private userServices: UsersService,
    private globalService: GlobalService
  ) {}

  async ngOnInit() {
    await this.userServices.initializeUser();
    this.checkForUser(); // ✅ runs only after user is initialized
  }

  checkForUser() {
    let user = this.globalService.getUser();

    if (user) {
      this.globalUser = user;
      console.log('User found in Global Service:', this.globalUser.name);
    } else {
      this.globalUser = null;
      console.log('No user found in Global Service.');
    }
  }

  toggleSideNav() {
    this.sideNavHidden = !this.sideNavHidden;
  }

  isLoggedIn = false;
  submitLogin() {
    this.isProcessing = true;

    this.signInFormError = '';
    var email = this.signInForm.get('signInEmail')?.value || '';
    var password = this.signInForm.get('signInPassword')?.value || '';

    if (this.signInForm.valid) {
      this.userServices
        .signInUser(email, password)
        .then((cred) => {
          this.globalService.setUser(cred);
          this.checkForUser();

          this.signInFormError = '';
          this.isProcessing = false;
          this.isLoggedIn = true;

          this.cancelLogin();
        })
        .catch((err) => {
          this.signInFormError = 'Invalid Credentials. Please try again.';
          console.error('Sign-in error:', err.message);
          this.isProcessing = false;
        });
    } else {
      this.isProcessing = false;

      const emailErrors = this.signInForm.get('signInEmail')?.errors;
      const passwordErrors = this.signInForm.get('signInPassword')?.errors;

      // Email field error handling
      if (emailErrors) {
        if (emailErrors['required']) {
          this.signInFormError = 'Email is required.';
        } else if (emailErrors['email']) {
          this.signInFormError = 'Please enter a valid email address.';
        }
      }

      // Password field error handling
      else if (passwordErrors) {
        if (passwordErrors['required']) {
          this.signInFormError = 'Password is required.';
        }
      }
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

  isProcessing = false;
  isRegistered = false;
  submitRegister() {
    this.registerFormError = '';
    if (this.registerForm.valid) {
      this.isProcessing = true;

      var email = this.registerForm.get('registerEmail')?.value;
      var password = this.registerForm.get('registerPassword')?.value;

      this.userServices
        .registerUser(email!, password!, {
          name: this.registerForm.get('registerFullName')?.value,
          phoneNumber: this.registerForm.get('registerPhoneNumber')?.value,
          role: 'customer', // Default role
          status: 'active', // Default status
          email: this.registerForm.get('registerEmail')?.value,
          accountBalance: 0, // Default account balance
          createdAt: Timestamp.now(), // Current timestamp
        })
        .then(() => {
          this.registerForm.reset();
          console.log('Registration successful! Login in to continue.');
          this.isProcessing = false;
          this.isRegistered = true;
        })
        .catch((error) => {
          this.isProcessing = false;
          this.isRegistered = false;
          console.error('Registration error:', error.message);
          if (error.code === 'auth/email-already-in-use') {
            this.registerFormError =
              'Email already in use. Please log in or reset your password.';
          } else {
            this.registerFormError =
              'Registration Failed. Please try again later.';
          }
        });
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
          this.registerFormError = 'Invalid format. Use xxx-xxxx.';
        }
      }
    }
  }

  cancelRegister() {
    this.registerForm.reset();
    this.registerFormError = '';
    this.isProcessing = false;
    this.isRegistered = false;
  }

  cancelLogin() {
    this.signInForm.reset();
    this.signInFormError = '';
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

    this.fetchSearchSuggestions(searchTerm!, 5);
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
      window.open(url, '_self');
    } else {
      // Desktop navigation
      window.open(url, '_self');
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
