import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ConfirmationService, ConfirmEventType, MessageService} from "primeng/api";
import {FormBuilder, Validators} from "@angular/forms";
import {ServiciosService} from "../services/servicios-crud/servicios.service";
import {TokenService} from "../services/token/token.service";
import {SubastaCrudService} from "../services/subasta/subasta-crud.service";
import {ClienteCrudService} from "../services/cliente/cliente-crud.service";
import {Subastas} from "../../models/subastas";
import {ProveedorCrudService} from "../services/proveedor/proveedor-crud.service";
import {OfertaCrudService} from "../services/oferta/oferta-crud.service";
import {ServicioService} from "../services/serv-servicios/servicio.service";
import {Ofertas} from "../../models/ofertas";
import {UsuarioCrudService} from "../services/users-crud/usuario-crud.service";


interface Servicio {
  name: string,
  descripcion: string
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  responsiveOptions: any;
  formNuevaSubasta: any;
  formEditarUsuario: any;
  formNuevoServicio: any;
  formNuevaOferta: any;
  isValorOferta = true;
  verContratarOferta = false;
  verNotifiCliente = false;
  verNotifiProveedor = false;
  verModalCalificacion = false;
  verDetaCalificacion = false;
  editarUser = true;
  rol: string ='';
  mostrarAnimacionCarga = false;
  anioInsuficientes: boolean = false;
  buttonDialogDisabled: boolean = true;
  verDialogoAddServi: boolean = false;

  serviciosBD: Servicio[] = [];
  // @ts-ignore
  subastasBD: Subastas[] = [];
  subastaSelected: Subastas[] = [];
  subastaEstado : Subastas[] =[];
  subastaEstadoFin : Subastas[] =[];
  ofertasAcomuladas: [] = [];
  ofertasPorSubasta: any[] = [];

  dataUsuario: [] = [];
  listarOfertaPro: []=[];
  listaOfertaGanadora: Ofertas[] = [];
  listaOfertaContratada: Ofertas[] = [];
  ofertaCalificada: Ofertas[] = [];

  serviciosAgregados: [] = [];
  servicioPost: [] = [];

  posicionDialogOferta = 'right';
  mostrarDialogOferta = false;
  nombreUserLog: string = '';
  fechaActual: string = new Date().toLocaleDateString('es-es', {year:"numeric", month:"numeric" ,day:"numeric"});
  formData = new FormData();
  estrellas: number = 2;
  aniosExp: number = 1;

  constructor(private _messageService: MessageService,
              private _formBuilder: FormBuilder,
              private _servios: ServiciosService,
              private _tokenService: TokenService,
              private _subastaCrudService: SubastaCrudService,
              private _clienteCrudService: ClienteCrudService,
              private _proveedroCrudService: ProveedorCrudService,
              private _ofertaCrudService: OfertaCrudService,
              private _servServicios: ServicioService,
              private confirmationService: ConfirmationService,
              private _confirmationService: ConfirmationService,
              private _usuarioCrudService: UsuarioCrudService) {
  }

  ngOnInit(): void {
    //Colocar if para validar rol usuario ROLE_CLIENTE ROLE_PROVEEDOR ROLE_ADMIN
    switch (this._tokenService.getAuthorities()[0]){
      case 'ROLE_CLIENTE':
        this.rol = 'cliente';
        this.obtenerDataCliente();
        this.obtenerSubastasEstado();
        this.responsiveOptions = [
          {
            breakpoint: '1024px',
            numVisible: 3,
            numScroll: 3
          },
          {
            breakpoint: '768px',
            numVisible: 2,
            numScroll: 2
          },
          {
            breakpoint: '560px',
            numVisible: 1,
            numScroll: 1
          }
        ];
        break;
      case 'ROLE_PROVEEDOR':
        this.rol = 'proveedor';
        this.obtenerDataProveedor();
        break;
      case 'ROLE_ADMIN':
        this.rol = 'admin';
        break;
    }

    this.crearFormServicio();
    this.obtenerOfertas();
    this.crearFormSubasta();
    this.crearFormOferta();
    this.crearFormEditUser();
    this.obtenerServicios();
    this.obtenerSubastas();
  }

