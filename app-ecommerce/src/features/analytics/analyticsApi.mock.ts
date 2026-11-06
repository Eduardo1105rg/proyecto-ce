import type { EventoAnalytics, MetricasUsuario, TipoEvento } from '../../types/analytics'

const eventos: EventoAnalytics[] = []

// TODO conectar con el módulo real de eventos en localStorage
export function registrarEvento(
	usuarioId: string,
	tipo: TipoEvento,
	detalle: EventoAnalytics['detalle'],
): void {
	eventos.push({
		id: crypto.randomUUID(),
		tipo,
		fecha: new Date().toISOString(),
		usuarioId,
		detalle,
	})
}

function recientes(usuarioId: string, tipo: TipoEvento, campo: string): string[] {
	const valores = eventos
		.filter((e) => e.usuarioId === usuarioId && e.tipo === tipo)
		.reverse()
		.map((e) => String(e.detalle[campo]))
	return [...new Set(valores)].slice(0, 10)
}

// TODO conectar
export function obtenerVistosRecientes(usuarioId: string): string[] {
	return recientes(usuarioId, 'vista_producto', 'productoId')
}

// TODO conectar
export function obtenerBusquedasRecientes(usuarioId: string): string[] {
	return recientes(usuarioId, 'busqueda', 'termino')
}

// TODO conectar
export function obtenerMetricas(usuarioId: string): MetricasUsuario {
	const propios = eventos.filter((e) => e.usuarioId === usuarioId)
	const contar = (tipo: TipoEvento) => propios.filter((e) => e.tipo === tipo).length
	return {
		productosVistos: contar('vista_producto'),
		busquedas: contar('busqueda'),
		agregadosCarrito: contar('agregar_carrito'),
		compras: contar('compra'),
	}
}