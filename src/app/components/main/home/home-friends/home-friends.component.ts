import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { User } from 'types';
import { DataBackService } from 'src/app/services/data-back.service';
import { SocialService } from '../../../../services/social.service';
import { Subscription } from 'rxjs';
import { SocketsService } from '../../../../services/sockets.service';
import { DataFrontService } from '../../../../services/data-front.service';
import { AuthService } from '../../../../services/auth.service';


@Component({
  selector: 'app-home-friends',
  templateUrl: './home-friends.component.html'
})
export class HomeFriendsComponent implements OnInit {
    user: User;
    friendListSubscription: Subscription;
    friendList: Array<any> = [];


  constructor(private backService: DataBackService, private socialService: SocialService, private socketService: SocketsService, private frontService: DataFrontService, private authService: AuthService) {
        this.user = backService.user;
        this.socialService.getFriendList().subscribe((updatedFriendList) => {
            this.backService.friendList = updatedFriendList;
            this.backService.friendListSubject.next(updatedFriendList);
        })

        this.friendListSubscription = this.backService.friendListSubject.subscribe((content: Array<any>) => {
            this.friendList = content;
        });

        this.socialService.onFriendListReceived().subscribe((content: any) => {
            this.friendList.push(content)
        })

    this.socialService.wannaGetfriendList()
    this.socialService.onStatus();
  }

  ngOnInit(): void {
  }

    deleteFriend(pIdUserFriend: string) {
        let deletedFriend = this.friendList.find((request) => request.id == pIdUserFriend);
        if (deletedFriend != undefined) {
            let indexDeclinedRequest = this.friendList.indexOf(deletedFriend)
            this.friendList.splice(indexDeclinedRequest, 1)
            this.socialService.removeFriend(pIdUserFriend)
        }
    }


  changeName(newName: string) {
    this.authService.changeField('username', newName);
  }

  JoinFriendGame(friendId: string) {
      this.socketService.joinFriendRoom(friendId)
  }

  sendFriendRequest(pEmail: string) {
    if (pEmail != undefined && pEmail != '' && /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(pEmail))
      this.socialService.sendFriendRequest(pEmail)
    else this.frontService.showToast({ type: "error", title: "Error", subhead: "Introduce un email válido", options: {} });
  }
}