  // * TODO ClIENTE
  crearFormEditUser(): void {
    this.formEditarUsuario = this._formBuilder.group({
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      direccion: ['', [Validators.required]],
      email: ['', [Validators.required]],
      telefono: ['', [Validators.required]],
      usuario: ['', [Validators.required]],
      contrasenia: ['', [Validators.required]],
      aniosExp: ['', [Validators.required]],
      servicio: ['', [Validators.required]]
    });
  }

  crearFormSubasta(): void {
    this.formNuevaSubasta = this._formBuilder.group({
      tituloSubasta: ['', [Validators.required]],
      descripcionSubasta: ['', [Validators.required]],
      fechaInicioSubasta: ['', [Validators.required]],
      fechaFinSubasta: ['', [Validators.required]],
      servioSolicitado: ['', [Validators.required]],
      horaCierreSubasta: ['', [Validators.required]],
      imagenSubasta: ['', []]
    });
  }

  //JUAN SERVICIOS POSTT
  crearFormServicio():void{
    this.formNuevoServicio = this._formBuilder.group({
      tituloServicio: ['',[Validators.required]],
      tituloDescripcion: ['', [Validators.required]]
    })
  }
  //SERVICIO DE CATEGORIAS-YO
  crearServicio(): void{
    const tituloServicio = this.formNuevoServicio.get('tituloServicio').value;
    const tituloDescripcion = this.formNuevoServicio.get('tituloDescripcion').value;

    const nuevoServicio = {
      nombreServicio: tituloServicio,
      descripcion_servicio: tituloDescripcion,

    }

    this._servServicios.crearServicio(nuevoServicio).then(res =>{
      this.addSingle('Servicio generado correctamente', 'success','Registro Servicio');
    })
  }


  crearSubasta(): void {
    const tituloSubasta = this.formNuevaSubasta.get('tituloSubasta').value;
    const descripcionSubasta = this.formNuevaSubasta.get('descripcionSubasta').value;
    const fechaInicioSubasta = this.formNuevaSubasta.get('fechaInicioSubasta').value;
    const fechaFinSubasta = this.formNuevaSubasta.get('fechaFinSubasta').value;
    const servioSolicitado = this.formNuevaSubasta.get('servioSolicitado').value;
    const horaCierreSubasta = this.formNuevaSubasta.get('horaCierreSubasta').value;
    const imagenSubasta = this.formNuevaSubasta.get('imagenSubasta').value;

    let cliente;
    this._clienteCrudService.filtrarCliente(this._tokenService.getUserName()).then(res => {
      cliente = res[0].id_persona;
      let nuevaSubasta = {
        tituloSubasta: tituloSubasta,
        horaCierreSubasta: horaCierreSubasta,
        fechaInicio: fechaInicioSubasta,
        fechaFin: fechaFinSubasta,
        estadoSubasta: 'Abierta',
        descripcionSubasta: descripcionSubasta,
        imgSubasta: imagenSubasta,
        cliente: {
          id_persona: cliente
        },
        servicio: {
          idServicio: servioSolicitado.id
        }
      }
      this.formData.append('subasta' ,JSON.stringify(nuevaSubasta));

      this._subastaCrudService.eviarSubasta(this.formData);
      // this._subastaCrudService.crearSubasta(this.formData).then(res => {
      //   this.addSingle('Subasta generada correctamente', 'success', 'Registro Subasta');
      // }).catch(err => {
      //   this.addSingle(err.message, 'error', 'Error');
      // })
    }).catch(err => {
      this.addSingle(err.message, 'error', 'Error');
    })
  }

  verOfertas(data : any): void{
    this.ofertasPorSubasta = [];
    this.mostrarDialogOferta = true;
    this.ofertasAcomuladas.forEach(item =>{
      // @ts-ignore
      if (item.subasta.idSubasta === data.idSubasta){
        this.ofertasPorSubasta.push(item);
      }
    });
  }

  // * TODO PROVEEDOR
  crearFormOferta(): void{
    this.formNuevaOferta = this._formBuilder.group({
      precioOferta: ['', [Validators.required]],
      comentarioCalificacion: ['', [Validators.required]],
    });
  }

