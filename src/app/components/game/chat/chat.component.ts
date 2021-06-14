import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { SocketsService } from 'src/app/services/sockets.service';
import { Chat, Color, Message, UserID } from 'types';
import { DataBackService } from '../../../services/data-back.service';
import { DataFrontService } from '../../../services/data-front.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html'
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('scrollMe') myScrollContainer!: ElementRef;
  chat: Chat = [];
  color: Color;
  chatColors: Array<Array<Color>> = [
    [],
    ['red', 'red'],
    ['blue', 'blue'],
    ['purple', 'purple'],
    ['green', 'green'],
    ['brown', 'brown'],
    ['pink', 'pink']
      ];
    
    messageSubscription: Subscription;

    constructor(private socketService: SocketsService, public backService: DataBackService, public frontService: DataFrontService) {
    console.log(backService.team);
        this.messageSubscription = this.socketService.onMessage().subscribe((message: Message) => {
            this.chat.push(message);
          setTimeout(() => {
            this.scrollToBottom();
          }, 200);

    });
    this.color = this.memberColor(this.backService.user.id);
  }

  ngOnInit(): void {
      //this.scrollToBottom();
      
      
  }

    ngAfterViewInit()   {
        this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight - this.myScrollContainer.nativeElement.offsetHeight;
    }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTo({
        top: this.myScrollContainer.nativeElement.scrollHeight,
        behavior: 'smooth'
      });

      //this.myScrollContainer.nativeElement.scrollTop = '999999';
    } catch(err) { }                 
}


  memberColor(id: UserID): Color {
    for (const [i, team] of this.backService.room.teams.entries()) {
      for (const [j, member] of team.entries()) {
        if (member.id == id)
          return this.chatColors[i][j];
      }
    }
    return 'black';
  }

    sendMessage(content: string) {
        
        //this.myScrollContainer.nativeElement.lastChild.scrollIntoView();
    console.log(content);
        if (content != '') {
            if (content.length <= 100) {
                this.socketService.wannaChat({ sender: this.backService.user.name, color: this.color, content: content });
            }
            else {
                this.frontService.showToast({ type: 'warning', subhead: 'Has alcanzado el límite de 100 caracteres por mensaje.', title: 'Aviso!', options: {positionClass: 'toast-bottom-left'} })
            }
            //this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight - this.myScrollContainer.nativeElement.clientHeight + this.myScrollContainer.nativeElement.lastElementChild.getBoundingClientRect().height;
           
        }
  }
  

  ngOnDestroy() {
      this.messageSubscription?.unsubscribe();
  }

}
