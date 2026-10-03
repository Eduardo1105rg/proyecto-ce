import type { ItemCarritoEnriquecido, TotalesCarrito } from '../types/carrito'

/**
 * Tasa del IVA, 13% según el requerimiento 2.6 de la especificación.
 *
 * Se aplica de forma plana sobre el subtotal. El producto tiene un campo
 * facets.tax_exempt que hoy se ignora a propósito: respetarlo obligaría a
 * desviarse de la fórmula pedida y a explicar una base imponible aparte.
 */
export const IVA_TASA = 0.13

/** Porcentaje que se cobra por envío cuando el carrito no alcanza el umbral. */
export const ENVIO_PORCENTAJE = 0.08

/** Envío mínimo que se cobra cuando el carrito no alcanza el umbral. */
export const ENVIO_MINIMO = 3_000

/** Subtotal a partir del cual el envío no se cobra. */
export const UMBRAL_ENVIO_GRATIS = 150_000

/**
 * Calcula el subtotal como la suma del precio por cantidad de cada línea.
 *
 * Las líneas marcadas como no disponibles se conservan en el carrito pero no
 * aportan al subtotal: no se puede cobrar por un producto que ya no existe.
 */
export function calcularSubtotal(items: ItemCarritoEnriquecido[]): number {
  return items.reduce((total, item) => {
    if (item.noDisponible) return total
    return total + item.precio * item.cantidad
  }, 0)
}

/**
 * Determina el costo de envío a partir del subtotal.
 *
 * El carrito vacío se trata como un caso explícito y no como un valor derivado
 * de la fórmula: sin ese guarda, el envío mínimo de 3.000 haría que un carrito
 * vacío mostrara un total de 3.390, cuando lo correcto es un total de 0.
 */
export function calcularEnvio(subtotal: number): number {
  if (subtotal <= 0) return 0
  if (subtotal >= UMBRAL_ENVIO_GRATIS) return 0
  return Math.max(Math.round(subtotal * ENVIO_PORCENTAJE), ENVIO_MINIMO)
}

/**
 * Resumen completo del carrito.
 *
 * IVA y envío se redondean a números enteros porque los precios del catálogo
 * están en colones y mostrar decimales de un centavo no aporta nada. El total
 * se arma sumando valores ya redondeados, de modo que la suma de las partes
 * que ve el usuario siempre da exactamente el total que ve el usuario.
 *
 * Las líneas no disponibles cuentan para lineas y articulos porque siguen
 * estando en el carrito hasta que el usuario las quite, pero no para el subtotal.
 */
export function calcularTotales(items: ItemCarritoEnriquecido[]): TotalesCarrito {
  const subtotal = calcularSubtotal(items)
  const iva = Math.round(subtotal * IVA_TASA)
  const envio = calcularEnvio(subtotal)

  return {
    lineas: items.length,
    articulos: items.reduce((total, item) => total + item.cantidad, 0),
    subtotal,
    iva,
    envio,
    envioGratis: envio === 0 && subtotal > 0,
    total: subtotal + iva + envio,
  }
}