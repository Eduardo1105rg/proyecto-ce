import type { BuyerInfo, DeliveryInfo, Order, OrderItem } from '../types/order'
import type { PaymentResult } from '../types/payment'

/*
 * Servicio de ordenes (destino definitivo de `crearOrden` y `aplicarResultado`).
 *
 * Reglas de negocio:
 *  - Los montos llegan calculados por el carrito y NO se recalculan aqui.
 *  - Los items no disponibles no se incluyen (la pagina los filtra antes).
 *  - Numero de orden unico `MB-YYYYMMDD-NNNN` (secuencia diaria creciente).
 *  - Estados iniciales `PENDING` / `PENDING`.
 *  - `FAILED` (G9): reservado para invalidacion definitiva; no se emite en este
 *    servicio. En `aplicarResultado`, si la orden ya esta `CONFIRMED` se devuelve
 *    sin cambios; en cualquier otro caso se mantiene `PENDING`.
 */

/** Clave del rubro de Ordenes en localStorage. */
export const CLAVE_ORDENES = 'ordenes:v1'

/** Version del formato guardado; permite descartar datos de versiones previas. */
export const VERSION_ORDENES = 1

type OrdenesGuardadas = {
    version: number
    orders: Order[]
}

export type CrearOrdenInput = {
    buyer: BuyerInfo
    delivery: DeliveryInfo
    items: OrderItem[]
    subtotal: number
    tax: number
    shipping: number
    total: number
}

function esBuyerValido(valor: unknown): valor is BuyerInfo {
    if (typeof valor !== 'object' || valor === null) return false

    const buyer = valor as Record<string, unknown>

    return (
        typeof buyer.fullName === 'string' &&
        typeof buyer.email === 'string' &&
        typeof buyer.phone === 'string'
    )
}

function esDeliveryValida(valor: unknown): valor is DeliveryInfo {
    if (typeof valor !== 'object' || valor === null) return false

    const delivery = valor as Record<string, unknown>

    return (
        typeof delivery.province === 'string' &&
        typeof delivery.canton === 'string' &&
        typeof delivery.address === 'string' &&
        (delivery.notes === undefined || typeof delivery.notes === 'string')
    )
}

function esItemValido(valor: unknown): valor is OrderItem {
    if (typeof valor !== 'object' || valor === null) return false

    const item = valor as Record<string, unknown>

    return (
        typeof item.objectID === 'string' &&
        item.objectID.trim() !== '' &&
        typeof item.name === 'string' &&
        typeof item.unitPrice === 'number' &&
        Number.isInteger(item.quantity) &&
        (item.quantity as number) >= 1 &&
        typeof item.subtotal === 'number'
    )
}

/**
 * Valida que un valor desconocido tenga la forma completa de una {@link Order}.
 * Se usa al leer el repositorio para descartar entradas corruptas.
 */
export function esOrdenValida(valor: unknown): valor is Order {
    if (typeof valor !== 'object' || valor === null) return false

    const orden = valor as Record<string, unknown>

    return (
        typeof orden.orderNumber === 'string' &&
        orden.orderNumber.trim() !== '' &&
        typeof orden.createdAt === 'string' &&
        esBuyerValido(orden.buyer) &&
        esDeliveryValida(orden.delivery) &&
        Array.isArray(orden.items) &&
        orden.items.every(esItemValido) &&
        typeof orden.subtotal === 'number' &&
        typeof orden.tax === 'number' &&
        typeof orden.shipping === 'number' &&
        typeof orden.total === 'number' &&
        (orden.status === 'PENDING' || orden.status === 'CONFIRMED' || orden.status === 'FAILED') &&
        (orden.paymentStatus === 'PENDING' ||
            orden.paymentStatus === 'APPROVED' ||
            orden.paymentStatus === 'DECLINED' ||
            orden.paymentStatus === 'ERROR')
    )
}

function sanearOrdenes(valor: unknown, contexto: string): Order[] {
    if (!Array.isArray(valor)) return []

    const validas = valor.filter(esOrdenValida)

    if (validas.length !== valor.length) {
        console.warn(
            `[ordenes] ${contexto}: se descartaron ${valor.length - validas.length} orden(es) con datos invalidos.`,
        )
    }

    console.log('[ordenes] ordenes validas', validas)

    return validas
}

/**
 * Lee todas las ordenes persistidas. Ante cualquier fallo de parseo o de
 * disponibilidad de `localStorage` se trata como "sin ordenes".
 */
