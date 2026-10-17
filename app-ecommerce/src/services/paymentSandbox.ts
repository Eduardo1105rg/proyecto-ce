import type { PaymentRequest, PaymentResult, PaymentResultCode } from '../types/payment'

export type SandboxScenario = PaymentResultCode

const RETARDO_PAGO_MS = 2000

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

/**
 * @param request Solicitud de pago `{ orderId, amount, currency }`.
 * @param scenario Escenario a provocar desde la interfaz.
 * @returns El resultado de la transaccion simulada.
 * @throws Cuando la solicitud o el escenario son inválidos, o se simula `PAYMENT_ERROR`.
 */
export async function procesarPago(
    request: PaymentRequest,
    scenario: SandboxScenario,
): Promise<PaymentResult> {
    validarSolicitud(request)

    if (
        scenario !== 'PAYMENT_APPROVED' &&
        scenario !== 'PAYMENT_DECLINED' &&
        scenario !== 'PAYMENT_ERROR'
    ) {
        throw new Error('Seleccione un escenario de pago válido.')
    }

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
