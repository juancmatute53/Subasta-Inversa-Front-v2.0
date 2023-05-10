import {Injectable} from '@angular/core';
import {OfertaCrudService} from "../oferta/oferta-crud.service";
import {HttpClient} from "@angular/common/http";
import {SubastaCrudService} from "../subasta/subasta-crud.service";
import {MessageService} from "primeng/api";
import {NoticeService} from "../notificacion/notice.service";
import {Ofertas} from "../../../models/ofertas";
import {Subastas} from "../../../models/subastas";

@Injectable({
  providedIn: 'root'
})
export class SeleccionDeGanadorService {

  // * Se debe elegir la oferta que tenga el precio unico y mas bajo

  // * Para realizar la subasta inversa de servicios, necesitas ordenar las ofertas por precio de forma ascendente
  // y luego seleccionar la oferta con el precio más bajo. Puedes hacer esto utilizando la función Array.sort() de JavaScript,
  // que ordena un array según un criterio específico.
  constructor(private _ofertaCrudService: OfertaCrudService,
              private _http: HttpClient,
              private _subastaCrudService: SubastaCrudService,
              private _messageService: MessageService,
              private _notificacionService: NoticeService) {
  }
// Este método recibe un identificador de subasta, filtra las ofertas por ese identificador,
// las ordena por precio de forma ascendente y selecciona la oferta ganadora (la que tiene el precio más bajo).
  filtroOfertas(subasta: Subastas): void {
    console.log('SERTVICE A')
    // Obtenemos todas las ofertas disponibles
    this._ofertaCrudService.obtenerOferta().then(res => {
      // Filtrar las ofertas por el identificador de la subasta
      const ofertas: Ofertas[] = res.filter((oferta: Ofertas) => oferta.subasta.idSubasta === subasta.idSubasta);
      if (ofertas.length >= 1){
        // Creamos un array de objetos con los números de teléfono y los correos electrónicos de las ofertas que cumplen la
        // condición y tienen estos datos definidos
        const telefonosYCorreos: { telefono?: string, correo?: string }[] = ofertas
          // Filtramos solo las ofertas que tienen un número de teléfono o correo electrónico definido (no son undefined ni null)
          .filter(oferta => oferta.proveedor.telefono || oferta.proveedor.email)
          // Extraemos tanto los números de teléfono como los correos electrónicos de las ofertas que pasaron el filtro anterior
          .map(oferta => ({ telefono: oferta.proveedor.telefono, email: oferta.proveedor.email, subasta: oferta.subasta }));

        // Ordenar las ofertas por precio de forma ascendente
        ofertas.sort((a: Ofertas, b: Ofertas) => a.percioOferta - b.percioOferta);

        // Seleccionar la oferta ganadora (la que tiene el precio más bajo)
        const ofertaGanadora: Ofertas = ofertas[0];

        // Verificar si hay más de una oferta ganadora o si hay empates
        const precios = ofertas.map((oferta: Ofertas) => oferta.percioOferta);
        const precioMinimo = Math.min(...precios);
        const cantidadPreciosMinimos = precios.filter((precio: number) => precio === precioMinimo).length;

        // Si hay más de una oferta ganadora o si hay empates, se muestra un mensaje y se actualiza el estado de la subasta
        if (cantidadPreciosMinimos > 1) {
          this.addSingle('La subasta ha sido cerrada sin ganador', 'warn', 'Subasta cerrada');
          this.enviarNotificacion(`Lastimosamente la subasta *${ofertaGanadora.subasta.tituloSubasta}* a cerrado sin ganadores.`, telefonosYCorreos);
          this.actualizarEstadoSubasta(ofertas[0].subasta, 0);
        } else {

          // Obtener los números de teléfono de los perdedores
          const datosPerdedores = ofertas
            .filter((oferta: Ofertas) => oferta.proveedor.telefono && oferta.proveedor.telefono !== ofertaGanadora.proveedor.telefono)
            .map((oferta: Ofertas) => [{ telefono: oferta.proveedor.telefono, email: oferta.proveedor.email }]);

          // Enviamos notificacion al ganador de la subasta
          this.enviarEmail(
            ofertaGanadora.proveedor.email,
            `Usted ha sido el gran gandor en la subasta de ${ofertaGanadora.subasta.cliente.nombre+' '+ofertaGanadora.subasta.cliente.apellido}
          Subasta con el titulo de ${ofertaGanadora.subasta.tituloSubasta}`
          );
          this.enviarWhatsapp(
            `Usted ha sido el gran gandor en la subasta de *${ofertaGanadora.subasta.cliente.nombre+' '+ofertaGanadora.subasta.cliente.apellido}'* +
          'Subasta con el titulo de *${ofertaGanadora.subasta.tituloSubasta}*`,
            ofertaGanadora.proveedor.telefono
          );

          // Enviamos notificacion a el o los perdedores
          datosPerdedores.forEach((element) =>{
            this.enviarEmail(
              element[0].email,
              `Usted ha sido el gran gandor en la subasta de ${ofertaGanadora.subasta.cliente.nombre+' '+ofertaGanadora.subasta.cliente.apellido} Subasta con el titulo de ${ofertaGanadora.subasta.tituloSubasta}`
            );

            this.enviarWhatsapp(
              `Usted no ha sido escogido en la subasta de *${ofertaGanadora.subasta.cliente.nombre+' '+ofertaGanadora.subasta.cliente.apellido}'* Subasta con el titulo de *${ofertaGanadora.subasta.tituloSubasta}*`,
              element[0].telefono
            );
          })
          // Si solo hay una oferta ganadora, se muestra un mensaje con la información de la oferta y se actualiza su estado
          this.addSingle(`La oferta ganadora es la de ${ofertaGanadora.proveedor.nombre + ' ' + ofertaGanadora.proveedor.apellido} por un precio de ${'$' + ofertaGanadora.percioOferta}`, 'success', 'Subasta finalizada');
          this.actualizarEstadoSubasta(ofertas, 0);
          this.actualizarOferta(ofertaGanadora);
        }
      }else {
        this.actualizarEstadoSubastaSinOferta(subasta);
      }
    }).catch(err => {
      // Si ocurre un error al obtener las ofertas, se muestra un mensaje de error
      this.addSingle(err.message, 'error', 'Error al ofertar');
    });
  }
  actualizarEstadoSubasta(oferSubasta: any, idSubasta: number): void {
    // Se extrae la subasta del primer elemento del arreglo oferSubasta
    const { subasta } = oferSubasta[0];
    // Se crea un objeto con las propiedades actualizadas de la subasta a cerrar
    const subastaActualizada = {
      ...subasta, // Se copian todas las propiedades de subasta
      estadoSubasta: 'Cerrada', // Se sobrescribe el valor de estadoSubasta
    };

    this.enviarNotificacion(`Tu subasta *${subasta.tituloSubasta}* a finalizado. Puedes revisar tu panel en NextSharp`, subasta.cliente);

    // Se llama al método editarSubasta del servicio correspondiente, enviando como
    // parámetros la subasta actualizada y su identificador
    this._subastaCrudService.editarSubasta(subastaActualizada, subasta.idSubasta)
      .then(() => {
        // Si la operación se completa con éxito, se muestra un mensaje de éxito al usuario
        this.addSingle('Subasta finalizada', 'success', 'Finalizacion');
      })
      .catch(err => {
        // Si ocurre un error, se muestra un mensaje de error al usuario
        this.addSingle(err.message, 'error', 'Error');
      });
  }

