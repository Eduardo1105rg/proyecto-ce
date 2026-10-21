/**
 * Contrato del componente Sandbox de pagos (requisitos 4 y 5).
 *
 * El servicio simulado recibe una {@link PaymentRequest} y responde con un
 * {@link PaymentResult} cuyo {@link PaymentResultCode} identifica el escenario
 * provocado. No maneja datos de tarjeta ni informacion financiera real.
 */

/**
 * Codigos de resultado de la transaccion (contrato del requisito 5).
 *
 * - `PAYMENT_APPROVED`: el Sandbox aprueba el pago; la orden pasa a
 *   `CONFIRMED` / `APPROVED`.
 * - `PAYMENT_DECLINED`: el Sandbox rechaza el pago; la orden NO se confirma
 *   y el usuario puede reintentar.
 * - `PAYMENT_ERROR`: el Sandbox fallo o no respondio; en la practica se
 *   produce lanzando/excepcionando (unica via de fallo) y la pagina lo arma
 *   como resultado para no presentar la compra como completada.
 */
export type PaymentResultCode = 'PAYMENT_APPROVED' | 'PAYMENT_DECLINED' | 'PAYMENT_ERROR'

/**
 * Solicitud que recibe el servicio de pago Sandbox.
 *
 * Equivale a la solicitud descrita en el requisito 4. No incluye datos de
 * tarjeta ni ningun dato financiero real.
 */
export type PaymentRequest = {
    /** Numero de orden que se esta pagando (p. ej. `MB-20261015-0001`). */
    orderId: string
    /** Monto total a cobrar, ya calculado por el carrito (no se recalcula aqui). */
    amount: number
    /** Moneda unica soportada por el Sandbox. */
    currency: 'CRC'
}

/**
 * Respuesta del servicio de pago Sandbox.
 *
 * En los escenarios aprobado y rechazado el servicio resuelve la promesa con
 * este objeto; en `PAYMENT_ERROR` el servicio **rechaza** la promesa y la
 * pagina construye un `PaymentResult` con ese codigo a partir del fallo.
 */
export type PaymentResult = {
    /** Escenario devuelto por el Sandbox. */
    code: PaymentResultCode
    /** Orden a la que pertenece el resultado; se refleja el `orderId` recibido. */
    orderId: string
    /** Mensaje apto para mostrarse al usuario final. */
    message: string
    /** Identificador de la transaccion simulada; solo presente si el pago fue aprobado. */
    transactionId?: string
}
