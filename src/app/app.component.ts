import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, Inject, PLATFORM_ID } from '@angular/core';
import { NgxSpinnerService, Spinner } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { DataFrontService } from './services/data-front.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements AfterViewInit {
  title = 'dibudaw';
  isBrowser: boolean = false;
  ready: boolean = false;
  timeLeft: number = 0;


  correctWordSound!: HTMLAudioElement;
  backgroundMusic!: HTMLAudioElement;
  notificationSound!: HTMLAudioElement;
  


  // poner esto en html para desactivar click (contextmenu)="onRightClick($event)"

  constructor(@Inject(PLATFORM_ID) platformId: Object, private data: DataFrontService, private toastr: ToastrService, private spinner: NgxSpinnerService) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser)
      setTimeout(() => {
        console.log("acho");
      this.ready=true;
    }, 500)

    this.data.toastSubject.subscribe((config) => {
      if (config.type == 'success' || config.type == 'error' || config.type == 'warning' || config.type == 'info') {
        this.toastr[config.type](config.subhead, config.title, config.options)
      }
    });
    this.data.spinnerSubject.subscribe((data: { options: Spinner, timeLeft: number }) => {
      this.timeLeft = data.timeLeft;
      if (this.timeLeft != 0 && data.timeLeft > 0) {
        this.spinner.show(undefined, data.options);
      }
      else if (data.timeLeft == 0) {
        setTimeout(() => { this.spinner.hide(); }, 500);
      }
      this.spinner.show(undefined, data.options);
    });




}



onRightClick(event:any){
  return false;
}


  ngAfterViewInit() {
    this.correctWordSound = new Audio('assets/sounds/acierto.mp3');
    this.backgroundMusic = new Audio('assets/sounds/fondo_juego.mp3');
    this.notificationSound = new Audio('assets/sounds/notificacion.mp3');
    this.backgroundMusic.volume = 0.2;
    this.notificationSound.volume = 0.2;
    this.correctWordSound.volume = 0.2;

    this.backgroundMusic.play();
    this.backgroundMusic.loop = true;
    
    this.data.wannaPlaySoundSubject.subscribe((name) => {
      switch (name) {
        case "correctWord":
          this.correctWordSound.play();
          break;
        case "notification":
          this.notificationSound.play();
          break;
      }
    });

    this.data.musicSubject.subscribe((status: boolean) => {
      if (status) {
        this.backgroundMusic.volume = 0.2;
      }
      else {
        this.backgroundMusic.volume = 0;
      }
    });

    this.data.soundSubject.subscribe((status: boolean) => {
      if (status) {
        this.correctWordSound.volume = 0.2;
        this.notificationSound.volume = 0.2;
      }
      else {
        this.correctWordSound.volume = 0;
        this.notificationSound.volume = 0;
      }
    });




  }
}
