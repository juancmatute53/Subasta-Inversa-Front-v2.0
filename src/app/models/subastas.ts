import {Cliente} from "./cliente";

export class Subastas {

  private _idSubasta: number;
  private _fechaInicio: string;
  private _fechaFin: string;
  private _estadoSubasta: string;
  private _tituloSubasta: string;
  private _horaCierreSubasta: string;
  private _descripcionSubasta: string;
  private _imgSubasta: string;
  private _cliente: Cliente;


  constructor(idSubasta: number, fechaInicio: string, fechaFin: string, estadoSubasta: string, tituloSubasta: string, horaCierreSubasta: string, descripcionSubasta: string, imgSubasta: string, cliente: Cliente) {
    this._idSubasta = idSubasta;
    this._fechaInicio = fechaInicio;
    this._fechaFin = fechaFin;
    this._estadoSubasta = estadoSubasta;
    this._tituloSubasta = tituloSubasta;
    this._horaCierreSubasta = horaCierreSubasta;
    this._descripcionSubasta = descripcionSubasta;
    this._imgSubasta = imgSubasta;
    this._cliente = cliente;
  }


  get idSubasta(): number {
    return this._idSubasta;
  }

  set idSubasta(value: number) {
    this._idSubasta = value;
  }

  get fechaInicio(): string {
    return this._fechaInicio;
  }

  set fechaInicio(value: string) {
    this._fechaInicio = value;
  }

  get fechaFin(): string {
    return this._fechaFin;
  }

  set fechaFin(value: string) {
    this._fechaFin = value;
  }

  get estadoSubasta(): string {
    return this._estadoSubasta;
  }

  set estadoSubasta(value: string) {
    this._estadoSubasta = value;
  }

  get tituloSubasta(): string {
    return this._tituloSubasta;
  }

  set tituloSubasta(value: string) {
    this._tituloSubasta = value;
  }

  get horaCierreSubasta(): string {
    return this._horaCierreSubasta;
  }

  set horaCierreSubasta(value: string) {
    this._horaCierreSubasta = value;
  }

  get descripcionSubasta(): string {
    return this._descripcionSubasta;
  }

  set descripcionSubasta(value: string) {
    this._descripcionSubasta = value;
  }

  get imgSubasta(): string {
    return this._imgSubasta;
  }

  set imgSubasta(value: string) {
    this._imgSubasta = value;
  }

  get cliente(): Cliente {
    return this._cliente;
  }

  set cliente(value: Cliente) {
    this._cliente = value;
  }
}
