import { Component } from '@angular/core';
import { GlobalService } from '../../Service/global.service';
import { UsersService } from '../../Service/users.service';
import { Timestamp } from '@angular/fire/firestore';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-profile',
  imports: [MatIconModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  globalUser: any;

  constructor(
    private globalService: GlobalService,
    private userServices: UsersService
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

  convertRawTimestamp(raw: { seconds: number; nanoseconds?: number }): string {
    let date = new Date(raw.seconds * 1000);
    return date.toDateString();
  }
}
