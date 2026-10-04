/**
 * Formateador de montos en colones.
 */
const formatter = new Intl.NumberFormat('es-CR', {
	style: 'currency',
	currency: 'CRC',
	maximumFractionDigits: 0,
})

export function formatPrice(value: number): string {
	return formatter.format(value)
}