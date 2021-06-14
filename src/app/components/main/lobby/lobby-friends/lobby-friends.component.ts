import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { User } from 'types';
import { DataBackService } from 'src/app/services/data-back.service';
import { SocialService } from '../../../../services/social.service';
import { config, Subscription } from 'rxjs';
import { SocketsService } from '../../../../services/sockets.service';
import { pid } from 'process';
import { Content } from '@angular/compiler/src/render3/r3_ast';
import { DataFrontService } from '../../../../services/data-front.service';

import { type } from 'os';

@Component({
    selector: 'app-lobby-friends',
    templateUrl: './lobby-friends.component.html'
})
export class LobbyFriendsComponent implements OnInit {
    user: User;
    friendList: any;
    friendListSubscription: Subscription;
    roomName: string | null;

    constructor(private backService: DataBackService, private socialService: SocialService, private socketService: SocketsService, private dataFrontService: DataFrontService) {
        this.user = backService.user;
        this.roomName = this.socketService.roomName

        this.socialService.onInvitationReceived().subscribe((updatedInvitation: any) => {
            this.backService.invitationReceived = updatedInvitation;
            this.backService.invitationReceivedSubject.next(updatedInvitation);
        })

        this.friendListSubscription = this.backService.friendListSubject.subscribe((content: Array<any>) => {
            this.friendList = content;
        });

        this.socialService.onFriendListReceived().subscribe((content: any) => {
          this.friendList.push(content)
        })
        this.socialService.wannaGetfriendList()

    this.socialService.onStatus()
  }

    ngOnInit(): void {
  }

  changeName(pNewName: string) {
  }

  joinRoom(roomName: string) {
    if (roomName.length == 24) {
      this.socketService.joinRoom(roomName);
    }
  }

  deleteFriend(pIdUserFriend: string) {
    let deletedFriend = this.friendList.find((request: any) => request.id == pIdUserFriend);
    if (deletedFriend != undefined) {
      let indexDeclinedRequest = this.friendList.indexOf(deletedFriend);
      this.friendList.splice(indexDeclinedRequest, 1);
      this.socialService.removeFriend(pIdUserFriend);
    }
  }

  sendInvitationByEmail(pEmail: string) {
      if (pEmail != undefined && pEmail != '' && /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(pEmail)) {
          this.socialService.sendInvitation({ email: pEmail }, this.roomName!);
      }
      else {
          this.dataFrontService.showToast({ type: "error", title: "Error", subhead: "Introduce un email válido", options: {} });
      }
  }

  sendInvitationToFriend(pIdUserFriend: string, pFriendName: string) {
    this.socialService.sendInvitation({ id: pIdUserFriend }, this.roomName!, pFriendName);
  }



}
