import { Component, ElementRef, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { DataBackService } from 'src/app/services/data-back.service';
import { SocketsService } from 'src/app/services/sockets.service';
import { HomeComponent } from './home/home.component';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { SocialService } from 'src/app/services/social.service';
import { FriendRequest, User } from '../../../../types';
import { Subscription } from 'rxjs';
import { DataFrontService } from '../../services/data-front.service';

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html'
})


export class MainComponent implements OnDestroy {
    inRoom: boolean = false;
    friendRequests: Array<FriendRequest> = [];
    friendRequestsSubscription: Subscription;
    invitationList: Array<any> = [];
    invitationListSubscription: Subscription;
    user: User;
    total = 0;

    ngOnDestroy() {
        this.friendRequestsSubscription.unsubscribe()
        this.invitationListSubscription.unsubscribe()
    }


ngAfterViewInit(){
   var x = this.el.nativeElement.getElementsByTagName("i")[0]; 
   console.log(x);
}

  constructor(private authService: AuthService, public backService: DataBackService, private socialService: SocialService, private socketService: SocketsService, public el: ElementRef) {
    this.user = backService.user;

        this.friendRequests = this.backService.friendRequests;
        this.invitationList = this.backService.invitationReceived;
        this.socialService.onFriendRequests().subscribe((content: any) => {
            this.backService.friendRequests = content
            this.backService.friendRequestSubject.next(this.backService.friendRequests)
        })

        this.friendRequestsSubscription = this.backService.friendRequestSubject.subscribe((content: Array<FriendRequest>) => {
            this.friendRequests = content;
            this.total = this.friendRequests.length + this.invitationList.length;
        });

        this.socialService.onFriendRequestReceived().subscribe((content: any) => {
            this.friendRequests.push(content)
            this.total = this.friendRequests.length + this.invitationList.length;
            console.log(this.total);
        })
        this.socialService.wannaGetFriendRequest();

        this.invitationListSubscription = this.backService.invitationReceivedSubject.subscribe((content: any) => {
            this.invitationList.push(content);
        });

        this.socialService.onInvitationReceived().subscribe((content: any) => {
            this.invitationList.push(content);
            this.total = this.invitationList.length +this.friendRequests.length;
            console.log(this.total);
        })
    }

    ngOnInit(){
    }

    acceptFriendRequest(pIdUser: string) {
        let acceptFriendRequest = this.friendRequests.find((request) => request.id == pIdUser);
        if (acceptFriendRequest != undefined) {
            let indexDeclinedRequest = this.friendRequests.indexOf(acceptFriendRequest);
            this.backService.friendRequests.splice(indexDeclinedRequest, 1);
            this.backService.friendRequestSubject.next(this.backService.friendRequests);
            this.socialService.wannaAcceptFriendRequest(pIdUser);
            this.total = this.invitationList.length +this.friendRequests.length;
        }
    }

    declineFriendRequest(pIdUserFriend: string) {
        let declinedRequest = this.friendRequests.find((request) => request.id == pIdUserFriend);
        if (declinedRequest != undefined) {
            let indexDeclinedRequest = this.friendRequests.indexOf(declinedRequest);
            this.backService.friendRequests.splice(indexDeclinedRequest, 1);
            this.backService.friendRequestSubject.next(this.backService.friendRequests);
            this.socialService.wannaDeclineFriendRequest(pIdUserFriend);
            this.total = this.invitationList.length +this.friendRequests.length;
        }
    }

    joinRoom(roomName: string) {
        if (roomName.length == 24) {
            this.socketService.joinRoom(roomName);
        }
        if (roomName != undefined) {
            let indexDeclinedRequest = this.invitationList.indexOf(roomName)
            this.invitationList.splice(indexDeclinedRequest, 1)
        }
    }
    rechazaInvitation(roomName: string) {
        if (roomName != undefined) {
            let indexDeclinedRequest = this.invitationList.indexOf(roomName)
            this.invitationList.splice(indexDeclinedRequest, 1)
        }
    }

    logout() {
        this.authService.userLogout();
    }

    
}
