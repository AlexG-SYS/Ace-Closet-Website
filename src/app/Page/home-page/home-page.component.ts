import { Component } from '@angular/core';
import { HeaderComponent } from '../../Component/header/header.component';
import { FooterComponent } from '../../Component/footer/footer.component';
import { HomeComponent } from '../../Component/home/home.component';
import { RouterOutlet } from '@angular/router';


@Component({
    selector: 'app-home-page',
    imports: [HeaderComponent, HomeComponent, RouterOutlet, FooterComponent],
    templateUrl: './home-page.component.html',
    styleUrl: './home-page.component.scss'
})
export class HomePageComponent {

}
