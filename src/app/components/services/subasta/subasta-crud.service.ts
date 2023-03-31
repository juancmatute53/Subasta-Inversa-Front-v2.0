import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {MessageService} from "primeng/api";

@Injectable({
  providedIn: 'root'
})
export class SubastaCrudService {

  headers = new HttpHeaders().append('Content-Type', 'application/json')

  constructor(private _http: HttpClient, private _messageService: MessageService) {
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

  obtenerSubastaNoPuja(id: any): Promise<any> {
    return this._http.get('http://localhost:9090/auth/subasta/listar/NoPuja/'+id).toPromise();
  }

  filtrarSubasta(filtro: string): Promise<any> {
    return this._http.get('http://localhost:9090/auth/subasta/listar/' + filtro).toPromise();
  }

  eliminarSubasta(id: string): Promise<any> {
    return this._http.get('http://localhost:9090/auth/subasta/listar/' + id).toPromise();
  }

  eviarSubasta(formData: FormData): void{
    this._http.post<any>('http://localhost:9090/auth/subasta/crear', formData).subscribe(data => {
        this._messageService.add({severity: 'success', summary: 'Subasta Registrada', detail: 'La subasta se registro correctamente'});
        location.reload();
    },
      err => this._messageService.add({severity: 'error', summary: 'Error', detail: 'Hubo un error al tratar de registrar la subasta'}));
  }
}


