import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class UsuarioCrudService {

  headers = new HttpHeaders().append('Content-Type', 'application/json')

  constructor(private _http: HttpClient) {
  }

  // * TODO CRUD USUARIO PROVEEDOR
  crearUsuarioProveedor(data: any): Promise<any> {
    //console.log(data);
    return this._http.post('http://localhost:9090/auth/proveedor/crear/',
      data,
      {
        headers: this.headers
      }
    ).toPromise();
  }

  // * TODO CRUD USUARIO PROVEEDOR
  crearUsuarioCliente(data: any): Promise<any> {
    //console.log(data);
    return this._http.post('http://localhost:9090/auth/cliente/crear',
      data,
      {
        headers: this.headers
      }
    ).toPromise();
  }

  editarUsuarioProveedor(data: any, id: number): Promise<any> {
    //console.log(data);
    return this._http.put('http://localhost:9090/auth/proveedor/editar/' + id,
      data,
      {
        headers: this.headers
      }
    ).toPromise();
  }

  // * TODO CRUD USUARIO PROVEEDOR
  editarUsuarioCliente(data: any, id: number): Promise<any> {
    //console.log(data);
    return this._http.put('http://localhost:9090/auth/cliente/editar/' + id,
      data,
      {
        headers: this.headers
      }
    ).toPromise();
  }

  obtenerUsuarios(): Promise<any>{
   return  this._http.get('http://localhost:9090/proveedor/listar').toPromise()
  }
}
