import { Game, isGameProperty, isTeamNumber, Message, RoomName, Scoreboard, Stroke, TimeData } from 'types';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { observable, Observable, Subject, Subscription } from 'rxjs';
import { finalize, first, take } from 'rxjs/operators';
import { io, Socket } from 'socket.io-client';
import { Room } from '../models/room';
import { AuthService } from './auth.service';
import { DataBackService } from './data-back.service';
import { DataFrontService } from './data-front.service';


@Injectable({
  providedIn: 'root'
})
export class SocketsService {

  private socket!: Socket;
  

  roomName!: string | null;
  

  roomSubscriptions: Array<Subscription> = [];
  clearRoomSubscriptions() { this.roomSubscriptions.forEach((subscription) => subscription.unsubscribe()) }


  roundTimeSubject: Subject<TimeData> = new Subject<TimeData>();

  private socketUrl: string;

  constructor(private backService: DataBackService, private router: Router, private authService: AuthService, private dataFrontService: DataFrontService) {
    this.socketUrl = 'https://dibudaw-rooms.herokuapp.com';
  }

  //WRAPPERS
  async createRoom() {
    await this.openSocket();
    this.wannaCreate();
    
    this.router.navigate(['/main/lobby']);
  }
  async joinRoom(roomName:string) {
    await this.openSocket();
    this.wannaJoin(roomName);
    this.router.navigate(['/main/lobby']);
    }

    async joinFriendRoom(friendId: string) {
      console.log("JoinFriendRoom: aqui llegamos")
     await this.openSocket();
     this.wannaJoinFriend(friendId);
     this.router.navigate(['/main/lobby']);
  }

  async leaveRoom() {
    if (this.socket !== undefined)
    this.wannaLeave();
  }

  async startGame() {
    this.wannaStart();
    this.socket.off('roomStatus');
  }

  async joinGame() {
  }

  async endGame() {
    this.wannaEnd();
    this.socket.off('gameStatus');
  }



  //CONNECTION
  async openSocket() {
    if (this.socket && this.socket.connected)
      this.closeSocket();
    this.socket = await io(this.socketUrl);
    this.roomSubscriptions.push(this.onRoomStatus().subscribe((content: any) => {
      console.log(content);
    }));
    this.roomSubscriptions.push(this.onRoomData().subscribe((content: any) => {
      this.backService.roomSubject.next(content);
      this.backService.room = content;
    }));
    this.roomSubscriptions.push(this.onGameData().subscribe((content: any) => {
      console.log(content);
      if (content.room != undefined) {
        this.backService.room = content.room;
        this.backService.roomSubject.next(content.room);
      }
      this.updateGame(content.game);
    }));

    this.roomSubscriptions.push(this.onGameEnded().subscribe((content: any) => {
      if (this.router.url == '/main/game') {
        this.updateGame(content.game);
        this.backService.room = content.room;
        this.backService.roomSubject.next(content.room);
        this.router.navigate(['/main/lobby']);
      }
    }));

    this.socket.on('gameStarted', (content) => {
      if (content.status == true) {
        this.backService.room = content.data.room;
        this.backService.roomSubject.next(content.data.room);
        this.backService.game = content.data.game;
        this.backService.gameSubject.next(content.data.game);
        this.setTeam();
        this.setScoreboard();
        this.router.navigate(['/main/game']);


      }
      else {
        if (this.backService.user.id == this.backService.room.owner)
          this.dataFrontService.showToast({ type: "error", title: "Error", subhead: content.reason, options: {} });
      }
    });

    this.onRoundTime();
    this.onWordUpdate();

    this.setCredentials();
  }

  closeSocket() {
    if (this.socket && this.socket.connected) {
      this.socket.disconnect();

      this.clearRoomSubscriptions();
      
    }

  }


 /*
  *------------------------------------------------------------------------------------------------------------------------------------
  *---------------------------------------------------   HANDLERS:   ------------------------------------------------------------------
  *------------------------------------------------------------------------------------------------------------------------------------
  */


  //ROOM HANDLERS:
  onRoomCreated() {
    this.socket?.off('roomStatus');
    return new Observable<boolean>(observer => {
      if (this.socket)
        this.socket.on('roomStatus', (content: { status: boolean, reason?: string, roomName?: string }) => {
          if(content.reason != undefined){
          this.dataFrontService.showToast({ type: (content.status) ? 'info' : 'warning', title: (content.status) ? 'Información!' : 'Aviso!', subhead: content.reason, options: '' });
        }
          if (content.roomName != undefined)
            this.roomName = content.roomName;
          if (content.status == true) 
            observer.next(true);
          else {
            this.router.navigate(['/main/home']);
            this.closeSocket();
            observer.next(false);
          }
        });
      else {
        this.router.navigate(['/main/home']);
        this.closeSocket();
        observer.next(false);
      }
    });
  }
  onRoomStatus(): Observable<{status: boolean, reason?: string, roomName?: string}> {
    return new Observable <{status: boolean, reason?: string, roomName?: string}>(observer => {
      this.socket.on('roomStatus', content => {
        if (content.roomName != undefined)
          this.roomName = content.roomName;
        console.log(content);
        observer.next(content);
      });
    });
  }
  onRoomData() {
    this.socket.off('roomData');
    return new Observable(observer => {
      this.socket.on('roomData', content => {
        observer.next(content);
      });
    });
  }

