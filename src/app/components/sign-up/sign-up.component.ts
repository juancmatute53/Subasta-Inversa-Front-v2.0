import {Component, OnInit} from '@angular/core';
import {UsuarioCrudService} from "../services/users-crud/usuario-crud.service";
import {ConfirmationService, MessageService, PrimeNGConfig} from 'primeng/api';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {LoginComponent} from "../login/login.component";
import {ServiciosService} from "../services/servicios-crud/servicios.service";
import {Router} from "@angular/router";

interface Categoria {
  name: string,
  descripcion: string
}

interface Servicio {
  name: string,
  descripcion: string
}

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {
  formRegistroUsuario: any;
  verFormPersona: boolean = true;
  verFormUsuario: boolean = false;
  buttonResgister: boolean = false;
  buttonSiguiente: boolean = true;
  buttonAtras: boolean = false;
  verDialogoAddServi: boolean = false;
  anioInsuficientes: boolean = false;
  buttonDialogDisabled: boolean = true;
  buttonNextDisabled: boolean = true;
  buttonRegisterDisabled: boolean = true;
  registroExitoso: boolean = false;
  aniosExp: number = 1;
  categorias: Categoria[] = [];
  serviciosBD: Servicio[] = [];
  serviciosAgregados: [] = [];
  servicioPost: [] = [];
  textBusqueda: String= '';

  constructor(private _usuarioCrudService: UsuarioCrudService,
              private _messageService: MessageService,
              private _formBuilder: FormBuilder,
              private _servios: ServiciosService,
              private primengConfig: PrimeNGConfig,
              private _confirmationService: ConfirmationService,
              private _route: Router) {
  }

  ngOnInit(): void {
    this.crearFormularioRegistro();
    this.obtenerServicios();
    this.categorias.push(
      {name: 'Cliente', descripcion: ''},
      {name: 'Proveedor', descripcion: ''}
    );
  }

  // * Creamos el formulario reactivo
  crearFormularioRegistro() {
    this.formRegistroUsuario = this._formBuilder.group({
      nombrePersona: ['', [Validators.required]],
      apellidoPersona: ['', [Validators.required]],
      emailPersona: ['', [Validators.required, Validators.email]],
      direccionPersona: ['', [Validators.required]],
      telefonoPersona: ['', [Validators.required, Validators.maxLength(10)]],
      aniosExpProveedor: ['', [Validators.required]],
      nombreUsuario: ['', [Validators.required]],
      contraseniaUsuario: ['', [Validators.required]],
      rol: ['', [Validators.required]],
      servicio: ['', [Validators.required]],
    })
  }

  // * Obtenemos los datos del formulario de registro
  datosForm(){
    const nombreP = this.formRegistroUsuario.get('nombrePersona').value;
    const apellidoP = this.formRegistroUsuario.get('apellidoPersona').value;
    const email = this.formRegistroUsuario.get('emailPersona').value;
    const direccionP = this.formRegistroUsuario.get('direccionPersona').value;
    const telefonoP = this.formRegistroUsuario.get('telefonoPersona').value;
    const userP = this.formRegistroUsuario.get('nombreUsuario').value;
    const passwordP = this.formRegistroUsuario.get('contraseniaUsuario').value;
    const rol = this.formRegistroUsuario.get('rol').value.name;
    let userCliente;
    let userProveedor;

    // * Validamos y verificamos rol seleccionado
    switch (rol) {
      case 'Cliente' :
        userCliente = {
          nombre: nombreP,
          apellido: apellidoP,
          email: email,
          telefono: telefonoP,
          direccion: direccionP,
          usuario: {
            nombreUsuario: userP,
            contraseniaUsuario: passwordP
          }
        }
        this.agregarUsuarioCliente(userCliente);
        break;

      case 'Proveedor':
        userProveedor = {
          nombre: nombreP,
          apellido: apellidoP,
          email: email,
          telefono: telefonoP,
          direccion: direccionP,
          anios_experiencia: this.aniosExp,
          usuario: {
            nombreUsuario: userP,
            contraseniaUsuario: passwordP
          },
          servicios: this.servicioPost
        }
        this.agregarUsuarioProveedor(userProveedor);
        break;
    }
  }

  addSingle(message: string, severity: string, summary: string) {
    this._messageService.add({severity: severity, summary: summary, detail: message});
  }

  // * Obtenemo los servicios
  obtenerServicios(): void {
    // * hacemos la peticion al servicio
    this._servios.obtenerServicios().then(res => {
      // @ts-ignore
      // * recorremos el res que nos deja la promesa
      res.forEach(elem => {
        // * Mandamos el objeto con los datos del servicio
        // @ts-ignore
        this.serviciosBD.push({id: elem.idServicio, name: elem.nombreServicio, descripcion: elem.descripcion_servicio});
      });
    }).catch(err => {
      this.addSingle(err.message, 'error', 'Error');
    })
  }

  // * Registras usuarios proveedor
  agregarUsuarioProveedor(data: any): void{
    let mensaje_back = '';
    let mensaje = '';
    this._usuarioCrudService.crearUsuarioProveedor(data)
      .then((res) => {
        this.addSingle(res.mensaje, 'success','Registro exitoso');
        this.registroExitoso = true;
        this._route.navigate(['/dashboard']);
      }).catch((err) => {
      console.log('ERR ',err);
      this.registroExitoso = false;
      if (err.error.mensaje != null){
        mensaje_back = err.error.mensaje;
        mensaje = mensaje_back;
      }else {
        mensaje = 'Error tipo: ' + err.name + ' Codigo: ' + err.status + ' debido a un error desconocido';
      }
      this.addSingle(mensaje, 'error','Erro al tratar registrar usuario');
    });
  }

  // * Registras usuarios clientes
  agregarUsuarioCliente(data: any): void{
    let mensaje_back = '';
    let mensaje = '';
    this._usuarioCrudService.crearUsuarioCliente(data)
      .then((res) => {
        this.addSingle(res.mensaje, 'success','Registro exitoso');
        this.registroExitoso = true;
        this._route.navigate(['/dashboard']);
      }).catch((err) => {
      this.registroExitoso = false;
      if (err.error.mensaje != null){
        mensaje_back = err.error.mensaje;
        mensaje = mensaje_back;
      }else {
        mensaje = 'Error tipo: ' + err.name + ' Codigo: ' + err.status + ' debido a un error desconocido';
      }
      // @ts-ignore
      this.addSingle(mensaje, 'error','Erro al tratar registrar usuario: ');
    });
  }

  observarRol(): void {
    this.validarFormLleno();
    if (this.formRegistroUsuario.get('rol').value.name === 'Proveedor') {
      this.verDialogoAddServi = true;
    } else {
      this.verDialogoAddServi = false;
    }
  }

  observarServicio(): void {
    if (this.formRegistroUsuario.get('servicio').value) {
      this.buttonDialogDisabled = false;
    } else {
      this.buttonDialogDisabled = true;
    }
  }

  observarAnioExp(): void {
    if (this.aniosExp < 1) {
      this.anioInsuficientes = true;
      this.buttonDialogDisabled = true;
    } else {
      this.anioInsuficientes = false;
      this.buttonDialogDisabled = false;
    }
  }

  cerrarDialogo(){
    this.verDialogoAddServi = false;
  }

  // * Guardamos los servicios agregados en el registro de un proveedor
  agregarServicio(): void {
    // * Primero obtenemos las variable necesarias
    const servicioSelect = this.formRegistroUsuario.get('servicio').value;
    // * Armamos un objeto con los datos recogidos
    const servicioTratado = {
      idServicio: servicioSelect.id,
      nombreServicio: servicioSelect.name,
      descripcion_servicio: servicioSelect.descripcion,
    }
    // @ts-ignore
    // * Mandamos al array que almacenara y mostrara los datos en la tabla
    this.serviciosAgregados.push(servicioTratado);
    this.servicioPost.push({
      // @ts-ignore
      idServicio: servicioSelect.id
    });
  }

  eliminarServicio(servi :any): void{
    console.log('HOLA HOLA')
    this._confirmationService.confirm({
      message: '¿Estas seguro que quieres quitar al servicio ' + servi.name + ' de la lista?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // @ts-ignore
        this.serviciosAgregados = this.serviciosAgregados.filter(val => val.idServicio !== servi.idServicio);
        this._messageService.add({severity:'success', summary: 'Servicio eliminado', detail: 'El servicio fue eliminado de la lista.', life: 3000});
      }
    });
  }

  validarFormLleno(): void {
    const nombreP = this.formRegistroUsuario.get('nombrePersona').value;
    const apellidoP = this.formRegistroUsuario.get('apellidoPersona').value;
    const email = this.formRegistroUsuario.get('emailPersona').value;
    const direccionP = this.formRegistroUsuario.get('direccionPersona').value;
    const telefonoP = this.formRegistroUsuario.get('telefonoPersona').value;
    const userP = this.formRegistroUsuario.get('nombreUsuario').value;
    const passwordP = this.formRegistroUsuario.get('contraseniaUsuario').value;
    const rol = this.formRegistroUsuario.get('rol').value.name;

    // * Valida primer formulario
    if (nombreP.length > 0 && apellidoP.length > 0 && direccionP.length > 0 && telefonoP.length > 0){
      this.buttonNextDisabled = false;
    }else {
      this.buttonNextDisabled = true;
    }

    //* Valida segundo formulario
    if (email.length > 0 && userP.length > 0 && passwordP.length > 0 && rol.length > 0){
      this.buttonRegisterDisabled = false;
    }else {
      this.buttonRegisterDisabled = true;
    }
  }

  validarServiciosSeleccion(): void{
    if (this.serviciosAgregados.length <=0){
      this.buttonRegisterDisabled = true;
    }else {
      this.buttonRegisterDisabled = false;
    }
  }

  siguienteForm(): void{
    this.buttonSiguiente = false;
    this.buttonAtras = true;
    this.verFormUsuario= true;
    this.verFormPersona= false;
    this.buttonResgister = true;
  }

  anteriorForm(): void{
    this.buttonSiguiente = true;
    this.buttonAtras = false;
    this.verFormUsuario= false;
    this.verFormPersona= true;
    this.buttonResgister = false;
  }
}
