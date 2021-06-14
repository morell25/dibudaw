import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MainRoutingModule } from './main-routing.module';
import { MainComponent } from '../components/main/main.component';
import { ConfigComponent } from '../components/config/config.component';
import { ChangePasswordComponent } from '../components/config/change-password/change-password.component';
import { ChangeEmailComponent } from '../components/config/change-email/change-email.component';
import { LobbyComponent } from '../components/main/lobby/lobby.component';
import { LobbyFriendsComponent } from '../components/main/lobby/lobby-friends/lobby-friends.component';
import { GameComponent } from '../components/game/game.component';
import { ChatComponent } from '../components/game/chat/chat.component';
import { CanvasComponent } from '../components/game/canvas/canvas.component';
import { ToolsComponent } from '../components/game/tools/tools.component';
import { HomeComponent } from '../components/main/home/home.component';
import { RouterModule } from '@angular/router';
import { HomeFriendsComponent } from '../components/main/home/home-friends/home-friends.component';
import { SidebarComponent } from '../components/game/sidebar/sidebar.component';
import { WordInfoComponent } from '../components/game/word-info/word-info.component';
import { TimerComponent } from '../components/game/timer/timer.component';
import { ClipboardModule } from 'ngx-clipboard';




@NgModule({
  declarations: [
    MainComponent,

    HomeComponent,
    HomeFriendsComponent,

    ConfigComponent,
    ChangePasswordComponent,
    ChangeEmailComponent,

    LobbyComponent,
    LobbyFriendsComponent,

    GameComponent,
    ChatComponent,
    CanvasComponent,
    ToolsComponent,
    HomeComponent,
    TimerComponent,
    SidebarComponent,
    WordInfoComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    MainRoutingModule,
    DragDropModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    ClipboardModule
  ]
})
export class MainModule { }
