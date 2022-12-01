import { Injectable } from '@angular/core';
import {OfertaCrudService} from "../oferta/oferta-crud.service";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class SeleccionDeGanadorService {

  // * Se dene elegir la oferta que tenga el precio unico y mas bajo

  preciosOfertas: string[]= [];

  constructor(private _ofertaCrudService: OfertaCrudService, private _http: HttpClient) { }

  procesosSeleccion(id: number): void{
    this._ofertaCrudService.obtenerOferta().then(res =>{
      // @ts-ignore
      res.forEach((oferta, index) =>{
        if (oferta.subasta.idSubasta === id){
          this.preciosOfertas.push(oferta.percioOferta);
        }
      });
      console.log(this.preciosOfertas);
      const preciosUnicos= this.preciosOfertas.filter((valor, index, arreglo) =>{
        if (index !=0){
          return valor != arreglo[index-1];
        }else {
          return valor != arreglo[index]
        }
      });

      // @ts-ignore
      const subastaGanadora= res.filter(valor => {
        // @ts-ignore
        return valor.percioOferta === Math.min(...preciosUnicos)
      });
    }).catch(err =>{
      console.log(err);
    })
  }
}
