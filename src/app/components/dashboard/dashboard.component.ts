import {Component, OnInit} from '@angular/core';
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
import {SeleccionDeGanadorService} from "../services/auto-seleccion/seleccion-de-ganador.service";

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
  // Variables para opciones responsivas
  responsiveOptions: any;

// Variables para formularios
  formNuevaSubasta: any;
  formEditarUsuario: any;
  formNuevoServicio: any;
  formNuevaOferta: any;

// Variables de estado
  isValorOferta = true;
  verContratarOferta = false;
  verNotifiCliente = false;
  verNotifiProveedor = false;
  verModalCalificacion = false;
  verDetaCalificacion = false;
  editarUser = true;
  rol = '';
  mostrarAnimacionCarga = false;
  anioInsuficientes = false;
  buttonDialogDisabled = true;
  verDialogoAddServi = false;

// Variables de datos
  serviciosBD: Servicio[] = [];
  subastasBD: Subastas[] = [];
  subastasUser: Subastas[] = [];
  subastaSelected: Subastas[] = [];
  subastaEstado: Subastas[] = [];
  subastaEstadoFin: Subastas[] = [];
  ofertasAcomuladas: Ofertas[] = [];
  ofertasPorSubasta: any[] = [];
  dataUsuario: [] = [];
  listarOfertaPro: Ofertas[] = [];
  listaOfertaGanadora: Ofertas[] = [];
  listaOfertaContratada: Ofertas[] = [];
  ofertaCalificada: Ofertas[] = [];
  serviciosAgregados: [] = [];
  servicioPost: [] = [];

