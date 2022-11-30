import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {HomeComponent} from "./components/home/home.component";
import {LoginComponent} from "./components/login/login.component";
import {DashboardComponent} from "./components/dashboard/dashboard.component";
import {SignUpComponent} from "./components/sign-up/sign-up.component";
import {PagenotfoundComponent} from "./components/pagenotfound/pagenotfound.component";
import {ProdGuardService as guard} from "./interceptors/prod-guard.service";

const routes: Routes = [
  {path: '', redirectTo: '/home', pathMatch: 'full'},
  {path: 'home', component: HomeComponent},
  {path: 'login', component: LoginComponent},
  {path: 'dashboard', component: DashboardComponent, canActivate: [guard], data: {expectedRol:['admin', 'proveedor', 'cliente']}},
  {path: 'sign-up', component: SignUpComponent},
  {path: '**', component: PagenotfoundComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
