import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
    selector: 'app-quick-view-product',
    imports: [MatIconModule, MatDividerModule, MatDialogModule],
    templateUrl: './quick-view-product.component.html',
    styleUrl: './quick-view-product.component.scss'
})
export class QuickViewProductComponent {

}
