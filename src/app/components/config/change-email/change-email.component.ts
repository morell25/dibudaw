import { Component, OnInit } from '@angular/core';
import { User } from 'types';
import { AuthService } from 'src/app/services/auth.service';
import { DataBackService } from 'src/app/services/data-back.service';
import { DataFrontService } from '../../../services/data-front.service';

@Component({
  selector: 'app-change-email',
  templateUrl: './change-email.component.html'
})
export class ChangeEmailComponent implements OnInit {
  user: User;
  constructor(private backService: DataBackService, private authService: AuthService,private frontService: DataFrontService) {
    this.user = this.backService.user
  }

  ngOnInit(): void {
  }

    changeEmail(pNewEmail: string) {
        if (/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(pNewEmail) ) {
          this.authService.changeField('email', pNewEmail);
        } else {
          this.frontService.showToast({ type: 'error', title: '', subhead: 'El nuevo email no es valido ', options: {} });
        }
  }

}
