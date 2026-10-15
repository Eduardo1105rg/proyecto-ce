export type PaymentResultCode = 'PAYMENT_APPROVED' | 'PAYMENT_DECLINED' | 'PAYMENT_ERROR'

/** Solicitud que recibe el servicio de pago Sandbox. */
export type PaymentRequest = {
    orderId: string
    amount: number
    currency: 'CRC'
}

/** Respuesta del servicio de pago Sandbox. */
export type PaymentResult = {
    code: PaymentResultCode
    orderId: string
    message: string
    transactionId?: string
}