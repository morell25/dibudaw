import { Component, OnInit } from '@angular/core';
import { User } from 'types';
import { DataBackService } from 'src/app/services/data-back.service';
import { AuthService } from '../../../services/auth.service';
import { DataFrontService } from 'src/app/services/data-front.service';


@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html'
})
export class ChangePasswordComponent implements OnInit {
  user: User;
  constructor(private backService: DataBackService, private authService: AuthService, private DataFrontService: DataFrontService) {
    this.user = this.backService.user
  }

  ngOnInit(): void {
  }

  changePassword(pCurrentPassword:any, pNewPassword1: string, pNewPassword2: string) {
    if (pNewPassword1 == pNewPassword2) {
        this.authService.changeField('password', pNewPassword1, pCurrentPassword);
    }
    else {
      this.DataFrontService.showToast({ type: 'error', title: '', subhead: 'Las contraseñas no coinciden', options: '' });
    }
  }

}
