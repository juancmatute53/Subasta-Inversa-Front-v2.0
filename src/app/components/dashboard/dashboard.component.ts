import {Component, OnInit} from '@angular/core';
import {ConfirmationService, ConfirmEventType, MessageService} from "primeng/api";
import {FormBuilder, Validators} from "@angular/forms";
import {ServiciosService} from "../services/servicios-crud/servicios.service";
import {TokenService} from "../services/token/token.service";
import {SubastaCrudService} from "../services/subasta/subasta-crud.service";
import {ClienteCrudService} from "../services/cliente/cliente-crud.service";
import {Subastas} from "../../models/subastas";
import {LoginUsuario} from "../../models/login-usuario";
import {ProveedorCrudService} from "../services/proveedor/proveedor-crud.service";
import {OfertaCrudService} from "../services/oferta/oferta-crud.service";
import {ServicioService} from "../services/serv-servicios/servicio.service";
import {of} from "rxjs";
import {error} from "@angular/compiler-cli/src/transformers/util";
import {Ofertas} from "../../models/ofertas";

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
  formNuevoServicio: any;
  formNuevaOferta: any;
  isValorOferta = true;
  displayModal = false;
  verDialogoNotificacion = false;
  verModalDetalle = false;
  rol: string ='';
  mostrarAnimacionCarga = false;
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

  posicionDialogOferta = 'right';
  mostrarDialogOferta = false;
  nombreUserLog: string = '';
  fechaActual: string = new Date().toLocaleDateString('es-es', {year:"numeric", month:"numeric" ,day:"numeric"});
  formData = new FormData();

  constructor(private _messageService: MessageService,
              private _formBuilder: FormBuilder,
              private _servios: ServiciosService,
              private _tokenService: TokenService,
              private _subastaCrudService: SubastaCrudService,
              private _clienteCrudService: ClienteCrudService,
              private _proveedroCrudService: ProveedorCrudService,
              private _ofertaCrudService: OfertaCrudService,
              private _servServicios: ServicioService,
              private confirmationService: ConfirmationService) {
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
    this.obtenerServicios();
    this.obtenerSubastas();
  }

  // * TODO ClIENTE
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
      let rest = this._subastaCrudService.eviarSubasta(this.formData);
      console.log(rest);
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
    });
  }

  obtenerOfertaProveedor(): void{
    this.ofertasAcomuladas.forEach(item =>{
      // @ts-ignore
      if (item.estado === true){
        this.listaOfertaGanadora.push(item);
        console.log('ES: ', this.listaOfertaGanadora);
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
        this.displayModal = false;
      }).catch(err =>{
        this.addSingle('Error al tratar de realizar oferta.', 'error', 'Error al ofertar');
        this.mostrarAnimacionCarga = false;
      })
    }).catch(err =>{
      console.log('ERR ', err)
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
    }).catch(err =>{
      this.addSingle(err.message, 'error', 'Error');
    })
  }

  obtenerDataProveedor(): void{
    this._proveedroCrudService.filtrarProveedor(this._tokenService.getUserName()).then(res =>{
      this.dataUsuario = res[0];
      // @ts-ignore
      this.nombreUserLog = this.dataUsuario.nombre+' '+this.dataUsuario.apellido;
    }).catch(err =>{
      this.addSingle(err.message, 'error', 'Error');
    })
    console.log(this.dataUsuario)
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
      console.log(err);
    });
  }

  // * TODO GENERALES
  observarPrecioOferta(): void{
    console.log('HOLA')
    if (this.formNuevaOferta.get('precioOferta').value === null){
      this.isValorOferta = true;
    }else {
      this.isValorOferta = false;
    }
  }

  observarSubastaSelected(subasta: any){
    this.subastaSelected = subasta;
    this.displayModal = true;
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
        //console.log(ofer)
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
    console.log(oferSubasta)
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
    if (this.verDialogoNotificacion === false){
      this.verDialogoNotificacion = true
    }else {
      this.verDialogoNotificacion = false;
    }
  }

  onFileSelected(event:any){
    const file:File = event.target.files[0];
    console.log('FILE ', file);
    this.formData.append("fichero", file);
  }
}
