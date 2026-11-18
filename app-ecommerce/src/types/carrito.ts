import type { B2BPriceTier } from './product'
import type { TipoPrecio } from './precios'

export type ItemCarrito = {
  objectID: string
  branchId: string
  cantidad: number
}

export type ProductoCarritoResuelto = {
  objectID: string
  titulo: string
  precioB2C: number
  preciosB2B: B2BPriceTier[]
  imagen: string
  noDisponible: boolean
  envioGratis: boolean
  stockPorSucursal: Record<string, number>
}

export type ItemCarritoEnriquecido = ItemCarrito & {
  lineId: string
  titulo: string
  precio: number
  precioB2C: number
  precioB2BReferencia: number | null
  tipoPrecio: TipoPrecio
  minimoB2B: number
  cumpleMinimoB2B: boolean
  cantidadTotalProducto: number
  errorCondicion: string | null
  imagen: string
  noDisponible: boolean
  stockSucursal: number
  stockInsuficiente: boolean
  stockPorSucursal: Record<string, number>
  branchName: string
  /** true si el producto ofrece envío gratis (facets.free_shipping) */
  envioGratis: boolean
}

export type TotalesCarrito = {
  lineas: number
  articulos: number
  subtotal: number
  iva: number
  envio: number
  envioGratis: boolean
  /** Base usada para calcular el envío: subtotal de líneas SIN envío gratis */
  baseEnvio: number
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
  | { type: 'AGREGAR'; objectID: string; branchId: string; cantidad: number }
  | { type: 'CAMBIAR_CANTIDAD'; lineId: string; cantidad: number }
  | { type: 'CAMBIAR_SUCURSAL'; lineId: string; branchId: string }
  | { type: 'ELIMINAR'; lineId: string }
  | { type: 'VACIAR' }
