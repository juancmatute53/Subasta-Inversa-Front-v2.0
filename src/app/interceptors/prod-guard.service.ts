import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from "@angular/router";
import {Observable} from "rxjs";
import {TokenService} from "../components/services/token/token.service";

@Injectable({
  providedIn: 'root'
})
export class ProdGuardService implements CanActivate{
  realRol: string ='';
  constructor(private _tokenService: TokenService, private _route: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // @ts-ignore
    const rolEsperado = route.data.expectedRol;
    const roles = this._tokenService.getAuthorities();
    roles.forEach(item =>{
      switch (item){
        case 'ROLE_ADMIN':
          this.realRol = 'admin'
          break;
        case 'ROLE_PROVEEDOR':
          this.realRol = 'proveedor'
          break;
        case 'ROLE_CLIENTE':
          this.realRol = 'cliente'
          break;
        default:
          this.realRol='no definido'
      }
    })
    if (!this._tokenService.getToken() || rolEsperado.indexOf(this.realRol) === -1){
      this._route.navigate(['/home']);
      return false;
    }
    return true;
  }
}
