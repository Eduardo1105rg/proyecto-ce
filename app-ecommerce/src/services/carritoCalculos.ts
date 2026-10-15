import type { ItemCarritoEnriquecido, TotalesCarrito } from '../types/carrito'


export const IVA_TASA = 0.13


export const ENVIO_PORCENTAJE = 0.08


export const ENVIO_MINIMO = 3_000


export const UMBRAL_ENVIO_GRATIS = 100_000 // Cambiado de 150_000 a 100_000


export function calcularSubtotal(items: ItemCarritoEnriquecido[]): number {
  return items.reduce((total, item) => {
    if (item.noDisponible) return total
    return total + item.precio * item.cantidad
  }, 0)
}


/** Suma de líneas disponibles que SÍ pagan envío (sin envío gratis). */
export function calcularBaseEnvio(items: ItemCarritoEnriquecido[]): number {
  return items.reduce((total, item) => {
    if (item.noDisponible || item.envioGratis) return total
    return total + item.precio * item.cantidad
  }, 0)
}

/** Envío calculado sobre la base gravable, respetando umbral global. */
export function calcularEnvio(items: ItemCarritoEnriquecido[]): number {
  const subtotal = calcularSubtotal(items)
  if (subtotal <= 0) return 0
  if (subtotal >= UMBRAL_ENVIO_GRATIS) return 0

  const base = calcularBaseEnvio(items)
  if (base <= 0) return 0

  return Math.max(Math.round(base * ENVIO_PORCENTAJE), ENVIO_MINIMO)
}


export function calcularTotales(items: ItemCarritoEnriquecido[]): TotalesCarrito {
  const subtotal = calcularSubtotal(items)
  const baseEnvio = calcularBaseEnvio(items)
  const iva = Math.round(subtotal * IVA_TASA)
  const envio = calcularEnvio(items)

  return {
    lineas: items.length,
    articulos: items.reduce((total, item) => total + item.cantidad, 0),
    subtotal,
    iva,
    envio,
    envioGratis: envio === 0 && subtotal > 0,
    baseEnvio,
    total: subtotal + iva + envio,
  }
}