import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class SubastaCrudService {

  headers = new HttpHeaders().append('Content-Type', 'application/json')

  constructor(private _http: HttpClient) {
  }

  crearSubasta(data: any): Promise<any> {
    //console.log(data);
    return this._http.post('http://localhost:9090/auth/subasta/crear',
      data,
      {
        headers: this.headers
      }
    ).toPromise();
  }

  editarSubasta(data: any, id: string): Promise<any> {
    //console.log(data);
    return this._http.put('http://localhost:9090/auth/subasta/editar/' + id,
      data,
      {
        headers: this.headers
      }
    ).toPromise();
  }

  obtenerSubasta(): Promise<any> {
    return this._http.get('http://localhost:9090/auth/subasta/listar').toPromise();
  }

  filtrarSubasta(filtro: string): Promise<any> {
    return this._http.get('http://localhost:9090/auth/subasta/listar/' + filtro).toPromise();
  }

  eliminarSubasta(id: string): Promise<any> {
    return this._http.get('http://localhost:9090/auth/subasta/listar/' + id).toPromise();
  }

  eviarSubasta(formData: FormData): void{
    this._http.post<any>('http://localhost:9090/auth/subasta/crear', formData).subscribe(data => {
      return 'Subasta generada correctamente';
    });
  }
}


