import { Component, ElementRef, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { DataBackService } from 'src/app/services/data-back.service';
import { SocketsService } from 'src/app/services/sockets.service';
import { Router } from '@angular/router';
import { User } from 'types';
import { Subscription } from 'rxjs';
import { ClipboardService } from 'ngx-clipboard';
import { DataFrontService } from '../../../services/data-front.service';


@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html'
})
export class LobbyComponent implements OnInit, OnDestroy {
  user: User;
  isOwner: boolean = false;
  roomData: any = false;

  roomDataSubscription!: Subscription;


  teams: any = [
    [
      { name: 'Pherb', email: 'phineasyferd@gmail.com', id: '69A' },
      { name: 'Pinchos', email: 'banderasbarden@gmail.com', id: '72B' }
    ],
    [
      { name: 'acho' + '(Tú)', email: 'userEmail@gmail.com', id: 'userId' },
      { name: 'Banderas', email: 'banderasbarden@gmail.com', id: '72B' }
    ],
    [
      { name: 'Ferd', email: 'ferdyphineas@gmail.com', id: '63H' },
      { name: 'Barden', email: 'bardenbanderas@gmail.com', id: '84X' }
    ]
    ,
    [
      { name: 'uaseou', email: 'aseua@gmail.com', id: '65H' },
      { name: 'Acho', email: 'eieieie@gmail.com', id: '74X' }
    ]
    ,
    [
      { name: 'uaseou', email: 'aseua@gmail.com', id: '83L' },
      { name: 'Acho', email: 'eieieie@gmail.com', id: '18G' }
    ]
    ,
    [
      { name: 'Pique', email: 'pique@gmail.com', id: '37J' },
      { name: 'Shakira', email: 'shakira@gmail.com', id: '92A' }
    ]
    ,
    [
      { name: 'Messi', email: 'lionelandresmessi@gmail.com', id: '10M' },
      { name: 'LuisitoComunica', email: 'luisitoelpillo@gmail.com', id: '83H' }
    ]
  ];
  

  constructor(private backService: DataBackService, private socketService: SocketsService, private router: Router, private clipBoard: ClipboardService, private frontService: DataFrontService) {
    this.user = this.backService.user;
    this.roomDataSubscription = this.backService.roomSubject.subscribe((room: any) => {
      this.roomData = room;
      this.teams = room.teams;
      this.isOwner = (this.user.id == room.owner);

    });
  }

  ngOnInit(): void {}

 

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      console.log("if");
    } else {
      console.log("else");
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);

/*      //Recuperamos los datos del miembro que acaba de ser movido a otro equipo;

      //Actualizamos el campo equipo (.team) de los datos del miembro que acaba de ser movido
      //en la variable que guarda los equipos en este componente(this.teams)
      this.teams[+event.container.id].find((member: any) => member.id = movedMember.id).team = +event.container.id;

      //Actualizamos el campo equipo (.team) de los datos del miembro que acaba de ser movido
      //en la variable que guarda los equipos en el servicio 'DataBackService' (this.backService.room.members)
      const memberIndex = this.backService.room.members.findIndex((member: any) => member.id == movedMember.id);
      this.backService.room.members[memberIndex].team = +event.container.id;

      //Mandamos los nuevos datos del estado de la sala al servidor
      this.socketService.setRoomStatus();
      */
      let movedMember: any = event.container.data[event.currentIndex];
      this.socketService.teamSwitched(movedMember.id, +event.previousContainer.id, +event.container.id);
    }



  }

  pruebas() {
    this.router.navigate(['/main/game']);
  }

  startGame() {
    this.socketService.startGame();
  }


  startTimer() {

  }

  
  leaveRoom() {
    this.socketService.leaveRoom();
  }
  ngOnDestroy() {
    console.log(this.router.routerState.snapshot.url);
    if (this.router.routerState.snapshot.url != '/main/game') {
      this.socketService.leaveRoom();
      //this.backService.clearRoomSubscriptions();
      this.roomDataSubscription.unsubscribe();
    } 
  }


  copyRoomName() {
    this.clipBoard.copy(this.socketService.roomName!);
    this.frontService.showToast({ type: "success", title: "Copiado", subhead: "Codigo de la sala copiado al portapapeles", options: {} });
  }
  


}