  actualizarEstadoSubastaSinOferta(subasta: Subastas): void {

    // Se crea un objeto con las propiedades actualizadas de la subasta a cerrar
    const subastaActualizada = {
      ...subasta, // Se copian todas las propiedades de subasta
      estadoSubasta: 'Cerrada', // Se sobrescribe el valor de estadoSubasta
    };

    this.enviarNotificacion(`Tu subasta *${subasta.tituloSubasta}* a finalizado sin una oferta 😢. Puedes revisar tu panel en NextSharp`, subasta.cliente);

    // Se llama al método editarSubasta del servicio correspondiente, enviando como
    // parámetros la subasta actualizada y su identificador
    this._subastaCrudService.editarSubasta(subastaActualizada, subasta.idSubasta.toString())
      .then(() => {
        // Si la operación se completa con éxito, se muestra un mensaje de éxito al usuario
        this.addSingle('Subasta finalizada sin ofertas realizadas 😢.', 'success', 'Finalizacion');
      })
      .catch(err => {
        // Si ocurre un error, se muestra un mensaje de error al usuario
        this.addSingle(err.message, 'error', 'Error');
      });
  }

  actualizarOferta(ofer: any): void {
    // Se crea un objeto con las propiedades actualizadas de la oferta
    const oferta = {
      percioOferta: ofer.percioOferta,
      fecha: ofer.fecha,
      comentario_calificacion_oferta: "",
      estado: true,
      calificacion: 0,
      proveedor: {
        // Se especifica la propiedad del objeto proveedor que se quiere incluir
        id_persona: ofer.proveedor.id_persona
      },
      subasta: {
        // Se especifica la propiedad del objeto subasta que se quiere incluir
        idSubasta: ofer.subasta.idSubasta
      }
    };

    // Se llama al método editarOferta del servicio correspondiente, enviando como
    // parámetros la oferta actualizada y su identificador
    this._ofertaCrudService.editarOferta(oferta, ofer.idOferta)
      .then(() => {
        // Si la operación se completa con éxito, se muestra un mensaje de éxito al usuario
        this.addSingle(
          'Tu subasta ha finalizado, puedes comunicarte con ' + ofer.proveedor.nombre + ' ' + ofer.proveedor.apellido,
          'success', 'Ofertar');
      })
      .catch(() => {
        // Si ocurre un error, se muestra un mensaje de error al usuario
        this.addSingle('No se ha podido efectuar la selección del ganador.', 'error', 'Error al ofertar');
      })
  }

