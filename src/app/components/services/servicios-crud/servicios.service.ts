import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ServiciosService {

  headers = new HttpHeaders().append('Content-Type', 'application/json')

  constructor(private _http: HttpClient) { }

  // * Peticion GET que retorna una Promesa
  obtenerServicios(): Promise<any> {
    return  this._http.get('http://localhost:9090/auth/servicio/listar').toPromise();
  }

}
