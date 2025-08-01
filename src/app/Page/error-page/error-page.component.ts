import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { HeaderComponent } from '../../Component/header/header.component';
import { FooterComponent } from '../../Component/footer/footer.component';

@Component({
  selector: 'app-error-page',
  imports: [RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './error-page.component.html',
  styleUrl: './error-page.component.scss',
})
export class ErrorPageComponent {}