  obtenerOfertaProveedor(): void{
    this.ofertasAcomuladas.forEach(item =>{
      // @ts-ignore
      if (item.estado === true && item.subasta.cliente.id_persona === this.dataUsuario.id_persona){
        this.listaOfertaContratada.push(item);
      }
      // @ts-ignore
      if (item.estado === true && item.proveedor.id_persona === this.dataUsuario.id_persona){
        this.listaOfertaGanadora.push(item);
      }
      // @ts-ignore
      if (item.proveedor.id_persona === this.dataUsuario.id_persona){
        this.listarOfertaPro.push(item);
      }
    })
  }

  ofertarSubasta(): void{
    this.mostrarAnimacionCarga = true;
    let proveedor;
    let oferta;
    this._proveedroCrudService.filtrarProveedor(this._tokenService.getUserName()).then(res =>{
      proveedor = res[0].id_persona;
      oferta = {
        percioOferta: this.formNuevaOferta.get('precioOferta').value,
        fecha: new Date(),
        comentario_calificacion_oferta: "",
        estado: false,
        calificacion: 0,
        proveedor: {
          id_persona: proveedor
        },
        subasta: {
          idSubasta: Object.values(this.subastaSelected)[0]
        }
      };
      this._ofertaCrudService.crearOferta(oferta).then(res =>{
        this.addSingle('Oferta realizada con exito.', 'success', 'Ofertar');
        this.mostrarAnimacionCarga = false;
        this.verContratarOferta = false;
      }).catch(err =>{
        this.addSingle('Error al tratar de realizar oferta.', 'error', 'Error al ofertar');
        this.mostrarAnimacionCarga = false;
      })
    }).catch(err =>{
      this.addSingle(err.message, 'error', 'Error');
    });
  }

