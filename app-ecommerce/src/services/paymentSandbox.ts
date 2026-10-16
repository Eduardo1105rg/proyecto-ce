import type { PaymentRequest, PaymentResult, PaymentResultCode } from '../types/payment'

/*
 * Componente que representa al proveedor externo de pagos (Sandbox).
 *
 * Etapa E1a: stub minimo por escenario, con la misma semantica que el stub C
 * (`src/features/checkout/checkoutApi.mock.ts`), SIN latencia simulada, SIN
 * timeout y SIN validacion de entrada. Esa complejidad llega en E1b.
 *
 * El Sandbox solo recibe y devuelve datos: no toca la orden. La transicion de
 * estados de la orden vive en `src/services/orders.ts` (`aplicarResultado`).
 */

/** Escenario que el evaluador puede provocar desde la interfaz. */
export type SandboxScenario = PaymentResultCode

/**
 * Simula al proveedor externo de pagos.
 *
 * Contrato (identico al del stub C, para que el swap de E3b sea solo un
 * cambio de import):
 *
 * - `PAYMENT_APPROVED`: resuelve con `code`, `message` y `transactionId`.
 * - `PAYMENT_DECLINED`: resuelve con `code` y `message`, sin `transactionId`.
 * - `PAYMENT_ERROR`: **lanza** `Error('El servicio de pago no respondió.')`;
 *   es la unica via de fallo. Quien llama (`CheckoutPage`) captura la
 *   excepcion y la convierte en un resultado `PAYMENT_ERROR` con mensaje
 *   comprensible.
 *
 * Respuesta inmediata: no hay `await` artificial (latencia y timeout son
 * alcance de E1b) ni validacion de `request` todavia (tambien E1b).
 *
 * @param request Solicitud de pago `{ orderId, amount, currency }`.
 * @param scenario Escenario a provocar desde la interfaz.
 * @returns El resultado de la transaccion simulada.
 * @throws Cuando `scenario` es `PAYMENT_ERROR`.
 */
export async function procesarPago(
    request: PaymentRequest,
    scenario: SandboxScenario,
): Promise<PaymentResult> {
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
