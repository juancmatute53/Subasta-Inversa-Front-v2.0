import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ServicioService {

  headers = new HttpHeaders().append('Content-Type', 'application/json')

  constructor(private _http: HttpClient) {

  }

  crearServicio(data: any): Promise<any> {
    //console.log(data);
    return this._http.post('http://localhost:9090/auth/servicio/crear',
      data
    ).toPromise();
  }

}

