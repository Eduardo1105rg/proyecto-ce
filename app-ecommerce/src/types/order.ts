import type { TipoPrecio } from './precios'
import type { SucursalOrden } from './sucursal'
import type { Empresa, Rol } from './usuario'

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
    branchId: string
    branchName: string
    /** Instantánea del stock consultado al momento de la compra. */
    stockAtPurchase: number
    pricingType: TipoPrecio
    unitPrice: number
    /** Precio B2B de referencia cuando el precio aplicado fue B2C. */
    b2bReferencePrice?: number
    quantity: number
    subtotal: number
}

export type CondicionComercial = {
    tipo: 'ESTANDAR' | 'CANTIDAD_MINIMA'
    minimo: number
}

export type Order = {
    /** Ejemplo: MB-20261015-0001 - MB-YYYYMMDD-NNNN */
    orderNumber: string
    createdAt: string
    /** Usuario autenticado que realizó la compra. */
    usuarioId?: string
    /** Rol del usuario al momento de la compra. */
    rol?: Rol
    /** Empresa B2B congelada al momento de la compra. */
    empresa?: Empresa
    buyer: BuyerInfo
    delivery: DeliveryInfo
    items: OrderItem[]
    /** Sucursales involucradas en la compra. */
    sucursales: SucursalOrden[]
    condicionComercial: CondicionComercial
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
