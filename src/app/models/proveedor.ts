import {Personas} from "./personas";

export class Proveedor extends Personas{
  private anioo_exp: number;


  constructor(id_persona: number, nombre: string, apellido: string, email: string, telefono: string, direccion: string, anioo_exp: number) {
    super(id_persona, nombre, apellido, email, telefono, direccion);
    this.anioo_exp = anioo_exp;
  }

}
