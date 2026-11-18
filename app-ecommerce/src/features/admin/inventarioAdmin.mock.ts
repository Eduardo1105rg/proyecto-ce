import { SUCURSALES } from '../../data/sucursales'
import {
    CLAVE_INVENTARIO_OVERRIDES,
    claveInventario,
    leerInventarioOverrides,
    type InventarioOverrides,
} from '../../services/inventario'

// TODO conectar: reemplazar por el guardado real de inventario cuando exista
function escribir(overrides: InventarioOverrides): boolean {
    try {
        localStorage.setItem(CLAVE_INVENTARIO_OVERRIDES, JSON.stringify(overrides))
        return true
    } catch {
        return false
    }
}

export function guardarCambiosStock(
    objectID: string,
    cambios: Record<string, number>,
): boolean {
    const overrides = leerInventarioOverrides()

    for (const [branchId, stock] of Object.entries(cambios)) {
        overrides[claveInventario(objectID, branchId)] = stock
    }

    return escribir(overrides)
}

export function restablecerStockProducto(objectID: string): boolean {
    const overrides = leerInventarioOverrides()

    for (const sucursal of SUCURSALES) {
        delete overrides[claveInventario(objectID, sucursal.id)]
    }

    return escribir(overrides)
}