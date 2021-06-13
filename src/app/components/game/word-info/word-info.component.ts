import { Component, ElementRef, OnInit } from '@angular/core';
import { DataBackService } from 'src/app/services/data-back.service';
import { DataFrontService } from 'src/app/services/data-front.service';

@Component({
  selector: 'app-word-info',
  templateUrl: './word-info.component.html'
})
export class WordInfoComponent implements OnInit {

  currentWord: string = "madroñera"
  roomData: any;
  user: any;
  
  
  constructor(private data: DataFrontService, public backService: DataBackService, private componentElement: ElementRef) {

    this.roomData = this.backService.room;
    this.user = this.backService.user;
    this.backService.roomSubscriptions.push(this.backService.roomSubject.subscribe((content: any) => {
      this.roomData = content;
      
    }));

    this.backService.roomSubscriptions.push(this.backService.userSubject.subscribe((content: any) => {
      this.user = content;
    }));

    

  }

  ngOnInit(): void {
  }

}
