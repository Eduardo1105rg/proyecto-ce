/**
 * Formateador de montos en colones.
 *
 * - Los precios del catalogo estan en colones, sin centimos.
 */
const formatter = new Intl.NumberFormat('es-CR', {
  style: 'currency',
  currency: 'CRC',
  maximumFractionDigits: 0,
})

export function formatPrice(value: number): string {
  return formatter.format(value)
}