  //GAME HANDLERS:

  onGameData() {
    this.socket.off('gameData');
    return new Observable(observer => {
      this.socket.on('gameData', (game, room?: Room) => {
        observer.next({room:room, game:game});
      });
    })
  }

  onGameStatus() {
    return new Observable<boolean>(observer => {
      if (this.socket)
        this.socket.on('gameStatus', content => {
          if (content.status == true) {
            this.backService.room = content.room;
            this.backService.roomSubject.next(content.room);
            this.backService.game = content.game;
            this.backService.gameSubject.next(content.game);
            observer.next(true);
          }
          else {
            this.router.navigate(['/main/lobby']);
            observer.next(false);
          }
        });
      else {
        this.router.navigate(['/main/lobby']);
        observer.next(false);
      }
    });
  }

  onStroke() {
    this.socket.off('stroke');
    return new Observable<Stroke>(observer => {
      this.socket.on('stroke', (stroke:Stroke) => {
        observer.next(stroke);
      });
    })
  }

  onCanvasClear() {
    this.socket.off('canvasClear');
    this.socket.on('canvasClear', () => {
      this.dataFrontService.clearChange.next(true);
    });
  }

  onMessage() {
    this.socket.off('message');
    return new Observable<Message>(observer => {
      this.socket.on('message', (message: Message) => {
        observer.next(message);
      })
    });
  }

  onGameEnded() {
    this.socket.off('gameEnded');
    return new Observable((observer) => {
      this.socket.on('gameEnded', (room, game) => {
        
          observer.next({ room: room, game: game });
      });
    });
  }

  //NUEVO FORMATO:
  onRoundTime() {
    this.socket.off('roundTime');
    this.socket.on('roundTime', (roundTime: TimeData) => { this.roundTimeSubject.next(roundTime); });
  }

  onWordUpdate() {
    this.socket.off('wordUpdate');
    this.socket.on('wordUpdate', (wordUpdate: string) => { Object.assign(this.backService.game.dynamicData, {currentWord: wordUpdate}) });
  }

  //updaters
  updateGame(newData: { [key: string]: {[key:string]: unknown}}) {
    if (this.backService.game != undefined) {
      for (let prop in this.backService.game) {
        if (isGameProperty(prop))
          Object.assign(this.backService.game[prop], newData[prop]);

      }
    }
    if (newData.wordHasBeenAccepted != undefined) {
      this.dataFrontService.playSound('correctWord');
      this.dataFrontService.setClearService();
      this.dataFrontService.showToast({ title: "¡Cambio!", subhead: "La palabra ha sido acertada.", type: "info", options: {positionClass: 'toast-bottom-left',  timeOut: 2000} });
    }

    this.backService.gameSubject.next(this.backService.game);
    this.setTeam();
    if (newData.dynamicData.score != undefined)
    this.setScoreboard();
  }
  setTeam() {
    let teamNumber = this.backService.room.teams.findIndex((team) => team.some((member) => member.id == this.backService.user.id));
    if (isTeamNumber(teamNumber))
      this.backService.team = teamNumber;

  }
  setScoreboard() {
    let scoreboard: Scoreboard = [];
    this.backService.game.dynamicData.score.forEach((value, index) => {
      let teamNumber = index + 1;
      if (isTeamNumber(teamNumber))
      scoreboard.push({ number: teamNumber, members: this.backService.room.teams[index+1], score: value });
    });
    this.backService.scoreboard = scoreboard.sort((a, b) => b.score - a.score);
    console.log(this.backService.game.dynamicData.score);
    console.log(scoreboard);
  }


/*
 *------------------------------------------------------------------------------------------------------------------------------------
 *---------------------------------------------------   EMITTERS:   ------------------------------------------------------------------
 *------------------------------------------------------------------------------------------------------------------------------------
 */

  setCredentials() {
    this.socket.emit('setCredentials', this.backService.user);
  }

  //ROOM EMITTERS:
  wannaCreate() {
    this.roomName = this.backService.user.id;
    this.socket.emit('wannaCreate', this.backService.user.id, this.backService.user);
  }
  wannaJoin(roomName: string) {
    this.roomName = roomName;
    this.socket.emit('wannaJoin', roomName, this.backService.user);
  }

  wannaJoinFriend(friendId: string) {
      this.socket.emit('wannaJoinFriend', this.backService.user, friendId)
  }


  teamSwitched(userId: string, previousTeam: number, currentTeam: number) {
    console.log(this.roomName);
    this.socket.emit('teamSwitch', this.roomName, [{ user: userId, previousTeam: previousTeam, currentTeam: currentTeam }]);
  }


  
  wannaLeave() {
    this.socket.emit('wannaLeave', this.roomName);
    this.roomName = null;
    this.closeSocket();
    this.router.navigate(['/main/home']);
  }

  //GAME EMITTERS
  wannaStart() {
    this.socket.emit('wannaStart', this.roomName);
  }
  wannaEnd() {
    this.socket.emit('wannaEnd', this.roomName)
  }

  wannaStroke(stroke: Stroke) {
    this.socket.emit('wannaStroke', stroke);
  }
  wannaClear() {
    this.socket.emit('wannaClear');
  }
  wannaChat(message: Message) {
    this.socket.emit('wannaChat', this.roomName, message);
  }


}
