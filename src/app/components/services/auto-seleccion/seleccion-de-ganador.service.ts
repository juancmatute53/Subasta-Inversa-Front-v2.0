import {Injectable} from '@angular/core';
import {OfertaCrudService} from "../oferta/oferta-crud.service";
import {HttpClient} from "@angular/common/http";
import {SubastaCrudService} from "../subasta/subasta-crud.service";
import {MessageService} from "primeng/api";

@Injectable({
  providedIn: 'root'
})
export class SeleccionDeGanadorService {

  // * Se debe elegir la oferta que tenga el precio unico y mas bajo

  // * Para realizar la subasta inversa de servicios, necesitas ordenar las ofertas por precio de forma ascendente
  // y luego seleccionar la oferta con el precio más bajo. Puedes hacer esto utilizando la función Array.sort() de JavaScript,
  // que ordena un array según un criterio específico.
  constructor(private _ofertaCrudService: OfertaCrudService, private _http: HttpClient,
              private _subastaCrudService: SubastaCrudService, private _messageService: MessageService) {
  }
// Este método recibe un identificador de subasta, filtra las ofertas por ese identificador,
// las ordena por precio de forma ascendente y selecciona la oferta ganadora (la que tiene el precio más bajo).
  filtroOfertas(id: number): void {
    // Definimos una interfaz para la estructura de los objetos que representa las ofertas
    interface Oferta {
      subasta: {
        idSubasta: number;
        fechaInicio: string;
        fechaFin: string;
        estadoSubasta: string;
        tituloSubasta: string;
        // otros atributos de la subasta
      },
      proveedor: {
        id_persona: number;
        nombre: string;
        apellido: string;
        email: string;
        telefono: string;
        // otros atributos del proveedor
      },
      //precioOferta: number;
      estado: boolean;
      fecha: string;
      comentario_calificacion_oferta: string;
      calificacion: number;
      // otros atributos de la oferta
      percioOferta: number;
    }

    // Obtenemos todas las ofertas disponibles
    this._ofertaCrudService.obtenerOferta().then(res => {
      // Filtrar las ofertas por el identificador de la subasta
      const ofertas: Oferta[] = res.filter((oferta: Oferta) => oferta.subasta.idSubasta === id);

      // Ordenar las ofertas por precio de forma ascendente
      ofertas.sort((a: Oferta, b: Oferta) => a.percioOferta - b.percioOferta);

      // Seleccionar la oferta ganadora (la que tiene el precio más bajo)
      const ofertaGanadora: Oferta = ofertas[0];

      // Verificar si hay más de una oferta ganadora o si hay empates
      const precios = ofertas.map((oferta: Oferta) => oferta.percioOferta);
      const precioMinimo = Math.min(...precios);
      const cantidadPreciosMinimos = precios.filter((precio: number) => precio === precioMinimo).length;

      // Si hay más de una oferta ganadora o si hay empates, se muestra un mensaje y se actualiza el estado de la subasta
      if (cantidadPreciosMinimos > 1) {
        this.addSingle('La subasta ha sido cerrada sin ganador', 'warn', 'Subasta cerrada');
        this.actualizarEstadoSubasta(ofertas[0].subasta);
      } else {
        // Si solo hay una oferta ganadora, se muestra un mensaje con la información de la oferta y se actualiza su estado
        this.addSingle(`La oferta ganadora es la de ${ofertaGanadora.proveedor.nombre + ' ' + ofertaGanadora.proveedor.apellido} por un precio de ${'$' + ofertaGanadora.percioOferta}`, 'success', 'Subasta finalizada');
        this.actualizarEstadoSubasta(ofertas);
        this.actualizarOferta(ofertaGanadora);
      }
    }).catch(err => {
      // Si ocurre un error al obtener las ofertas, se muestra un mensaje de error
      this.addSingle(err.message, 'error', 'Error al ofertar');
    });
  }
  actualizarEstadoSubasta(oferSubasta: any): void {
    // Se extrae la subasta del primer elemento del arreglo oferSubasta
    const { subasta } = oferSubasta[0];
    // Se crea un objeto con las propiedades actualizadas de la subasta a cerrar
    const subastaActualizada = {
      ...subasta, // Se copian todas las propiedades de subasta
      estadoSubasta: 'Cerrada', // Se sobrescribe el valor de estadoSubasta
    };

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

  actualizarOferta(ofer: any): void {
    console.log('OFERTA GANADORA ', ofer.percioOferta);
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
      location.reload();
    }, 10000);
  }
}
