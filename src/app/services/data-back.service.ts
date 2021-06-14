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


  music: boolean = true;
  sound: boolean = true;

  user!: User;
  userSubject: Subject<User> = new Subject<User>();



  friendList: Array<User> = [];
  friendListSubject: Subject<Array<User>> = new Subject<Array<User>>();

  friendRequests: Array<FriendRequest> = [];
  friendRequestSubject: Subject<Array<FriendRequest>> = new Subject<Array<FriendRequest>>();

  //crear tipo invitación
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

}
