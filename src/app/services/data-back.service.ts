import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { first } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';
import { BufferedRoom, FriendRequest, Game, Scoreboard, TeamNumber, User } from 'types';


@Injectable({
  providedIn: 'root'
}) 
export class DataBackService {

  constructor(private httpClient: HttpClient, private router: Router) { }



  user!: User;
  userSubject: Subject<User> = new Subject<User>();



  friendList: Array<User> = [];
  friendListSubject: Subject<Array<User>> = new Subject<Array<User>>();

  friendRequests: Array<FriendRequest> = [];
  friendRequestSubject: Subject<Array<FriendRequest>> = new Subject<Array<FriendRequest>>();

  //crear typo invitacion
  invitationReceived: Array<any> = [];
  invitationReceivedSubject: Subject<Array<any>> = new Subject<Array<any>>();

  room!: BufferedRoom;
  roomSubject: Subject<BufferedRoom> = new Subject<BufferedRoom>();



  game!: Game;
  gameSubject: Subject<Game> = new Subject<Game>();

  team!: TeamNumber;
  scoreboard!: Scoreboard;







  roomSubscriptions: Array<Subscription> = [];
  clearRoomSubscriptions() { this.roomSubscriptions.forEach((subscription) => subscription.unsubscribe()) }




  /*

  //ACTUALIZAR VARIABLES
  setRoom(room: any) {
    this.room = room;
    this.roomSubject.next(room);
  }

  setUser(user: User) {
    this.user = user;
  }

  setFriendList(friendList: any) {
    this.friendList = friendList;
    this.friendListSubject.next(friendList);
  }




  //USER CONFIG:
  changeName() {

  }
  

  //SOCIAL:
  getFriends() {
    this.httpClient.post(this.expressUrl + '/api/social/getFriends', { id: this.user.id }).subscribe(
      (response: any) => {
        this.friendList = response;
        this.friendListSubject.next(response);
      },
      (error) => { console.log(error); }
    );
      return this.friendList
  }


  addFriend(pEmailFriend: string){
    this.httpClient.post(this.expressUrl + '/api/social/addFriend', {id: this.user.id, email: pEmailFriend}).subscribe(
      (response:any) => {
        console.log(response)
      },
      (error) => { console.log("Error amigo no encontrado por:" + error) }
    )
  }


  */
}
