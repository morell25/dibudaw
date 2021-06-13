import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { NgxSpinnerService, Spinner } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { DataFrontService } from './services/data-front.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'dibudaw';
  isBrowser: boolean = false;
  ready: boolean = false;
  timeLeft: number = 0;

  constructor(@Inject(PLATFORM_ID) platformId: Object, private data: DataFrontService, private toastr: ToastrService, private spinner: NgxSpinnerService) {
    this.isBrowser = isPlatformBrowser(platformId);
    if(this.isBrowser)
    setInterval(()=>{
      this.ready=true;
    }, 100)

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

}
