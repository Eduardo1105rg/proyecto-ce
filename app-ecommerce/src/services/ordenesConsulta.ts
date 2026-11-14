import { listarOrdenes } from './orders'
import { listarOrdenesDemo } from './ordenesDemo'
import type { OrdenConsulta, ResultadoConsultaOrdenes } from '../types/order'

function ordenarPorFechaDesc(ordenes: OrdenConsulta[]): OrdenConsulta[] {
    return [...ordenes].sort(
        (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
    )
}

function mensajeErrorDemo(error: unknown): string {
    if (error instanceof Error && error.message.trim() !== '') {
        return `No se pudieron cargar las órdenes demo: ${error.message}`
    }

    return 'No se pudieron cargar las órdenes demo.'
}

/**
 * Devuelve las órdenes locales y las demo en un formato listo para mostrar.
 * Las órdenes locales tienen prioridad si coincide el número de orden.
 */
export async function obtenerOrdenesParaMostrar(): Promise<ResultadoConsultaOrdenes> {
    const locales: OrdenConsulta[] = listarOrdenes().map((orden) => ({
        ...orden,
        origen: 'local',
    }))

    let demo: OrdenConsulta[] = []
    let errorDemo: string | null = null

    try {
        demo = await listarOrdenesDemo()
    } catch (error) {
        console.warn('[ordenes] no se pudieron cargar las órdenes demo.', error)
        errorDemo = mensajeErrorDemo(error)
    }

    const porNumero = new Map<string, OrdenConsulta>()

    for (const orden of [...locales, ...demo]) {
        if (!porNumero.has(orden.orderNumber)) {
            porNumero.set(orden.orderNumber, orden)
        }
    }

    return {
        ordenes: ordenarPorFechaDesc([...porNumero.values()]),
        errorDemo,
    }
}
