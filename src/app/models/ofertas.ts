import {Subastas} from "./subastas";

export class Ofertas {


  private idOferta: number;

  private percioOferta: number;

  private fecha: Date;

  private comentario_calificacion_oferta: string;

  private estado: boolean;

  private calificacion: number;

  subasta: Subastas;


  constructor(idOferta: number, percioOferta: number, fecha: Date, comentario_calificacion_oferta: string, estado: boolean, calificacion: number, subasta: Subastas) {
    this.idOferta = idOferta;
    this.percioOferta = percioOferta;
    this.fecha = fecha;
    this.comentario_calificacion_oferta = comentario_calificacion_oferta;
    this.estado = estado;
    this.calificacion = calificacion;
    this.subasta = subasta;
  }
}

