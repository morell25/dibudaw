import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { TermsComponent } from './components/terms/terms.component';
import { MainGuard } from './services/main.guard';


const routes: Routes = [
  { path: "", redirectTo: "main", pathMatch: 'full' },
  { path: "main", canActivate: [MainGuard], loadChildren: () => import('./modules/main.module').then(m => m.MainModule) },
  { path: "login", component: LoginComponent },
  { path: "terms", component: TermsComponent },
  { path: "**", redirectTo: 'main' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: 'enabled'
})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
