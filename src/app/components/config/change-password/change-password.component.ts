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
  constructor(private backService: DataBackService, private authService: AuthService, private frontService: DataFrontService) {
    this.user = this.backService.user
  }

  ngOnInit(): void {
  }

  changePassword(pCurrentPassword: string, pNewPassword1: string, pNewPassword2: string) {
    if (pCurrentPassword.length < 254 && pNewPassword1.length < 254 && pNewPassword2.length < 254) {
      if (pNewPassword1 == pNewPassword2) {
        this.authService.changeField('password', pNewPassword1, pCurrentPassword);
      }
      else {
        this.frontService.showToast({ type: 'error', title: '', subhead: 'Las contraseñas no coinciden', options: {} });
      }
    }
    else {
      this.frontService.showToast({ type: 'error', title: '', subhead: 'Las contraseñas introducidas superan los 254 caracteres', options: {} });
    }
  }


}
