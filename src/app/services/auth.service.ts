import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { DataBackService } from './data-back.service';
import { DataFrontService } from './data-front.service';
import { SocialService } from './social.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private httpClient: HttpClient, private router: Router, private backService: DataBackService, private injector: Injector, private frontService: DataFrontService) { }




  baseUrl: string = 'https://dibudaw.herokuapp.com'; //CAMBIAR ESTO!!!!!!!!!!!!!
  expressUrl: string = 'https://dibudaw.herokuapp.com';



  //AUTHENTICATION:
  userRegister(values: { username: string, email: string, password: string }) {
    this.httpClient.post(this.expressUrl + '/api/auth/register', values).pipe(first()).subscribe(
      (response: any) => {
        console.log(response);
        if (response.status == "registered") {
          console.log("registrado correctamente");
          this.userLogin(values);

          this.frontService.showToast({
            type: 'success', subhead: response.reason, title: 'Registrado', options: {
            }
          });

        } else {
          console.log("no se ha registrado");
          this.frontService.showToast({
            type: 'error', subhead: response.reason, title: 'Error', options: {
            }
          });
        }
      },
      (error: any) => {
        console.log(error);
      }
    );
  }
  userLogin(values: { username: string, email: string, password: string }) {
    this.httpClient.post(this.expressUrl + '/api/auth/login', values, { withCredentials: true }).pipe(first()).subscribe(
      (response: any) => {
        if (response.status == "valid") {
          this.router.navigate(['/main']);
        }
        else {
          this.frontService.showToast({
            type: 'error', subhead: response.reason, title: 'Error', options: {
            }
          });
          console.log("no válido");
        }
      },
      (error) => { console.log(error); }
    );
  }

  userLogout() {
    this.httpClient.get(this.expressUrl + '/api/auth/logout').pipe(first()).subscribe(
      (response: any) => {
            if (response.status == "logged out") {
                this.injector.get(SocialService).closeSocket();
          this.router.navigate(['/login']);
        } else {
          console.log(response);
        }
      },
      (error) => { console.log(error); }
    );
  }

  checkStatus(): Observable<boolean> {
    const status = new Observable<boolean>((observer) => {
      this.httpClient.get(this.expressUrl + '/api/auth/status', { withCredentials: true }).pipe(first()).subscribe(
        (response: any) => {
          console.log(response);
          if (response.status == "connected" && response.user) {

            this.backService.user = response.user;
              this.backService.userSubject.next(response.user);
              this.injector.get(SocialService).openSocket();

            
            this.frontService.showToast({
              type: 'info', subhead: 'Bienvenido a Dibudaw.', title: 'Hola ' + this.backService.user.name + '!', options: {
                timeOut: 5000,
              }
            });
            
            
            observer.next(true);
          }
          else {
            this.router.navigate(['/login']);
            observer.next(false);
          }
        },
        (error) => {
          console.log(error);
          this.router.navigate(['/login']);
          observer.next(false);
        }
      );
    });
    return status;
  }


  changeField(pFieldName: string, pValue: string, pCurrentPassword:null | string = null) {
    this.httpClient.post(this.expressUrl + '/api/social/changeField', { id: this.backService.user.id, fieldName: pFieldName, value: pValue, password: pCurrentPassword }).subscribe(
      (response: any) => {
        this.frontService.showToast({ type: (response.status) ? 'success' : 'warning', title: '', subhead: response.reason, options: '' })
      },
      (error) => { console.log("Error no se ha podido cambiar el valor por:" + error) }
    )
  }

  
}

