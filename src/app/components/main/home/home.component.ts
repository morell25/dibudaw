import { Component, OnInit } from '@angular/core';
import { DataFrontService } from '../../../services/data-front.service';
import { SocketsService } from '../../../services/sockets.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {

  constructor(private socketService: SocketsService, private dataFrontService: DataFrontService) { }

  ngOnInit(): void {
  }

  joinRoom(roomName: string) {
    if (roomName.trim() == "") {
      this.dataFrontService.showToast({ type: "error", title: "Código no válido", subhead: "Introduce un código de partida válido.", options: "" })
    }
      else if (roomName.match(/^[0-9a-fA-F]{24}$/)) {
          this.socketService.joinRoom(roomName);
      } else {
          this.dataFrontService.showToast({ type: "error", title: "Código no válido", subhead: "Introduce un código de partida válido.", options: "" })
      }
  }

  createRoom() {
    this.socketService.createRoom();
  }
  



}
