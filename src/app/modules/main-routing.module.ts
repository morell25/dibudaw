import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChangeEmailComponent } from '../components/config/change-email/change-email.component';
import { ChangePasswordComponent } from '../components/config/change-password/change-password.component';
import { ConfigComponent } from '../components/config/config.component';
import { GameComponent } from '../components/game/game.component';
import { HomeComponent } from '../components/main/home/home.component';
import { LobbyComponent } from '../components/main/lobby/lobby.component';
import { MainComponent } from '../components/main/main.component';
import { GameGuard } from '../services/game.guard';
import { LobbyGuard } from '../services/lobby.guard';


const routes: Routes = [
  {
    path: '', component: MainComponent, children: [
      { path: "", redirectTo: "home", pathMatch: "full" },
      { path: "home", component: HomeComponent },
      { path: "lobby", component: LobbyComponent, canActivate: [LobbyGuard] }
    ]
  },
  { path: "game", component: GameComponent, canActivate: [GameGuard] },
  { path: "config", component: ConfigComponent },
  { path: "config/email", component: ChangeEmailComponent },
  { path: "config/password", component: ChangePasswordComponent },
  { path: "**", redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule { }
