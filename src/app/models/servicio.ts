export class Servicio {
  private _idServicio: number;
  private _nombreServicio: string;
  private _descripcion_servicio: string;


  constructor(idServicio: number, nombreServicio: string, descripcion_servicio: string) {
    this._idServicio = idServicio;
    this._nombreServicio = nombreServicio;
    this._descripcion_servicio = descripcion_servicio;
  }


  get idServicio(): number {
    return this._idServicio;
  }

  set idServicio(value: number) {
    this._idServicio = value;
  }

  get nombreServicio(): string {
    return this._nombreServicio;
  }

  set nombreServicio(value: string) {
    this._nombreServicio = value;
  }

  get descripcion_servicio(): string {
    return this._descripcion_servicio;
  }

  set descripcion_servicio(value: string) {
    this._descripcion_servicio = value;
  }
}
