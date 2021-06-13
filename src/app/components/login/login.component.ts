import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { DataBackService } from '../../services/data-back.service';
import { DataFrontService } from '../../services/data-front.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  registerForm: FormGroup;


  constructor(private formBuilder: FormBuilder, private backService: DataBackService, private authService: AuthService, private frontService: DataFrontService) {

    this.loginForm = this.formBuilder.group({
      loginEmail: ['', Validators.required],
      loginPass: ['', Validators.required]
    });

    this.registerForm = this.formBuilder.group({
      registerUsername: ['', Validators.required],
      registerEmail: ['', Validators.required],
      registerPass1: ['', Validators.required],
      registerPass2: ['', Validators.required]
    });

  }

  ngOnInit(): void {
  }



  logIn() {
    let values = this.loginForm.value;

    if (this.loginForm.valid) {

      this.authService.userLogin({ username: "", email: values.loginEmail, password: values.loginPass });
    }

  }

  signUp() {

    let values = this.registerForm.value;

    if (this.registerForm.valid) {
      if (values.registerPass1 != values.registerPass2) {
        // alert("las contraseñas no son iguales");
        this.frontService.showToast({
          type: 'error', subhead: 'Contraseñas distintas', title: 'Error', options: {
          }
        });
      }
      else if (!/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(values.registerEmail)) {
        this.frontService.showToast({
          type: 'error', subhead: "Introduce un email válido", title: "Error", options: {}
        });
      }
      else {
        this.authService.userRegister({ username: values.registerUsername, email: values.registerEmail, password: values.registerPass1 })
      }
    }
  }

    
    
  
}
