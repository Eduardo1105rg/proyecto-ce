import type { PaymentRequest, PaymentResult, PaymentResultCode } from '../types/payment'

export type SandboxScenario = PaymentResultCode

const RETARDO_PAGO_MS = 2000
const TIEMPO_LIMITE_PAGO_MS = 5000

type ProveedorSandbox = (request: PaymentRequest, scenario: SandboxScenario) => Promise<PaymentResult>

type OpcionesSandbox = {
    tiempoLimiteMs?: number
    proveedor?: ProveedorSandbox
}

export class ErrorServicioPago extends Error {}

function validarSolicitud(request: PaymentRequest): void {
    if (!request || typeof request.orderId !== 'string' || !request.orderId.trim()) {
        throw new Error('La solicitud de pago debe indicar un número de orden.')
    }

    if (typeof request.amount !== 'number' || !Number.isFinite(request.amount) || request.amount < 0) {
        throw new Error('El monto del pago debe ser un número válido mayor o igual a cero.')
    }

    if (request.currency !== 'CRC') {
        throw new Error('El Sandbox solo admite pagos en colones (CRC).')
    }
}

async function simularPago(
    request: PaymentRequest,
    scenario: SandboxScenario,
): Promise<PaymentResult> {
    const { orderId } = request
    await new Promise<void>((resolve) => setTimeout(resolve, RETARDO_PAGO_MS))

    if (scenario === 'PAYMENT_ERROR') {
        throw new Error('El servicio de pago no respondió.')
    }

    if (scenario === 'PAYMENT_DECLINED') {
        return {
            code: 'PAYMENT_DECLINED',
            orderId,
            message: 'El pago fue rechazado. Verifique su método de pago o intente con otro.',
        }
    }

    return {
        code: 'PAYMENT_APPROVED',
        orderId,
        message: 'Su pago fue aprobado.',
        transactionId: `SBX-${Date.now()}`,
    }
}

/**
 * @param request Solicitud de pago `{ orderId, amount, currency }`.
 * @param scenario Escenario a provocar desde la interfaz.
 * @param options Proveedor y tiempo límite opcionales; por defecto usa el simulador y 5 segundos.
 * @returns El resultado de la transaccion simulada.
 * @throws Cuando la solicitud, el escenario o el tiempo límite son inválidos.
 * @throws ErrorServicioPago cuando el proveedor falla o supera el tiempo límite.
 */
export async function procesarPago(
    request: PaymentRequest,
    scenario: SandboxScenario,
    { tiempoLimiteMs = TIEMPO_LIMITE_PAGO_MS, proveedor = simularPago }: OpcionesSandbox = {},
): Promise<PaymentResult> {
    validarSolicitud(request)

    if (
        scenario !== 'PAYMENT_APPROVED' &&
        scenario !== 'PAYMENT_DECLINED' &&
        scenario !== 'PAYMENT_ERROR'
    ) {
        throw new Error('Seleccione un escenario de pago válido.')
    }

    if (!Number.isFinite(tiempoLimiteMs) || tiempoLimiteMs <= 0) {
        throw new Error('El tiempo límite del pago debe ser un número válido mayor que cero.')
    }

    const solicitud = { ...request }
    let timer: ReturnType<typeof setTimeout> | undefined

    try {
        const timeout = new Promise<never>((_, reject) => {
            timer = setTimeout(() => {
                reject(new ErrorServicioPago('El servicio de pago tardó demasiado en responder. Intente de nuevo.'))
            }, tiempoLimiteMs)
        })

        const payment = Promise.resolve().then(() => proveedor(solicitud, scenario))

        return await Promise.race([payment, timeout])
    } catch (error) {
        if (error instanceof ErrorServicioPago) throw error

        throw new ErrorServicioPago('El servicio de pago no está disponible en este momento. Intente de nuevo.')
    } finally {
        clearTimeout(timer)
    }
}