  enviarNotificacion(mensaje: string, data: any): void {
    if (Array.isArray(data)) {
      data.forEach(element => {
        this.enviarEmail(element.email, mensaje);
        this.enviarWhatsapp(element.telefono, mensaje);
      })
    } else if (typeof data === 'object') {
      this.enviarEmail(data.email, mensaje);
      this.enviarWhatsapp(mensaje, data.telefono)
    } else {
      this.addSingle('No se puedo enviar notificaciones.', 'error', 'Error al enviar mensaje de notificacion.');
    }
  }


  enviarEmail(email: string, mensaje: string): void{
    const msjMail = {
      asunto: 'La subasta a finalizado',
      email: email,
      mensaje: mensaje,
    };

    this._notificacionService.enviarMensaje(msjMail);
  }

  enviarWhatsapp(mensaje: string, numero: string): void{
    const msjWhatsapp = {
      message: mensaje,
      phone: numero
    }

    this._notificacionService.enviarMensajeWhatsapp(msjWhatsapp);
  }

  /**
   * Agrega un mensaje en pantalla con una duración de 10 segundos, y luego recarga la página
   * @param message - mensaje a mostrar
   * @param severity - severidad del mensaje (puede ser 'success', 'info', 'warn' o 'error')
   * @param summary - resumen del mensaje
   */
  addSingle(message: string, severity: string, summary: string) {
    // Agrega el mensaje al servicio de mensajes, con una duración de 10 segundos
    this._messageService.add({severity: severity, summary: summary, detail: message, life: 10000});

    // Luego de 10 segundos, recarga la página
    setTimeout(() => {
      //location.reload();

    }, 10000);
  }
}
