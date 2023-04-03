import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class NoticeService {

  headers = new HttpHeaders().append('Content-Type', 'application/json')
  constructor(private _http: HttpClient) {
  }

  enviarMensaje(data: any): void{
    this._http.post('http://localhost:3000/envio', data, { headers: this.headers })
      .subscribe(
        response => console.log(response),
        error => console.log(error)
      );
  }

  enviarMensajeWhatsapp(data: any): void{
    this._http.post('http://localhost:3001/lead', data, { headers: this.headers })
      .subscribe(
        response => console.log(response),
        error => console.log(error)
      );
  }
}
