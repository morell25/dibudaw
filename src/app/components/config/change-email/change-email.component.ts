import { Component, OnInit } from '@angular/core';
import { User } from 'types';
import { AuthService } from 'src/app/services/auth.service';
import { DataBackService } from 'src/app/services/data-back.service';

@Component({
  selector: 'app-change-email',
  templateUrl: './change-email.component.html'
})
export class ChangeEmailComponent implements OnInit {
  user: User;
  constructor(private backService: DataBackService, private authService: AuthService) {
    this.user = this.backService.user
  }

  ngOnInit(): void {
  }

  changeEmail(pNewEmail: string) {
    this.authService.changeField('email', pNewEmail)
  }

}
