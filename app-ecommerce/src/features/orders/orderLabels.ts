import type { OrderStatus, PaymentStatus } from '../../types/order'

export const ETIQUETA_ESTADO_ORDEN: Record<OrderStatus, string> = {
    PENDING: 'Pendiente',
    CONFIRMED: 'Confirmada',
    FAILED: 'Fallida',
}

export const ETIQUETA_ESTADO_PAGO: Record<PaymentStatus, string> = {
    PENDING: 'Pago pendiente',
    APPROVED: 'Pago aprobado',
    DECLINED: 'Pago rechazado',
    ERROR: 'Error de pago',
}

export function formatearFechaOrden(fecha: string): string {
    const valor = new Date(fecha)

    if (Number.isNaN(valor.getTime())) return fecha

    return new Intl.DateTimeFormat('es-CR', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(valor)
}
