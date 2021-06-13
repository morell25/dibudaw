import { Component, OnInit } from '@angular/core';
import { SocketsService } from '../../../services/sockets.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {

  constructor(private socketService: SocketsService) { }

  ngOnInit(): void {
  }

  joinRoom(roomName: string) {
    if (roomName.length == 24) {
      this.socketService.joinRoom(roomName);
    }
  }

  createRoom() {
    this.socketService.createRoom();
  }
  



}
