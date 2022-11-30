import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {LoginUsuario} from "../../../models/login-usuario";
import {JwtDTO} from "../../../models/jwt-dto";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  authURL = 'http://localhost:9090/auth/';
  headers = new HttpHeaders().append('Content-Type', 'application/json')

  constructor(private _http: HttpClient) { }

  public login(loginUser: LoginUsuario): Promise<JwtDTO> {
    // @ts-ignore
    return this._http.post(this.authURL + 'login', loginUser).toPromise();
  }
}
