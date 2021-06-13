import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { finalize, first, take } from 'rxjs/operators';

import { DataBackService } from './data-back.service';
import { SocketsService } from './sockets.service';

@Injectable({
  providedIn: 'root'
})
export class LobbyGuard implements CanActivate {



  constructor(private socketService: SocketsService) { }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {


    return this.socketService.onRoomCreated();


  }

}
