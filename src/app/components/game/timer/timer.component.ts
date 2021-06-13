import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html'
})
export class TimerComponent implements OnInit {

  @ViewChild("stopwatch") stopwatch!:ElementRef;


  constructor() { }

  ngOnInit(): void {
    this.setStopwatch();
  }



  setStopwatch() {
    let parent = this.stopwatch.nativeElement;

  }
}