export function listarOrdenes(): Order[] {
    let crudo: string | null

    try {
        crudo = localStorage.getItem(CLAVE_ORDENES)
    } catch {
        console.warn('[ordenes] localStorage no esta disponible. Las ordenes no se podran recuperar.')
        return []
    }

    if (crudo === null) return []

    let datos: unknown

    try {
        datos = JSON.parse(crudo)
    } catch {
        console.warn(`[ordenes] ${CLAVE_ORDENES} no contiene JSON valido. Se descarta el contenido guardado.`)
        return []
    }

    if (typeof datos !== 'object' || datos === null) return []

    const guardado = datos as Record<string, unknown>

    if (guardado.version !== VERSION_ORDENES) return []

    return sanearOrdenes(guardado.orders, 'ordenes guardadas')
}

/**
 * Recupera una orden por su numero. Devuelve `null` si no existe o es invalida.
 */
export function obtenerOrden(orderNumber: string): Order | null {
    return listarOrdenes().find((orden) => orden.orderNumber === orderNumber) ?? null
}

function guardarOrdenes(ordenes: Order[]): void {
    const guardado: OrdenesGuardadas = {
        version: VERSION_ORDENES,
        orders: ordenes,
    }

    try {
        localStorage.setItem(CLAVE_ORDENES, JSON.stringify(guardado))
    } catch {
        console.warn('[ordenes] no se pudo guardar la orden. Los cambios no sobreviviran a una recarga.')
    }
}

function persistirOrden(orden: Order): void {
    const ordenes = listarOrdenes()
    const indice = ordenes.findIndex((existente) => existente.orderNumber === orden.orderNumber)

    if (indice >= 0) {
        ordenes[indice] = orden
    } else {
        ordenes.push(orden)
    }

    guardarOrdenes(ordenes)
}

/**
 * Construye un numero de orden unico `MB-YYYYMMDD-NNNN` buscando la secuencia
 * mas alta ya usada en el dia (o 0) e incrementandola en uno.
 */
function buildOrderNumber(ordenes: Order[]): string {
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`
    const prefix = `MB-${date}-`

    const maxSecuencia = ordenes.reduce((max, orden) => {
        if (!orden.orderNumber.startsWith(prefix)) return max

        const secuencia = Number.parseInt(orden.orderNumber.slice(prefix.length), 10)

        return Number.isInteger(secuencia) && secuencia > max ? secuencia : max
    }, 0)

    return `${prefix}${String(maxSecuencia + 1).padStart(4, '0')}`
}

/**
 * Crea la orden en estado `PENDING` / `PENDING` con los montos recibidos tal
 * cual y la persiste en el repositorio.
 *
 * @param input Comprador, entrega, items y montos calculados por el carrito.
 * @returns La orden creada con su numero unico.
 */
export async function crearOrden(input: CrearOrdenInput): Promise<Order> {
    const order: Order = {
        orderNumber: buildOrderNumber(listarOrdenes()),
        createdAt: new Date().toISOString(),
        buyer: input.buyer,
        delivery: input.delivery,
        items: input.items,
        subtotal: input.subtotal,
        tax: input.tax,
        shipping: input.shipping,
        total: input.total,
        status: 'PENDING',
        paymentStatus: 'PENDING',
    }

    console.log('[ordenes] creando orden', order);
    persistirOrden(order)

    return order
}

/**
 * Devuelve la orden actualizada segun el resultado del pago y la persiste. No
 * toca el Sandbox (solo recibe y devuelve datos).
 *
 * Transiciones: aprobado -> `CONFIRMED` / `APPROVED`; rechazado -> `PENDING` /
 * `DECLINED`; error -> `PENDING` / `ERROR`. `FAILED` no se emite; si la orden
 * ya esta `CONFIRMED` se devuelve sin cambios.
 *
 * @param order Orden a actualizar.
 * @param result Resultado devuelto por el servicio de pago.
 * @returns La orden con `status` y `paymentStatus` aplicados.
 */
export function aplicarResultado(order: Order, result: PaymentResult): Order {
    if (order.status === 'CONFIRMED') return order

    if (result.code === 'PAYMENT_APPROVED') {
        const confirmada: Order = { ...order, status: 'CONFIRMED', paymentStatus: 'APPROVED' }
        persistirOrden(confirmada)
        return confirmada
    }

    if (result.code === 'PAYMENT_DECLINED') {
        const rechazada: Order = { ...order, status: 'PENDING', paymentStatus: 'DECLINED' }
        persistirOrden(rechazada)
        return rechazada
    }

    const conError: Order = { ...order, status: 'PENDING', paymentStatus: 'ERROR' }
    persistirOrden(conError)
    return conError
}
