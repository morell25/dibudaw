import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { MainGuard } from './services/main.guard';


const routes: Routes = [
  { path: "", redirectTo: "main", pathMatch: 'full' },
  { path: "main", canActivate: [MainGuard], loadChildren: () => import('./modules/main.module').then(m => m.MainModule) },
  { path: "login", component: LoginComponent },
  { path: "**", redirectTo: 'main' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: 'enabled'
})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
