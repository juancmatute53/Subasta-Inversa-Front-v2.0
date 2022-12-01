import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class OfertaCrudService {

  headers = new HttpHeaders().append('Content-Type', 'application/json')

  constructor(private _http: HttpClient) { }

  crearOferta(data: any): Promise<any> {
    return this._http.post('http://localhost:9090/auth/oferta/crear',
      data,
      {
        headers: this.headers
      }
    ).toPromise();
  }

  editarOferta(data: any, id: string): Promise<any> {
    //console.log(data);
    return this._http.put('http://localhost:9090/auth/oferta/editar/' + id,
      data,
      {
        headers: this.headers
      }
    ).toPromise();
  }

  obtenerOferta(): Promise<any> {
    return this._http.get('http://localhost:9090/auth/oferta/listar').toPromise();
  }

  filtrarOferta(filtro: string): Promise<any> {
    return this._http.get('http://localhost:9090/auth/oferta/listar/' + filtro).toPromise();
  }


  subastaOferta(id: number): Promise<any> {
    return this._http.get('http://localhost:9090/auth/oferta/listar/subasta/' + id).toPromise();
  }

  eliminarOferta(id: string): Promise<any> {
    return this._http.get('http://localhost:9090/auth/oferta/listar/' + id).toPromise();
  }

  listarProveedor(id: string): Promise<any>{
    return this._http.get('http://localhost:9090/auth/oferta/listar/proveedor/' + id).toPromise();
  }

}