  // * TODO OBTENER DATA BACK
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
    });
  }

  obtenerSubastas(): void {
    this._subastaCrudService.obtenerSubasta().then(res => {
      this.subastasBD = res;
    }).catch(err => {
      this.addSingle(err.message, 'error', 'Error');
    });
  }

  obtenerDataCliente(): void{
    this._clienteCrudService.filtrarCliente(this._tokenService.getUserName()).then(res =>{
      this.dataUsuario = res[0];
      // @ts-ignore
      this.nombreUserLog = this.dataUsuario.nombre+' '+this.dataUsuario.apellido;

      //aniosExp
    }).catch(err =>{
      this.addSingle(err.message, 'error', 'Error');
    })
  }

  obtenerDataProveedor(): void{
    this._proveedroCrudService.filtrarProveedor(this._tokenService.getUserName()).then(res =>{
      this.dataUsuario = res[0];
      // @ts-ignore
      this.nombreUserLog = this.dataUsuario.nombre+' '+this.dataUsuario.apellido;
      // @ts-ignore
      this.formEditarUsuario.get('nombre').setValue(this.dataUsuario.nombre)
      // @ts-ignore
      this.formEditarUsuario.get('apellido').setValue(this.dataUsuario.apellido)
      // @ts-ignore
      this.formEditarUsuario.get('direccion').setValue(this.dataUsuario.direccion)
      // @ts-ignore
      this.formEditarUsuario.get('email').setValue(this.dataUsuario.email)
      // @ts-ignore
      this.formEditarUsuario.get('telefono').setValue(this.dataUsuario.telefono)
      // @ts-ignore
      this.formEditarUsuario.get('aniosExp').setValue(this.dataUsuario.anios_experiencia)
      // @ts-ignore
      this.serviciosAgregados = this.dataUsuario.servicios;
      this.serviciosAgregados.forEach(item =>{
        // @ts-ignore
        this.servicioPost.push({
          // @ts-ignore
          idServicio: item.idServicio
        });
      })
    }).catch(err =>{
      this.addSingle(err.message, 'error', 'Error');
    })
  }

  obtenerSubastasEstado(): void{
    this._subastaCrudService.filtrarSubasta('Abierta').then(res =>{
      // @ts-ignore
      res.forEach(subasta =>{
        // @ts-ignore
        if (subasta.cliente.id_persona === this.dataUsuario.id_persona){
          this.subastaEstado.push(subasta);
        }
      })
    }).catch(err =>{
      this.addSingle(err.message, 'error', 'Error');
    })

    this._subastaCrudService.filtrarSubasta('Cerrada').then(res =>{
      // @ts-ignore
      res.forEach(subasta =>{
        // @ts-ignore
        if (subasta.cliente.id_persona === this.dataUsuario.id_persona){
          this.subastaEstadoFin.push(subasta);
        }
      })
    }).catch(err =>{
      this.addSingle(err.message, 'error', 'Error');
    })

  }

  obtenerOfertas(): void{
    this._ofertaCrudService.obtenerOferta().then(res =>{
      // @ts-ignore
      res.forEach(oferta =>{
        // @ts-ignore
        this.ofertasAcomuladas.push(oferta);
      })
      this.obtenerOfertaProveedor ();
    }).catch(err =>{
      this.addSingle(err.message, 'error', 'Error');
    });
  }

  // * TODO GENERALES
  observarPrecioOferta(): void{
    if (this.formNuevaOferta.get('precioOferta').value === null){
      this.isValorOferta = true;
    }else {
      this.isValorOferta = false;
    }
  }

  observarSubastaSelected(subasta: any){
    this.subastaSelected = subasta;
    this.verContratarOferta = true;
  }

  addSingle(message: string, severity: string, summary: string) {
    this._messageService.add({severity: severity, summary: summary, detail: message});
  }

  cerrarSesion(): void {
    this._tokenService.logOut();
    window.location.reload();
  }

  cerrarDialogoOferta(): void{
    this.formNuevaOferta.get('precioOferta').setValue(' ');
  }

  confirm(ofer: any) {
    // @ts-ignore
    this.confirmationService.confirm({
      message: '¿Estas seguro de escocger a '+ofer.proveedor.nombre+' '+ofer.proveedor.apellido+' ?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.actualizarEstadoSubasta(ofer)
        const oferta = {
          percioOferta: ofer.percioOferta,
          fecha: ofer.fecha,
          comentario_calificacion_oferta: "",
          estado: true,
          calificacion: 0,
          proveedor: {
            id_persona: ofer.proveedor.id_persona
          },
          subasta: {
            idSubasta: ofer.subasta.idSubasta
          }
        };

        this._ofertaCrudService.editarOferta(oferta, ofer.idOferta).then(res =>{
          this.addSingle(
            'Tu subasta ha finalizado, puedes comunicarte con '+ofer.proveedor.nombre + ' ' + ofer.proveedor.apellido,
            'success', 'Ofertar');
          location.reload();
        }).catch(err =>{
          this.addSingle('No se ha podido efectuar la seleccion del ganador.', 'error', 'Error al ofertar');
        })
      },
      reject: (type: any) => {
        switch(type) {
          case ConfirmEventType.REJECT:
            //this._messageService.add({severity:'error', summary:'Rejected', detail:'You have rejected'});
            break;
          case ConfirmEventType.CANCEL:
            //this._messageService.add({severity:'warn', summary:'Cancelled', detail:'You have cancelled'});
            break;
        }
      }
    });

  }

  actualizarEstadoSubasta(oferSubasta: any) :void{
    const subastaActualizada = {
      tituloSubasta: oferSubasta.subasta.tituloSubasta,
      horaCierreSubasta: oferSubasta.subasta.horaCierreSubasta,
      fechaInicio: oferSubasta.subasta.fechaInicio,
      fechaFin: oferSubasta.subasta.fechaFin,
      estadoSubasta: 'Cerrada',
      descripcionSubasta: oferSubasta.subasta.descripcionSubasta,
      imgSubasta: oferSubasta.subasta.imgSubasta,
      cliente: {
        id_persona: oferSubasta.subasta.cliente.id_persona
      },
      servicio: {
        idServicio: oferSubasta.subasta.servicio.idServicio
      }
    }
    //
    this._subastaCrudService.editarSubasta(subastaActualizada, oferSubasta.subasta.idSubasta).then(res => {
      this.addSingle('Subasta finalizada', 'success', 'Finalizacion');
    }).catch(err => {
      this.addSingle(err.message, 'error', 'Error');
    })
  }

  verNotificaciones(): void{

    switch (this.rol){
      case 'cliente':
        if (this.verNotifiCliente === false){
          this.verNotifiCliente = true
        }else {
          this.verNotifiCliente = false;
        }
        break;
      case 'proveedor':
        if (this.verNotifiProveedor === false){
          this.verNotifiProveedor = true
        }else {
          this.verNotifiProveedor = false;
        }
        break;
    }


  }

  onFileSelected(event:any){
    const file:File = event.target.files[0];
    this.formData.append("fichero", file);
  }

  calificarOferta(ofer: any): void{

    const oferta = {
      percioOferta: ofer.percioOferta,
      fecha: ofer.fecha,
      comentario_calificacion_oferta: this.formNuevaOferta.get('comentarioCalificacion').value,
      estado: true,
      calificacion: this.estrellas,
      proveedor: {
        id_persona: ofer.proveedor.id_persona
      },
      subasta: {
        idSubasta: ofer.subasta.idSubasta
      }
    };

    this._ofertaCrudService.editarOferta(oferta, ofer.idOferta).then(res =>{
      this.addSingle(
        'Calificacion a '+ofer.proveedor.nombre + ' ' + ofer.proveedor.apellido + ' exitosa',
        'success', 'Calificacion');
    }).catch(err =>{
      this.addSingle('No se ha podido enviar tu calificación', 'error', 'Error al calificar');
    })

    this.verModalCalificacion=false
  }

  modalDetalleCalificacion(oferta: Ofertas): void{
    this.ofertaCalificada = [];
    // @ts-ignore
    this.ofertaCalificada.push(oferta);
    this.verDetaCalificacion = true;
  }

  editarUsuario(): void{
    if (this.editarUser === true){
      this.editarUser = false;
    }else {
      this.editarUser = true;
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

  observarServicio(): void {
    if (this.formEditarUsuario.get('servicio').value) {
      this.buttonDialogDisabled = false;
    } else {
      this.buttonDialogDisabled = true;
    }
  }

  agregarServicio(): void {
    // * Primero obtenemos las variable necesarias
    const servicioSelect = this.formEditarUsuario.get('servicio').value;
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

  cerrarDialogo(){
    this.verDialogoAddServi = false;
  }


  datosForm(){
    const nombreP = this.formEditarUsuario.get('nombre').value;
    const apellidoP = this.formEditarUsuario.get('apellido').value;
    const email = this.formEditarUsuario.get('email').value;
    const direccionP = this.formEditarUsuario.get('direccion').value;
    const telefonoP = this.formEditarUsuario.get('telefono').value;
    const aniosExp = this.formEditarUsuario.get('aniosExp').value;

    let userCliente;
    let userProveedor;

    // * Validamos y verificamos rol seleccionado
    switch (this.rol) {
      case 'cliente' :
        userCliente = {
          nombre: nombreP,
          apellido: apellidoP,
          email: email,
          telefono: telefonoP,
          direccion: direccionP
        }
        this.agregarUsuarioCliente(userCliente);
        break;

      case 'proveedor':
        userProveedor = {
          nombre: nombreP,
          apellido: apellidoP,
          email: email,
          telefono: telefonoP,
          direccion: direccionP,
          anios_experiencia: aniosExp,
          servicios: this.servicioPost
        }
        this.agregarUsuarioProveedor(userProveedor);
        break;
    }
  }

  // * Registras usuarios proveedor
  agregarUsuarioProveedor(data: any): void{
    let mensaje_back = '';
    let mensaje = '';
    // @ts-ignore
    this._usuarioCrudService.editarUsuarioProveedor(data, this.dataUsuario.id_persona)
      .then((res) => {
        this.addSingle(res.mensaje, 'success','Edicion exitosa');
      }).catch((err) => {
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
    // @ts-ignore
    this._usuarioCrudService.editarUsuarioCliente(data, this.dataUsuario.id_persona)
      .then((res) => {
        this.addSingle(res.mensaje, 'success','Edicion exitosa');
      }).catch((err) => {
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

}
