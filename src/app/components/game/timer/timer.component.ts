import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SocketsService } from '../../../services/sockets.service';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html'
})
export class TimerComponent implements OnInit {

  @ViewChild("roundTicker") tickerRef!: ElementRef;


  timeLeft: number = 0;
  startingTime: number = 0;
  diff: string = "100%";
  constructor(private socketService: SocketsService) { }

  ngOnInit(): void {
    this.socketService.roundTimeSubject.subscribe((roundTime) => {
      if (!roundTime.i) {
        
        if (roundTime.rt != this.timeLeft - 1)
          this.startingTime = roundTime.rt;

        this.timeLeft = roundTime.rt;
        this.diff = (this.timeLeft / this.startingTime * 100).toFixed(0) + "%";
        this.tickerRef.nativeElement.style.height = this.diff;

      }
      
    });
  }

}





