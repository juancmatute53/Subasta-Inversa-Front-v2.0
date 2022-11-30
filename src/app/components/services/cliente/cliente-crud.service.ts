import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ClienteCrudService {

  headers = new HttpHeaders().append('Content-Type', 'application/json')

  constructor(private _http: HttpClient) { }

  filtrarCliente(filtro: string): Promise<any> {
    return this._http.get('http://localhost:9090/auth/cliente/listar/'+filtro).toPromise();
  }
}
