import { INDEX_ORDERS, searchClient } from './Algolia'
import { esOrdenValida } from './orders'
import type { OrdenConsulta } from '../types/order'

export const PREFIJO_ORDEN_DEMO = 'DEMO-'
export const MAX_ORDENES_DEMO = 100

export function esOrdenDemoValida(valor: unknown): valor is OrdenConsulta {
    if (!esOrdenValida(valor)) return false

    const orden = valor as unknown as Record<string, unknown>

    return (
        orden.origen === 'demo' &&
        typeof orden.orderNumber === 'string' &&
        orden.orderNumber.startsWith(PREFIJO_ORDEN_DEMO)
    )
}

export async function listarOrdenesDemo(): Promise<OrdenConsulta[]> {
    if (!INDEX_ORDERS) {
        throw new Error('El índice de órdenes demo no está configurado.')
    }

    const { results } = await searchClient.search<Record<string, unknown>>({
        requests: [
            {
                indexName: INDEX_ORDERS,
                query: '',
                filters: 'origen:"demo"',
                hitsPerPage: MAX_ORDENES_DEMO,
            },
        ],
    })

    const respuesta = results[0]

    if (!respuesta || !('hits' in respuesta)) {
        throw new Error('Algolia no devolvió resultados para las órdenes demo.')
    }

    const validas = respuesta.hits.filter(esOrdenDemoValida)

    if (validas.length !== respuesta.hits.length) {
        console.warn(
            `[ordenes] se descartaron ${respuesta.hits.length - validas.length} orden(es) demo inválida(s).`,
        )
    }

    return validas
}