// Variables de configuración de diálogos y otras opciones
  posicionDialogOferta = 'right';
  mostrarDialogOferta = false;
  nombreUserLog = '';
  mensajeUser = '';
  textBienvenida = '';
  fechaActual = new Date().toLocaleDateString('es-es', { year: "numeric", month: "numeric", day: "numeric" });
  formData = new FormData();
  estrellas = 2;
  aniosExp = 1;

  // Variables para mensajes de compartamiento del sistema
  msjSubVaciaCli = '¡Pero no te preocupes! En cuanto tengamos subastas listas te las mostraremos.'
  msjSubVaciaProv = '¡Pero no te preocupes! Pronto tendremos nuevas oportunidades para ti. ¡Mantente atento!'

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
              private _usuarioCrudService: UsuarioCrudService,
              private _seleccionService: SeleccionDeGanadorService) {
  }
  ngOnInit(): void {

    // En el método ngOnInit se obtiene el rol del usuario que ha iniciado sesión a través del servicio _tokenService.
    switch (this._tokenService.getAuthorities()[0]) {
      // Si el rol es 'ROLE_CLIENTE', se realizan las siguientes acciones:
      case 'ROLE_CLIENTE':

        // Se asigna el valor 'cliente' a la variable 'rol' para que se pueda utilizar más adelante.
        this.rol = 'cliente';

        // Se llama al método obtenerDataCliente() para obtener la información del usuario cliente actual.
        this.obtenerDataCliente();

        // Se llama al método obtenerSubastasEstado() para obtener todas las subastas en las que el usuario puede participar.
        this.obtenerSubastasEstado();

        // Se establecen las opciones de visualización para un componente llamado 'responsiveOptions'. Este componente muestra subastas en una galería.
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

      // Si el rol es 'ROLE_PROVEEDOR', se realizan las siguientes acciones:
      case 'ROLE_PROVEEDOR':

        // Se asigna el valor 'proveedor' a la variable 'rol' para que se pueda utilizar más adelante.
        this.rol = 'proveedor';

        // Se llama al método obtenerDataProveedor() para obtener la información del usuario proveedor actual.
        this.obtenerDataProveedor();
        break;

      // Si el rol es 'ROLE_ADMIN', se realizan las siguientes acciones:
      case 'ROLE_ADMIN':
        // Se asigna el valor 'admin' a la variable 'rol' para que se pueda utilizar más adelante.
        this.mensajeUser = '¡Bienvenido administrador y gracias por ayudarnos a brindar un servicio de calidad a nuestros usuarios!'
        this.textBienvenida = 'En el panel de administración de NextSharp, donde podrás personalizar y optimizar el sistema de subastas inversas para tus necesidades específicas.'
        this.rol = 'admin';
        break;
    }

    // Se llaman varios métodos para inicializar diferentes formularios y obtener información adicional necesaria para la vista.
    this.crearFormServicio(); // Crea un formulario para crear un nuevo servicio.
    this.obtenerOfertas(); // Obtiene todas las ofertas que se han realizado en las subastas.
    this.crearFormSubasta(); // Crea un formulario para crear una nueva subasta.
    this.crearFormOferta(); // Crea un formulario para realizar una oferta en una subasta.
    this.crearFormEditUser(); // Crea un formulario para editar la información del usuario actual.
    this.obtenerServicios(); // Obtiene todos los servicios que existen actualmente.
    this.obtenerSubastas(); // Obtiene todas las subastas que existen actualmente.
  }

  // * TODO TODAS LA FUNCIONES PARA ClIENTE

  // Este método crea un formulario para que el usuario cliente pueda editar su información personal.
  crearFormEditUser(): void {
    // Se utiliza el servicio _formBuilder para construir el formulario.
    this.formEditarUsuario = this._formBuilder.group({
      // Se crean los diferentes campos que se van a utilizar en el formulario, cada uno con sus respectivos validadores.
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
  // Este método crea un formulario para que el usuario pueda crear una nueva subasta.
  crearFormSubasta(): void {
    // Se utiliza el servicio _formBuilder para construir el formulario.
    this.formNuevaSubasta = this._formBuilder.group({
      // Se crean los diferentes campos que se van a utilizar en el formulario, cada uno con sus respectivos validadores.
      tituloSubasta: ['', [Validators.required]],
      descripcionSubasta: ['', [Validators.required]],
      fechaInicioSubasta: ['', [Validators.required]],
      fechaFinSubasta: ['', [Validators.required]],
      servioSolicitado: ['', [Validators.required]],
      horaCierreSubasta: ['', [Validators.required]],
      imagenSubasta: ['', []]
    });
  }
  // Este método crea un formulario para que el usuario pueda agregar un nuevo servicio.
  crearFormServicio():void{
    // Se utiliza el servicio _formBuilder para construir el formulario.
    this.formNuevoServicio = this._formBuilder.group({
      // Se crean los diferentes campos que se van a utilizar en el formulario, cada uno con sus respectivos validadores.
      tituloServicio: ['',[Validators.required]],
      tituloDescripcion: ['', [Validators.required]]
    })
  }

// Este método crea un nuevo servicio y lo agrega al sistema.
  crearServicio(): void{
    // Se obtienen los valores del formulario.
    const tituloServicio = this.formNuevoServicio.get('tituloServicio').value;
    const tituloDescripcion = this.formNuevoServicio.get('tituloDescripcion').value;

    // Se crea un objeto con los valores obtenidos.
    const nuevoServicio = {
      nombreServicio: tituloServicio,
      descripcion_servicio: tituloDescripcion,
    }

    // Se llama al servicio _servServicios para agregar el nuevo servicio.
    this._servServicios.crearServicio(nuevoServicio).then(res =>{
      // Se muestra un mensaje de éxito al usuario.
      this.addSingle('Servicio generado correctamente', 'success','Registro Servicio');
    })
  }
  // Función para crear una nueva subasta
  crearSubasta(): void {
    // Obtener los valores de los campos del formulario
    const tituloSubasta = this.formNuevaSubasta.get('tituloSubasta').value;
    const descripcionSubasta = this.formNuevaSubasta.get('descripcionSubasta').value;
    const fechaInicioSubasta = this.formNuevaSubasta.get('fechaInicioSubasta').value;
    const fechaFinSubasta = this.formNuevaSubasta.get('fechaFinSubasta').value;
    const servioSolicitado = this.formNuevaSubasta.get('servioSolicitado').value;
    const horaCierreSubasta = this.formNuevaSubasta.get('horaCierreSubasta').value;
    const imagenSubasta = this.formNuevaSubasta.get('imagenSubasta').value;

    let cliente;

    // Buscar el id del cliente que está creando la subasta
    this._clienteCrudService.filtrarCliente(this._tokenService.getUserName()).then(res => {
      cliente = res[0].id_persona;

      // Crear el objeto de nueva subasta
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

      // Agregar la nueva subasta al objeto formData
      this.formData.append('subasta' ,JSON.stringify(nuevaSubasta));

      // Enviar la nueva subasta al servidor
      this._subastaCrudService.eviarSubasta(this.formData);
    }).catch(err => {
      // En caso de error, mostrar un mensaje de error
      this.addSingle(err.message, 'error', 'Error');
    })
  }
  // Función para mostrar las ofertas de una subasta específica
  verOfertas(data: any): void {
    // Se inicializa el arreglo de ofertas por subasta y se muestra el diálogo de ofertas
    this.ofertasPorSubasta = [];
    this.mostrarDialogOferta = true;

    // Se itera sobre todas las ofertas acumuladas en el componente
    this.ofertasAcomuladas.forEach(item => {
      // Se verifica si la oferta actual pertenece a la subasta específica proporcionada como argumento
      if (item.subasta && item.subasta.idSubasta === data.idSubasta) {
        // Si la oferta pertenece a la subasta, se agrega al arreglo de ofertas por subasta
        this.ofertasPorSubasta.push(item);
      }
    });
  }

  // * TODO TODAS LAS FUNCIONES PARA PROVEEDOR

// Función para crear un nuevo formulario de oferta con dos campos requeridos
  crearFormOferta(): void{
    this.formNuevaOferta = this._formBuilder.group({
      precioOferta: ['', [
        Validators.required,
        Validators.pattern(/^\d*\.?\d+$/), // Solo números enteros o decimales con punto o coma decimal
        Validators.min(0.01), // Valor mínimo permitido
        Validators.max(99999) // Valor máximo permitido
      ]],
      comentarioCalificacion: ['', [Validators.required]]
    });
  }

// Función para obtener las ofertas de un proveedor
  obtenerOfertaProveedor(): void{
    // Iterar a través de cada elemento de la lista de ofertas acumuladas
    this.ofertasAcomuladas.forEach(item =>{

      // Si la oferta está activa y fue hecha por el cliente del proveedor actual, agregarla a la lista de ofertas contratadas
      // @ts-ignore
      if (item.estado === true && item.subasta.cliente.id_persona === this.dataUsuario.id_persona){
        this.listaOfertaContratada.push(item);
      }

      // Si la oferta está activa y fue hecha por el proveedor actual, agregarla a la lista de ofertas ganadoras
      // @ts-ignore
      if (item.estado === true && item.proveedor.id_persona === this.dataUsuario.id_persona){
        this.listaOfertaGanadora.push(item);
      }

      // Si la oferta fue hecha por el proveedor actual, agregarla a la lista de ofertas del proveedor
      // @ts-ignore
      if (item.proveedor.id_persona === this.dataUsuario.id_persona){
        this.listarOfertaPro.push(item);
      }
    })
  }
  // Función para ofertar en una subasta
  ofertarSubasta(): void{
    // Activar animación de carga
    this.mostrarAnimacionCarga = true;

    let proveedor;
    let oferta;

    // Obtener información del proveedor actual
    this._proveedroCrudService.filtrarProveedor(this._tokenService.getUserName()).then(res =>{
      proveedor = res[0].id_persona;

      // Crear objeto de oferta con los datos ingresados en el formulario
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

      // Guardar la oferta en la base de datos
      this._ofertaCrudService.crearOferta(oferta).then(res =>{
        // Mostrar mensaje de éxito y desactivar animación de carga
        this.addSingle('Oferta realizada con exito.', 'success', 'Ofertar');
        this.mostrarAnimacionCarga = false;
        this.verContratarOferta = false;
      }).catch(err =>{
        // Mostrar mensaje de error y desactivar animación de carga
        this.addSingle('Error al tratar de realizar oferta.', 'error', 'Error al ofertar');
        this.mostrarAnimacionCarga = false;
      })
    }).catch(err =>{
      // Mostrar mensaje de error
      this.addSingle(err.message, 'error', 'Error');
    });
  }

  // TODO PARA OBTENER DATA DEL BACK
  // Obtenemo los servicios
  obtenerServicios(): void {
    // Hacemos la peticion al servicio
    this._servios.obtenerServicios().then(res => {
      // @ts-ignore
      //  Recorremos el res que nos deja la promesa
      res.forEach(elem => {
        // Mandamos el objeto con los datos del servicio
        // @ts-ignore
        this.serviciosBD.push({id: elem.idServicio, name: elem.nombreServicio, descripcion: elem.descripcion_servicio});
      });
    }).catch(err => {
      this.addSingle(err.message, 'error', 'Error');
    });
  }

  // Se define la función obtenerSubastas que se encarga de obtener una lista de subastas y filtrarlas
  // según el usuario que esté logueado en la aplicación
  obtenerSubastas(): void {
    const subastasOfertada: Ofertas[] = []; // Se define un array vacío para almacenar subastas ofertadas

    // Se llama al método obtenerSubasta del servicio subastaCrudService
    this._subastaCrudService.obtenerSubasta().then(res => {

      // Se filtran las ofertas acumuladas según el proveedor logueado
      this.ofertasAcomuladas.forEach(oferta =>{
        // @ts-ignore
        if (oferta.proveedor.id_persona === this.dataUsuario.id_persona){
          subastasOfertada.push(oferta); // Se agrega la oferta al array de subastas ofertadas
        }
      })

      // Se recorre la lista de subastas obtenida y se filtran según el usuario logueado
      // @ts-ignore
      res.forEach(item =>{
        // Se filtran las subastas según el usuario que está logueado en la aplicación
        // * Esto se hace solo para el cliente
        // @ts-ignore
        if (item.cliente.id_persona === this.dataUsuario.id_persona && item.estadoSubasta != 'Cerrada'){
          this.subastasUser.push(item) // Se agrega la subasta a la lista de subastas del usuario
          this.rol == 'cliente' && (this.iniciaIntervalo(), setTimeout(this.deternerIntervalo, 15000)); // Si el usuario logueado es un cliente, se inicia un intervalo de tiempo para actualizar la información de la subasta cada 15 segundos.
        }else {
          // * Esto se hace para el cliente y el proveedor
          if (item.estadoSubasta != 'Cerrada' && this.rol != 'proveedor'){
            this.subastasBD.push(item); // Si el usuario logueado no es un proveedor, se agrega la subasta a la lista de subastas
          }
          if (item.estadoSubasta != 'Cerrada' && this.rol === 'proveedor'){
            this.subastasBD.push(item); // Si el usuario logueado es un proveedor, se agrega la subasta a la lista de subastas
          }
        }
      })

      // Si el usuario logueado es un proveedor, se eliminan las subastas en las que no haya pujado
      if (this.rol === 'proveedor'){
        // @ts-ignore
        // @ts-ignore
        this._subastaCrudService.obtenerSubastaNoPuja(this.dataUsuario.id_persona).then(res =>{
          // @ts-ignore
          res.forEach(item =>{
            this.subastasBD = this.subastasBD.filter(value => value.idSubasta != item.idSubasta) // Se eliminan las subastas en las que no haya pujado el proveedor logueado
          })
        }).catch(err =>{
        })
      }
    }).catch(err => {
      this.addSingle(err.message, 'error', 'Error'); // Se agrega una notificación de error en caso de que falle la obtención de las subastas
    });
  }

  // Esta función llamada 'obtenerDataCliente' no recibe argumentos y no devuelve nada
  obtenerDataCliente(): void{
    // Se llama al método 'filtrarCliente' del servicio '_clienteCrudService' pasándole como argumento el nombre de usuario
    // del token actual obtenido mediante el servicio '_tokenService'
    this._clienteCrudService.filtrarCliente(this._tokenService.getUserName()).then(res =>{
      // Si el método anterior se ejecuta con éxito, se asigna el primer elemento del resultado a la variable 'dataUsuario'
      this.dataUsuario = res[0];
      // Se utiliza la anotación '@ts-ignore' para ignorar cualquier posible error que pueda producirse al acceder a las
      // propiedades 'nombre' y 'apellido' de 'dataUsuario', y se asigna un valor a la variable 'nombreUserLog'
      // concatenando las propiedades 'nombre' y 'apellido' de 'dataUsuario'
      // @ts-ignore
      this.nombreUserLog = this.dataUsuario.nombre+' '+this.dataUsuario.apellido;
      this.llenarFromDataGeneral();

      // Se establece el mensaje y texto de bienvenida solo para el rol de cliente
      this.mensajeUser = `¡Bienvenido, ${this.nombreUserLog} a NextSharp, donde conseguir los mejores precios es nuestra misión!`;
      this.textBienvenida =
        'Estamos encantados de que hayas decidido utilizar nuestra plataforma para conseguir los mejores precios. ' +
        'Con NextSharp, podrás acceder a una amplia selección de proveedores que competirán entre sí para ofrecerte los precios más bajos. ' +
        'Además, nuestra plataforma es fácil de usar y te permite hacer ofertas de manera rápida y sencilla.';

    }).catch(err =>{
      // Si se produce algún error durante el proceso de filtrado del cliente, se llama a la función 'addSingle' con tres
      // argumentos: un mensaje de error, una cadena que indica el tipo de mensaje y otra cadena que representa el título del mensaje
      this.addSingle(err.message, 'error', 'Error');
    })
  }

  // Esta función llamada 'obtenerDataProveedor' no recibe argumentos y no devuelve nada
  obtenerDataProveedor(): void{
    // Se llama al método 'filtrarProveedor' del servicio '_proveedroCrudService' pasándole como argumento el nombre de usuario
    // del token actual obtenido mediante el servicio '_tokenService'
    this._proveedroCrudService.filtrarProveedor(this._tokenService.getUserName()).then(res =>{
      // Si el método anterior se ejecuta con éxito, se asigna el primer elemento del resultado a la variable 'dataUsuario'
      this.dataUsuario = res[0];
      // Se asigna un valor a la variable 'nombreUserLog' concatenando las propiedades 'nombre' y 'apellido' de 'dataUsuario'
      // También se establecen valores en diferentes campos de un formulario llamado 'formEditarUsuario'
      // Además, se asigna un array a la variable 'serviciosAgregados' y se itera sobre sus elementos para agregarlos al array 'servicioPost'
      // Cabe destacar que se utilizan las anotaciones '@ts-ignore' para ignorar posibles errores en el código
      this.llenarFromDataGeneral();
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
      // Se establece el mensaje y texto de bienvenida unico para el proveedor
      this.mensajeUser = `¡Bienvenido a NextSharp, ${this.nombreUserLog} el sistema de subastas inversas que te ayuda a llegar a más clientes y aumentar tus ganacias!`;
      this.textBienvenida =
        'Como proveedor de servicios, tienes la oportunidad de participar en subastas inversas y competir con otros proveedores para ofrecer los mejores precios y servicios a los compradores. ' +
        'En NextSharp, valoramos tu experiencia y tus habilidades únicas.' +
        ' Nuestra plataforma te permite acceder a nuevas oportunidades de negocio, aumentar tu visibilidad en el mercado y crecer como proveedor de servicios. '
    }).catch(err =>{
      // Si se produce algún error durante el proceso de filtrado del proveedor, se llama a la función 'addSingle'
      // con tres argumentos: un mensaje de error, una cadena que indica el tipo de mensaje y otra cadena
      // que representa el título del mensaje
      this.addSingle(err.message, 'error', 'Error');
    })
  }
  obtenerSubastasEstado(): void{
    // Obtener subastas abiertas y filtrar las del cliente actual
    this._subastaCrudService.filtrarSubasta('Abierta').then(res =>{
      // Recorrer cada subasta
      // @ts-ignore
      res.forEach(subasta =>{
        // Si la subasta pertenece al cliente actual
        // @ts-ignore
        if (subasta.cliente.id_persona === this.dataUsuario.id_persona){
          // Agregar la subasta a subastaEstado
          this.subastaEstado.push(subasta);
        }
      })
    }).catch(err =>{
      // Si hay un error, mostrar mensaje de error
      this.addSingle(err.message, 'error', 'Error');
    })

    // Obtener subastas cerradas y filtrar las del cliente actual
    this._subastaCrudService.filtrarSubasta('Cerrada').then(res =>{
      // Recorrer cada subasta
      // @ts-ignore
      res.forEach(subasta =>{
        // Si la subasta pertenece al cliente actual
        // @ts-ignore
        if (subasta.cliente.id_persona === this.dataUsuario.id_persona){
          // Agregar la subasta a subastaEstadoFin
          this.subastaEstadoFin.push(subasta);
        }
      })
    }).catch(err =>{
      // Si hay un error, mostrar mensaje de error
      this.addSingle(err.message, 'error', 'Error');
    })
  }
  obtenerOfertas(): void {
    // Se llama al servicio para obtener las ofertas
    this._ofertaCrudService.obtenerOferta().then(res => {
      // Si la promesa se resuelve correctamente, se itera sobre cada oferta y se agrega al array de ofertas acumuladas
      // @ts-ignore: se ignora el chequeo de tipos de TypeScript en esta línea, ya que se sabe que la respuesta no coincide
      // exactamente con el tipo de la variable
      res.forEach(oferta => {
        // @ts-ignore: se ignora el chequeo de tipos de TypeScript en esta línea, ya que se sabe que la respuesta no
        // coincide exactamente con el tipo de la variable
        this.ofertasAcomuladas.push(oferta);
      });
      // Después de agregar las ofertas acumuladas, se llama a la función para obtener las ofertas de proveedores
      this.obtenerOfertaProveedor();
    }).catch(err => {
      // Si la promesa es rechazada, se maneja el error mediante la función addSingle, que agrega un mensaje de error
      this.addSingle(err.message, 'error', 'Error');
    });
  }

  llenarFromDataGeneral(){
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
  }

  // * TODO GENERALES
  observarPrecioOferta(): void {
    // Esta función observa el valor del campo 'precioOferta' en el formulario de nueva oferta.
    // Si este campo está vacío (valor nulo), entonces se establece la propiedad 'isValorOferta' en true,
    // lo que indica que el valor de la oferta no se ha especificado.
    // De lo contrario, se establece 'isValorOferta' en false, indicando que el valor de la oferta ha sido especificado.
    if (this.formNuevaOferta.get('precioOferta').value === null) {
      this.isValorOferta = true;
    } else {
      this.isValorOferta = false;
    }
  }
  observarSubastaSelected(subasta: any) {
    // Esta función se llama cuando el usuario selecciona una subasta en la interfaz.
    // Toma la subasta seleccionada como argumento y la establece como 'subastaSelected'.
    // Luego, muestra el botón para contratar oferta estableciendo la propiedad 'verContratarOferta' en true.
    this.subastaSelected = subasta;
    this.verContratarOferta = true;
  }

  cerrarSesion(): void {
    // Esta función se llama cuando el usuario desea cerrar sesión.
    // Llama al servicio de tokens para cerrar la sesión del usuario y luego recarga la página.
    this._tokenService.logOut();
    window.location.reload();
  }

  addSingle(message: string, severity: string, summary: string) {
    // Esta función se llama cuando se necesita agregar un mensaje de alerta, éxito o error en la interfaz.
    // Toma el mensaje, la gravedad y el resumen como argumentos y los agrega al servicio de mensajes,
    // que se encarga de mostrarlos en la interfaz.
    this._messageService.add({severity: severity, summary: summary, detail: message});
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
        // @ts-ignore
        this.servicioPost = this.servicioPost.filter(val => val.idServicio !== servi.idServicio);
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
        this.actualizarUsuarioCliente(userCliente);
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
        this.actualizarUsuarioProveedor(userProveedor);
        break;
    }
  }

  // * Registras usuarios proveedor
  actualizarUsuarioProveedor(data: any): void{
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
  actualizarUsuarioCliente(data: any): void{
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

  procesoSeleccion(): void {
    console.log('A')
    if (Array.isArray(this.subastasUser) && this.subastasUser !== undefined) {
      console.log('B')
      this.subastasUser.forEach(subasta => {
        const fechaActual = new Date();
        let horaActual = fechaActual.getHours().toString().padStart(2, '0') + ':' + fechaActual.getMinutes().toString().padStart(2, '0');
        // Convertir 00:00 a 12:00 AM para la hora actual y la hora de cierre de la subasta
        if (horaActual.startsWith('00:')) {
          horaActual = '12:' + horaActual.slice(3) + ' AM';
        }
        if (subasta.horaCierreSubasta.startsWith('00:')) {
          subasta.horaCierreSubasta = '12:' + subasta.horaCierreSubasta.slice(3) + ' AM';
        }
        // Verificar si la subasta ya finalizó y si la hora actual es menor o igual a la hora de cierre de la subasta
        if (fechaActual.toLocaleDateString('es-ES') >= new Date(subasta.fechaFin).toLocaleDateString('es-ES') &&  horaActual >= subasta.horaCierreSubasta) {
          // Llamar al servicio de selección para filtrar las ofertas de la subasta
          this._seleccionService.filtroOfertas(subasta.idSubasta);
        }
      });
    }
  }

  // TODO PARA AUTOMATIZAR EL PROCESO DE SELECCION

  // Este código define dos funciones, iniciaIntervalo() y deternerIntervalo(), que inician y detienen un intervalo respectivamente.
  // El intervalo llama a la función procesoSeleccion() cada tiempoEnMs milisegundos, que está establecido en un valor predeterminado de 5000.
  // La variable intervaloId se utiliza para almacenar el ID devuelto por setInterval() para que pueda pasarse más tarde a
  // clearInterval() para detener el intervalo. Esto se hace para ejecutar la funcion encargada del process de seleccion
  // cada cierto tiempo.

  // Establece un intervalo de tiempo predeterminado de 5000 milisegundos (5 segundos)
  tiempoEnMs = 5000;

// Declara una variable para almacenar el ID del intervalo devuelto por setInterval()
  intervaloId!: NodeJS.Timeout;

// Define una función para iniciar el intervalo
  iniciaIntervalo(){
    // Llama a la función procesoSeleccion() antes de iniciar el intervalo
    this.procesoSeleccion();

    // Establece el ID del intervalo al valor devuelto por setInterval()
    // Esto llamará a la función procesoSeleccion() cada tiempoEnMs milisegundos
    this.intervaloId = setInterval(this.procesoSeleccion, this.tiempoEnMs);
  }

// Define una función para detener el intervalo
  deternerIntervalo(){
    // Llama a clearInterval() con el ID del intervalo para detener el intervalo
    clearInterval(this.intervaloId);
  }
}
