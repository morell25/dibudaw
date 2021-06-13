import { Component, OnDestroy, OnInit } from '@angular/core';
import { SocketsService } from 'src/app/services/sockets.service';
import { Chat, Color, Message, UserID } from 'types';
import { DataBackService } from '../../../services/data-back.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html'
})
export class ChatComponent implements OnInit, OnDestroy {

  chat: Chat = [];
  color: Color;
  chatColors: Array<Array<Color>> = [
    [],
    ['red', 'orange'],
    ['blue', 'lightblue'],
    ['purple', 'pink'],
    ['green', 'lightgreen'],
    ['black', 'grey'],
    ['brown', 'yellow']
  ];
  constructor(private socketService: SocketsService, public backService: DataBackService) {
    this.socketService.onMessage().subscribe((message: Message) => {
      this.chat.push(message);

    });
    this.color = this.memberColor(this.backService.user.id);
  }

  ngOnInit(): void {

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
    console.log(content);
    this.socketService.wannaChat({ sender: this.backService.user.name, color: this.color, content: content });
  }
  

  ngOnDestroy() {

  }

}
