import {Personas} from "./personas";

export class Cliente extends Personas{

  constructor(id_persona: number, nombre: string, apellido: string, email: string, telefono: string, direccion: string) {
    super(id_persona, nombre, apellido, email, telefono, direccion);
  }

}
