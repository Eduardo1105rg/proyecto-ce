
export type ItemCarrito = {

  objectID: string

  cantidad: number
}


export type ItemCarritoEnriquecido = ItemCarrito & {

  titulo: string

  precio: number

  imagen: string

  noDisponible: boolean
}


export type TotalesCarrito = {
  lineas: number

  articulos: number

  subtotal: number

  iva: number

  envio: number

  envioGratis: boolean

  total: number
}

/**
 * Estado global del carrito.
 */
export type EstadoCarrito = {

  items: ItemCarrito[]

  hidratado: boolean
}


export type AccionCarrito =
  | { type: 'HIDRATAR'; items: ItemCarrito[] }
  | { type: 'AGREGAR'; objectID: string; cantidad: number }
  | { type: 'CAMBIAR_CANTIDAD'; objectID: string; cantidad: number }
  | { type: 'ELIMINAR'; objectID: string }
  | { type: 'VACIAR' }