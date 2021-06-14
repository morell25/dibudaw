import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DataBackService } from '../../../services/data-back.service';
import { DataFrontService } from '../../../services/data-front.service';
import { SocketsService } from '../../../services/sockets.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit {
  timeLeft!: number;
  startingTime: number = 0;
  timeLength:number;



  roomData: any;
  user: any;
  currentWord: String = "madroñera"
  @ViewChild("count") count!:ElementRef;



  @ViewChild("clock") clock!:ElementRef;
  @ViewChild("baseTimerLabel") basetimerlabel!:ElementRef
  @ViewChild("baseTimerPathRemaining") basetimerpathremaining!:ElementRef




  constructor(private data: DataFrontService, public backService: DataBackService, private socketService: SocketsService) {


    this.roomData = this.backService.room;
    this.user = this.backService.user;
    this.backService.roomSubscriptions.push(this.backService.roomSubject.subscribe((content: any) => {
      this.roomData = content;
      
    }));

    this.backService.roomSubscriptions.push(this.backService.userSubject.subscribe((content: any) => {
      this.user = content;
    }));

    this.timeLength = this.formatTime.toString().length;


    


    
  }

  ngOnInit(): void {

    this.socketService.roundTimeSubject.subscribe((roundTime) => {
      if (roundTime.i) {
        this.data.showSpinner({ timeLeft: roundTime.rt, options: { fullScreen: true, type: 'square-jelly-box' } });
      } else {
        if (roundTime.tt != undefined) {
          this.timeLeft = roundTime.tt;
          if (roundTime.tt != +this.basetimerlabel.nativeElement.innerHTML - 1)
            this.startingTime = roundTime.tt;

          this.basetimerlabel.nativeElement.innerHTML = this.formatTime(roundTime.tt);
          this.setCircleDasharray(roundTime.tt);
          this.setRemainingPathColor(roundTime.tt);
        }
        else {
          //no haga nada
        }
      }
    });
  }

  
  endGame() {
    this.socketService.endGame();

  }






formatTime(time: number) {
  let formattedTime = time.toString();
  while(formattedTime.length<2){
    formattedTime= "0"+formattedTime;
  }
  return formattedTime;
}



  setRemainingPathColor(timeLeft: number) {
  
    if (timeLeft >= (this.startingTime * 2 / 3)) {
      console.log(this.startingTime * 2 / 3);
    this.basetimerpathremaining.nativeElement.style.color = 'rgb(65, 184, 131)';
  } else if (timeLeft >= (this.startingTime * 1 / 3)) {
    this.basetimerpathremaining.nativeElement.style.color = 'orange';
  }
  else {
    this.basetimerpathremaining.nativeElement.style.color = 'red';
  }
}

  calculateTimeFraction(timeLeft: number) {
    const rawTimeFraction = timeLeft / this.startingTime;
    return rawTimeFraction - (1 / this.startingTime) * (1 - rawTimeFraction);
}

setCircleDasharray(timeLeft: number) {
  const circleDasharray = `${(
    this.calculateTimeFraction(timeLeft) * 283
  ).toFixed(0)} 283`;
  this.basetimerpathremaining.nativeElement.setAttribute("stroke-dasharray", circleDasharray);
}

  toggleSound() {
    this.backService.sound = !this.backService.sound;
    this.data.setSounds(this.backService.sound);
}
  toggleMusic() {
    this.backService.music = !this.backService.music;
    this.data.setMusic(this.backService.music);
}




}
