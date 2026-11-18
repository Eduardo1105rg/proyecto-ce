import type { ItemCarrito, ItemCarritoEnriquecido } from '../types/carrito'
import type { B2BPriceTier } from '../types/product'
import type { FaltanteB2B, ResultadoPrecio } from '../types/precios'
import type { Rol } from '../types/usuario'

export const MINIMO_B2B_DEFAULT = 12

type ProductoConPrecios = {
  price: number
  tiered_b2b_pricing?: B2BPriceTier[] | null
}

function precioValido(valor: unknown): valor is number {
  return typeof valor === 'number' && Number.isFinite(valor) && valor >= 0
}

function tramosValidos(tramos: B2BPriceTier[] | null | undefined): B2BPriceTier[] {
  if (!Array.isArray(tramos)) return []

  return tramos
    .filter(
      (tramo) =>
        Number.isInteger(tramo.min_qty) &&
        tramo.min_qty > 0 &&
        precioValido(tramo.unit_price),
    )
    .sort((a, b) => a.min_qty - b.min_qty)
}

export function obtenerReferenciaB2B(producto: ProductoConPrecios): B2BPriceTier | null {
  return tramosValidos(producto.tiered_b2b_pricing)[0] ?? null
}

function tramoAplicable(
  tramos: B2BPriceTier[],
  cantidadTotalProducto: number,
): B2BPriceTier | null {
  let aplicable: B2BPriceTier | null = null

  for (const tramo of tramos) {
    if (tramo.min_qty > cantidadTotalProducto) break
    aplicable = tramo
  }

  return aplicable
}

function cantidadEntera(valor: number): number {
  if (!Number.isFinite(valor)) return 0
  return Math.max(0, Math.floor(valor))
}

/**
 * Resuelve el precio de una línea a partir del rol y de la cantidad total del
 * producto, sumando todas sus sucursales.
 */
export function resolverPrecio(
  producto: ProductoConPrecios,
  rol: Rol | null,
  cantidadTotalProducto: number,
): ResultadoPrecio {
  const precioB2C = precioValido(producto.price) ? producto.price : 0
  const tramos = tramosValidos(producto.tiered_b2b_pricing)
  const referencia = tramos[0] ?? null
  const cantidad = cantidadEntera(cantidadTotalProducto)

  if (rol !== 'B2B') {
    return {
      tipo: 'B2C',
      precioUnitario: precioB2C,
      precioB2C,
      precioB2BReferencia: null,
      minimoB2B: referencia?.min_qty ?? 0,
      cumpleMinimoB2B: true,
      errorCondicion: null,
    }
  }

  if (!referencia) {
    return {
      tipo: 'B2C',
      precioUnitario: precioB2C,
      precioB2C,
      precioB2BReferencia: null,
      minimoB2B: MINIMO_B2B_DEFAULT,
      cumpleMinimoB2B: false,
      errorCondicion: 'Este producto no tiene una condición B2B configurada.',
    }
  }

  const tramo = tramoAplicable(tramos, cantidad)

  if (tramo) {
    return {
      tipo: 'B2B',
      precioUnitario: tramo.unit_price,
      precioB2C,
      precioB2BReferencia: referencia.unit_price,
      minimoB2B: referencia.min_qty,
      cumpleMinimoB2B: true,
      errorCondicion: null,
    }
  }

  return {
    tipo: 'B2C',
    precioUnitario: precioB2C,
    precioB2C,
    precioB2BReferencia: referencia.unit_price,
    minimoB2B: referencia.min_qty,
    cumpleMinimoB2B: false,
    errorCondicion: null,
  }
}

export function calcularCantidadesPorProducto(
  items: Array<Pick<ItemCarrito, 'objectID' | 'cantidad'>>,
): Map<string, number> {
  const cantidades = new Map<string, number>()

  for (const item of items) {
    cantidades.set(item.objectID, (cantidades.get(item.objectID) ?? 0) + item.cantidad)
  }

  return cantidades
}

type ItemParaValidarB2B = Pick<
  ItemCarritoEnriquecido,
  'objectID' | 'titulo' | 'cantidad' | 'minimoB2B' | 'cumpleMinimoB2B' | 'noDisponible' | 'errorCondicion'
>

export function validarMinimosB2B(
  items: ItemParaValidarB2B[],
  rol: Rol | null,
): FaltanteB2B[] {
  if (rol !== 'B2B') return []

  const porProducto = new Map<string, FaltanteB2B>()

  for (const item of items) {
    if (item.noDisponible || item.errorCondicion || item.minimoB2B <= 0) continue

    const existente = porProducto.get(item.objectID)
    const cantidad = (existente?.cantidad ?? 0) + item.cantidad

    porProducto.set(item.objectID, {
      objectID: item.objectID,
      titulo: existente?.titulo || item.titulo,
      cantidad,
      minimo: item.minimoB2B,
      faltan: Math.max(item.minimoB2B - cantidad, 0),
    })
  }

  return [...porProducto.values()].filter(
    (producto) =>
      producto.faltan > 0 &&
      items.some(
        (item) => item.objectID === producto.objectID && !item.cumpleMinimoB2B,
      ),
  )
}
