import { Injectable } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { User, UserEmail, UserID } from '../../../types';
import { AuthService } from './auth.service';
import { DataBackService } from './data-back.service';
import { DataFrontService } from './data-front.service';
import { SocketsService } from './sockets.service';

@Injectable({
  providedIn: 'root'
})
export class SocialService {
  private socket!: Socket;
  private socketUrl: string;
  private statusSubscription!: Subscription;
  constructor(private backService: DataBackService, private socketsService: SocketsService, private authService: AuthService, private dataFrontService: DataFrontService,) {
    this.socketUrl = 'https://dibudaw-social.herokuapp.com';
  }


  //CONNECTION
  async openSocket() {
    if (this.socket && this.socket.connected)
      this.closeSocket();
    this.socket = io(this.socketUrl);
    this.setCredentials();
  }

  closeSocket() {
    if (this.socket && this.socket.connected) {
      this.socket.disconnect();
    }
  }


  setCredentials() {
    this.socket.emit('setCredentials', this.backService.user);
  }

  //---INICIO DE PETICIONES DE AMISTAD---
  /**
  * funcion para recuperar las peticiones de amistad entrantes sin necesidad de recargar la pagina
  */
  onFriendRequestReceived() {
    return new Observable((observer) => {
      this.socket.on('friendRequestReceived', (content: { name: string, id: string }) => {
        observer.next(content);
      });
    });
  }

  /**
  * funcion para recuperar las peticiones de amistad de la DDBB al recargar la pagina
  */
  onFriendRequests() {
    return new Observable((observer) => {
      this.socket.on('friendRequests', (content) => {
        observer.next(content);
      });
    });
  }

  /**
  * funcion para llamar a la funcion friend request para que me de los amigos desde la base de datos
  */
  wannaGetFriendRequest() {
    this.socket.emit('wannaGetFriendRequest', this.backService.user.id)
  }

  /**
  * funcion para rechazar una solicitud de amistad entrante
  */
  wannaDeclineFriendRequest(pFriendId: string) {
    this.socket.emit('wannaDeclineFriendRequest', this.backService.user.id, pFriendId)
  }

  /**
  * funcion para aceptar una solicitud de amistad
  */
  wannaAcceptFriendRequest(pFriendId: string) {
    this.socket.emit('wannaAcceptFriendRequest', this.backService.user.id, pFriendId)
  }

  /**
  * Funcion para enviar solicitudes de amistad a traves de un socket
  */
  sendFriendRequest(email: string) {
    this.socket.emit('wannaSendFriendRequest', this.backService.user.id, email, this.backService.user.name)
  }
  //---FIN DE PETICIONES DE AMISTAD---

  //---INICIO DE LISTA DE AMIGOS---

  /**
  * Funcion para recuperar la lista de amigos del servidor
  */
  wannaGetfriendList() {
    this.socket.emit('wannaGetListFriend', this.backService.user.id)
  }

  /**
   * Funcion para borrar a una persona de la lista de amigos
   */
  removeFriend(pIdFriend: string) {
    this.socket.emit('deleteFriend', this.backService.user.id, pIdFriend)
  }

  /**
  * Funcion para recibir la lista de amigos de una persona
  */
  getFriendList(): Observable<Array<User>> {
    return new Observable((observer) => {
      this.socket.on('friendList', (content: Array<User>) => {
        observer.next(content);
      });
    });
  }

  /**
  * Listas de amigo
  */
  onFriendListReceived() {
    return new Observable((observer) => {
      this.socket.on('friendListReceived', (content: { name: string, id: string }) => {
        observer.next(content);
      });
    });
  }

  //---FIN DE LISTA DE AMIGOS---

  //---INICIO DE INVITACIONES A PARTIDA---

  /**
  * Funcion para invitar a una persona a la partida 
  */
  sendInvitation(friendData: { id?: UserID, email?: UserEmail }, roomName: string, pFriendName: string = "") {
    this.socket.emit('wannaSendInvitation', this.backService.user.id, friendData, roomName, pFriendName);
  }

  /**
  * Funcion para recibir las invitaciones a partida entrantes
  */
  onInvitationReceived() {
    this.socket.off('InvitationReceived')
    return new Observable((observer) => {
      this.socket.on('InvitationReceived', (content) => {
        observer.next(content);
      });
    });
  }
  //---FIN DE INVITACIONES A PARTIDA---

  onStatus() {
    console.log("ejecucion del on status");
    this.socket.off('status');
    this.socket.on('status', (content, resultado) => {
      this.dataFrontService.showToast({ type: (content.status) ? 'success' : 'warning', title: '', subhead: content.reason, options: {} });
    });
  }
}
