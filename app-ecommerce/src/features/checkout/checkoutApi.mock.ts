import type { BuyerInfo, DeliveryInfo, Order, OrderItem } from '../../types/order'
import type { PaymentRequest, PaymentResult, PaymentResultCode } from '../../types/payment'

/*
 * Capa simulada del checkout.
 */

/** Escenario que el evaluador puede provocar desde la interfaz. */
export type SandboxScenario = PaymentResultCode

export type CrearOrdenInput = {
    buyer: BuyerInfo
    delivery: DeliveryInfo
    items: OrderItem[]
    subtotal: number
    tax: number
    shipping: number
    total: number
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

function buildOrderNumber(): string {
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`
    const sequence = String(Math.floor(Math.random() * 9000) + 1000)
    return `MB-${date}-${sequence}`
}

/** Crea la orden en estado PENDING, con los montos recibidos tal cual. */
export async function crearOrden(input: CrearOrdenInput): Promise<Order> {
    await wait(300)

    return {
        ...input,
        orderNumber: buildOrderNumber(),
        createdAt: new Date().toISOString(),
        status: 'PENDING',
        paymentStatus: 'PENDING',
    }
}

/** Simula al proveedor externo. No modifica la orden: solo devuelve un resultado. */
export async function procesarPago(
    request: PaymentRequest,
    scenario: SandboxScenario,
): Promise<PaymentResult> {
    await wait(1200)

    if (scenario === 'PAYMENT_ERROR') {
        throw new Error('El servicio de pago no respondió.')
    }

    if (scenario === 'PAYMENT_DECLINED') {
        return {
            code: 'PAYMENT_DECLINED',
            orderId: request.orderId,
            message: 'El pago fue rechazado. Verifique su método de pago o intente con otro.',
        }
    }

    return {
        code: 'PAYMENT_APPROVED',
        orderId: request.orderId,
        message: 'Su pago fue aprobado.',
        transactionId: `SBX-${Date.now()}`,
    }
}

/** Devuelve la orden actualizada según el resultado del pago. */
export function aplicarResultado(order: Order, result: PaymentResult): Order {
    if (result.code === 'PAYMENT_APPROVED') {
        return { ...order, status: 'CONFIRMED', paymentStatus: 'APPROVED' }
    }

    if (result.code === 'PAYMENT_DECLINED') {
        // Se permite reintentar, por eso la orden sigue pendiente.
        return { ...order, status: 'PENDING', paymentStatus: 'DECLINED' }
    }

    return { ...order, status: 'PENDING', paymentStatus: 'ERROR' }
}