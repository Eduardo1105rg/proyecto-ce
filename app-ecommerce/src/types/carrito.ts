/**
 * Tipos del dominio del carrito.
 *
 * Este archivo no contiene lógica, solo formas de datos.
 */

/**
 * Línea del carrito tal como se guarda en localStorage.
 *
 * Contiene únicamente lo que se persiste: el identificador y la cantidad.
 * El nombre, el precio y la imagen no viven acá porque se derivan de
 * Algolia, de modo que guardarlos obligaría a invalidarlos en cada cambio
 * del catálogo y a mantener datos que pueden quedar viejos.
 */
export type ItemCarrito = {
  /** Identificador canónico del producto, generado por Algolia. */
  objectID: string
  /** Cantidad elegida. Nunca es menor a 1 mientras la línea exista. */
  cantidad: number
}

/**
 * Línea del carrito con los datos de Algolia ya resueltos.
 *
 * Es lo que consume la interfaz. Se extiende de ItemCarrito porque la línea
 * enrichida es la misma línea, más lo que se consultó del índice.
 */
export type ItemCarritoEnriquecido = ItemCarrito & {
  /**
   * Nombre del producto tomado de Algolia.
   *
   * Es cadena vacía cuando el producto ya no existe en el índice, porque
   * la línea se conserva sin nombre en vez de desaparecer sola de un carrito
   * que el usuario no tocó. La interfaz resuelve el texto final.
   */
  titulo: string
  /** Precio unitario actual, en colones. Es 0 si el producto ya no existe. */
  precio: number
  /** URL de la imagen principal del producto. */
  imagen: string
  /**
   * true cuando el producto ya no se encuentra en el índice.
   *
   * Ocurre cuando el seed de Algolia regenera los objectID. La línea se
   * conserva para que la interfaz pueda señalarla y ofrecer quitarla, en
   * lugar de desaparecer sola de un carrito que el usuario no tocó.
   */
  noDisponible: boolean
}

/**
 * Resumen de compra del carrito.
 *
 * Todos los valores se recalculan a partir de las líneas en el momento de
 * mostrarse, por eso ninguno de ellos se persiste.
 */
export type TotalesCarrito = {
  /** Cantidad de líneas del carrito. Distinto de la cantidad de artículos. */
  lineas: number
  /** Suma de las cantidades de todas las líneas. Alimenta el badge del Navbar. */
  articulos: number
  /** Suma de precio por cantidad. */
  subtotal: number
  /** Subtotal por 13%. */
  iva: number
  /** Costo de envío ya redondeado. */
  envio: number
  /**
   * true cuando el envío no se cobra por superar el umbral.
   *
   * Un carrito vacío no se marca como envío gratis aunque el envío valga 0:
   * no hay nada que enviar, y announce que el envío es gratis sería un mensaje
   * engañoso. La interfaz decide la etiqueta a partir de este valor.
   */
  envioGratis: boolean
  /** Subtotal más IVA más envío. */
  total: number
}

/**
 * Estado global del carrito.
 */
export type EstadoCarrito = {
  /** Líneas del carrito. Su forma es idéntica a lo que se persiste. */
  items: ItemCarrito[]
  /**
   * true cuando ya se leyó localStorage.
   *
   * Sin esta bandera, el primer render escribiría un carrito vacío sobre el
   * guardado antes de terminar la hidratación, y el carrito se perdería en
   * cada recarga.
   */
  hidratado: boolean
}

/**
 * Acciones que el reducer del carrito entiende.
 *
 * Las cantidades deberían llegar enteras desde quien despacha, pero el reducer
 * las normaliza igual para no depender de que el llamador lo haga bien.
 */
export type AccionCarrito =
  | { type: 'HIDRATAR'; items: ItemCarrito[] }
  | { type: 'AGREGAR'; objectID: string; cantidad: number }
  | { type: 'CAMBIAR_CANTIDAD'; objectID: string; cantidad: number }
  | { type: 'ELIMINAR'; objectID: string }
  | { type: 'VACIAR' }