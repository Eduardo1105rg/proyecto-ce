import type { Rol } from './usuario'

/** Estado de la orden. Se maneja aparte del estado del pago a propósito. */
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'FAILED'

/** Estado del pago. */
export type PaymentStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR'

export type BuyerInfo = {
    fullName: string
    email: string
    phone: string
}

export type DeliveryInfo = {
    province: string
    canton: string
    address: string
    /** Información adicional para la entrega (opcional) */
    notes?: string
}

export type OrderItem = {
    objectID: string
    name: string
    unitPrice: number
    quantity: number
    subtotal: number
}

export type Order = {
    /** Ejemplo: MB-20261015-0001 - MB-YYYYMMDD-NNNN */
    orderNumber: string
    createdAt: string
    /** Usuario autenticado que realizó la compra (o `anonimo`). */
    usuarioId?: string
    /** Rol del usuario al momento de la compra. */
    rol?: Rol
    /** Sucursal asociada a la compra, cuando el checkout la conozca. */
    sucursal?: string
    buyer: BuyerInfo
    delivery: DeliveryInfo
    items: OrderItem[]
    subtotal: number
    /** IVA */
    tax: number
    shipping: number
    total: number
    status: OrderStatus
    paymentStatus: PaymentStatus
    /** El cliente aceptó los términos y condiciones al comprar. */
    termsAccepted: boolean
    /** Fecha y hora (ISO) en que se registró la aceptación. */
    termsAcceptedAt: string
}