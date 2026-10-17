import type { PaymentRequest, PaymentResult, PaymentResultCode } from '../../types/payment'

/*
 * Stub C: simulador de pagos que la pagina usa durante la integracion parcial.
 *
 * Las ordenes ya viven en `services/orders.ts` (E2/E3a); de esta capa solo
 * queda `procesarPago` (con su tipo `SandboxScenario`) hasta que el Sandbox
 * real (`services/paymentSandbox.ts`, E1b) entre en la pagina (E3b). No agregar
 * aqui logica nueva: es codigo transitorio que E3b retira.
 */

/** Escenario que el evaluador puede provocar desde la interfaz. */
export type SandboxScenario = PaymentResultCode

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

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
