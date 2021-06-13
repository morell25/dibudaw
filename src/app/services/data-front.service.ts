import { Injectable } from '@angular/core';
import { Spinner } from 'ngx-spinner';
import { BehaviorSubject, Subject } from 'rxjs';
import { SoundName } from '../../../types';

@Injectable({
  providedIn: 'root'
})
export class DataFrontService {

  color: any;
  colorChange: Subject<string> = new Subject<string>();
  brushSizeChange: Subject<number> = new Subject<number>();
  clearChange: Subject<boolean> = new Subject<boolean>();
  brushSize: any;
  clearcanvas: any;
  toastSubject: BehaviorSubject<{ type: string, subhead: string, title: string, options: any }> = new BehaviorSubject<any>({});
  spinnerSubject: Subject<{ options: Spinner, timeLeft: number }> = new Subject<{ options: Spinner, timeLeft: number }>();
  soundSubject: Subject<boolean> = new Subject<boolean>();
  musicSubject: Subject<boolean> = new Subject<boolean>();
  wannaPlaySoundSubject: Subject<SoundName> = new Subject<SoundName>();



  constructor() {
    this.color="black";
    this.brushSize=3;
   }
  
   setColorService(color: any){
     this.color = color;
     this.colorChange.next(this.color);
   }

   setSizeService(valor: any){
    this.brushSize = valor;
    this.brushSizeChange.next(this.brushSize);
  }

  setClearService() {
    this.clearChange.next(this.clearcanvas);
  }

  /**
   * config: {type: string, title: string, options: any}
   * type:
   *  info-warning-success-error
   *  title: string
   *  subhead: string
   */
  showToast(config: {type:string,subhead:string,title:string,options:any}){
    this.toastSubject.next(config);
  }

  showSpinner(data: {options: Spinner, timeLeft: number}){
    this.spinnerSubject.next(data);
  };

  setMusic(status:boolean) {
    this.musicSubject.next(status);
  }
  setSounds(status: boolean) {
    this.soundSubject.next(status);
  }
  playSound(name: SoundName) {
    this.wannaPlaySoundSubject.next(name);
  }


}
