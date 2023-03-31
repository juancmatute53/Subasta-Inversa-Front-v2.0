import { Injectable } from '@angular/core';
import {OfertaCrudService} from "../oferta/oferta-crud.service";
import {HttpClient} from "@angular/common/http";
import {Ofertas} from "../../../models/ofertas";
import {SubastaCrudService} from "../subasta/subasta-crud.service";
import {MessageService} from "primeng/api";

@Injectable({
  providedIn: 'root'
})
export class SeleccionDeGanadorService {

  // * Se dene elegir la oferta que tenga el precio unico y mas bajo

  preciosOfertas: string[]= [];
  // @ts-ignore
  subastaGanadora: Ofertas;
  constructor(private _ofertaCrudService: OfertaCrudService, private _http: HttpClient,
              private _subastaCrudService: SubastaCrudService, private _messageService: MessageService) { }

  procesosSeleccion(id: number): void{
    const preciosUnicos:[]= [];
    this._ofertaCrudService.obtenerOferta().then(res =>{
      // @ts-ignore
      res.forEach((oferta, index) =>{
        if (oferta.subasta.idSubasta === id){
          this.preciosOfertas.push(oferta.percioOferta);
        }
      });

      const resultado = {}
      for (const el of this.preciosOfertas) { // @ts-ignore
        resultado[el] = resultado[el] + 1 || 1
      }

      Object.values(resultado).forEach((precios, index) =>{
        // @ts-ignore
        if (precios <= 1){
          console.log(Object.keys(resultado)[index]);
          // @ts-ignore
          preciosUnicos.push(Object.keys(resultado)[index]);
        }
      })
      // @ts-ignore
      this.subastaGanadora= res.filter(valor => {
        // @ts-ignore
        return valor.percioOferta === Math.min(...preciosUnicos)
      });
      console.log(this.subastaGanadora)
      this.actualizarEstadoSubasta(this.subastaGanadora);
      this.actualizarOferta(this.subastaGanadora);
    }).catch(err =>{
      this.addSingle(err.message, 'error', 'Error al ofertar');
    })
  }

  actualizarEstadoSubasta(oferSubasta: any) :void{
    const subastaActualizada = {
      tituloSubasta: oferSubasta[0].subasta.tituloSubasta,
      horaCierreSubasta: oferSubasta[0].subasta.horaCierreSubasta,
      fechaInicio: oferSubasta[0].subasta.fechaInicio,
      fechaFin: oferSubasta[0].subasta.fechaFin,
      estadoSubasta: 'Cerrada',
      descripcionSubasta: oferSubasta[0].subasta.descripcionSubasta,
      imgSubasta: oferSubasta[0].subasta.imgSubasta,
      cliente: {
        id_persona: oferSubasta[0].subasta.cliente.id_persona
      },
      servicio: {
        idServicio: oferSubasta[0].subasta.servicio.idServicio
      }
    }
    console.log('A ',subastaActualizada)

    this._subastaCrudService.editarSubasta(subastaActualizada, oferSubasta[0].subasta.idSubasta).then(res => {
      this.addSingle('Subasta finalizada', 'success', 'Finalizacion');
    }).catch(err => {
      this.addSingle(err.message, 'error', 'Error');
    })
  }

  actualizarOferta(ofer: any):void{
    const oferta = {
      percioOferta: ofer[0].percioOferta,
      fecha: ofer[0].fecha,
      comentario_calificacion_oferta: "",
      estado: true,
      calificacion: 0,
      proveedor: {
        id_persona: ofer[0].proveedor.id_persona
      },
      subasta: {
        idSubasta: ofer[0].subasta.idSubasta
      }
    };
    console.log(oferta)

    this._ofertaCrudService.editarOferta(oferta, ofer[0].idOferta).then(res =>{
      this.addSingle(
        'Tu subasta ha finalizado, puedes comunicarte con '+ofer.proveedor.nombre + ' ' + ofer.proveedor.apellido,
        'success', 'Ofertar');
      location.reload();
    }).catch(err =>{
      this.addSingle('No se ha podido efectuar la seleccion del ganador.', 'error', 'Error al ofertar');
    })
  }

  addSingle(message: string, severity: string, summary: string) {
    this._messageService.add({severity: severity, summary: summary, detail: message});
  }
}
