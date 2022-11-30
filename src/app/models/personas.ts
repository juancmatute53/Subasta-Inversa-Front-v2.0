export class Personas {
  private _id_persona: number;
  private _nombre: string;
  private _apellido: string;
  private _email: string;
  private _telefono: string;
  private _direccion: string;


  constructor(id_persona: number, nombre: string, apellido: string, email: string, telefono: string, direccion: string) {
    this._id_persona = id_persona;
    this._nombre = nombre;
    this._apellido = apellido;
    this._email = email;
    this._telefono = telefono;
    this._direccion = direccion;
  }

  get id_persona(): number {
    return this._id_persona;
  }

  set id_persona(value: number) {
    this._id_persona = value;
  }

  get nombre(): string {
    return this._nombre;
  }

  set nombre(value: string) {
    this._nombre = value;
  }

  get apellido(): string {
    return this._apellido;
  }

  set apellido(value: string) {
    this._apellido = value;
  }

  get email(): string {
    return this._email;
  }

  set email(value: string) {
    this._email = value;
  }

  get telefono(): string {
    return this._telefono;
  }

  set telefono(value: string) {
    this._telefono = value;
  }

  get direccion(): string {
    return this._direccion;
  }

  set direccion(value: string) {
    this._direccion = value;
  }
}
