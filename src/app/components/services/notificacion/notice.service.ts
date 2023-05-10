import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {MessageService} from "primeng/api";

@Injectable({
  providedIn: 'root'
})
export class NoticeService {

  msjErrorHost: string=
    "Al parecer hubo un error por parte del sistema interno de notificaciones. " +
    "Esto puede afectar la entrega de notificaciones importantes para su cuenta. " +
    "Codigo de error: EDNS " +
    "Notifique al departamento tecnico del error para poder solucionarlo oportunamente."

  msjErroAuth: string=
    "Al parecer hubo un error de autentificacion de parte del sistema interno de notificaciones al usuario." +
    "Esto puede afectar la entrega de notificaciones importantes para su cuenta. " +
    "Codigo de error: EAUTH " +
    "Notifique al departamento tecnico del error para poder solucionarlo oportunamente."

  msjErroDesconocido: string=
    "Los sentimos, hubo un error desconocido por parte del sistema interno de notificaciones." +
    "Esto puede afectar la entrega de notificaciones importantes para su cuenta. " +
    "Codigo de error: No conocido " +
    "Notifique al departamento tecnico del error para poder solucionarlo oportunamente."

  headers = new HttpHeaders().append('Content-Type', 'application/json')
  constructor(private _http: HttpClient, private _messageService: MessageService) {
  }

  enviarMensaje(data: any): void{
    this._http.post('http://localhost:3000/envio', data, { headers: this.headers })
      .subscribe(
        (response: any) => {
          if (!response.ok){
            switch (response.msg.code){
              case 'EDNS':
                this.addSingle(
                  this.msjErrorHost,
                  'error', 'Error en el sistama de notificaciones externo de notificacion.'
                );
                break;
              case 'EAUTH':
                this.addSingle(
                  this.msjErroAuth,
                  'error', 'Error en el sistama de notificaciones externo de notificacion.'
                );
                break;
              default:
                this.addSingle(
                  this.msjErroDesconocido,
                  'error', 'Error en el sistama de notificaciones externo de notificacion.'
                );
            }
          }
        },
        error => {
          this.addSingle(
            this.msjErroDesconocido + error,
            'error', 'Error en el sistama de notificaciones externo de notificacion.'
          );
        }
      );
  }

  enviarMensajeWhatsapp(data: any): void{
    this._http.post('http://localhost:3001/lead', data, { headers: this.headers })
      .subscribe(
        (response: any) => {
          // NO SE PUEDE CONTROLAR UN ERROR COMO TAL AQUI
        },
        (error: any) => {
          this.addSingle(
            this.msjErroDesconocido + error,
            'error', 'Error en el sistama de notificaciones externo de notificacion.'
          );
        }
      );
  }

  addSingle(message: string, severity: string, summary: string) {
    // Agrega el mensaje al servicio de mensajes, con una duración de 10 segundos
    this._messageService.add({severity: severity, summary: summary, detail: message, life: 10000});

    // Luego de 10 segundos, recarga la página
    setTimeout(() => {
      location.reload();

    }, 10000);
  }
}
