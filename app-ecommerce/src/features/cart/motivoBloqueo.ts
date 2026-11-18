import type { ItemCarritoEnriquecido } from '../../types/carrito'

export function motivoBloqueoCompra(
    items: ItemCarritoEnriquecido[],
    hayFaltantesB2B: boolean,
): string | undefined {
    if (items.some((item) => item.noDisponible)) {
        return 'Quite los productos no disponibles para continuar.'
    }

    if (items.some((item) => item.stockInsuficiente)) {
        return 'Ajuste las cantidades al stock de la sucursal.'
    }

    if (hayFaltantesB2B) {
        return 'Complete el mínimo B2B de cada producto para continuar.'
    }

    return undefined
}