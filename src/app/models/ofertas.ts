import {Subastas} from "./subastas";
import {Proveedor} from "./proveedor";

export class Ofertas {


  private idOferta: number;

  private percioOferta: number;

  private fecha: Date;

  public comentario_calificacion_oferta: string;

  private estado: boolean;

  public calificacion: number;

  subasta: Subastas;

  proveedor: Proveedor;


  constructor(idOferta: number, percioOferta: number, fecha: Date, comentario_calificacion_oferta: string, estado: boolean, calificacion: number, subasta: Subastas, proveedor: Proveedor) {
    this.idOferta = idOferta;
    this.percioOferta = percioOferta;
    this.fecha = fecha;
    this.comentario_calificacion_oferta = comentario_calificacion_oferta;
    this.estado = estado;
    this.calificacion = calificacion;
    this.subasta = subasta;
    this.proveedor = proveedor;
  }
}

