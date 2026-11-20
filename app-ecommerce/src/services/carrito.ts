import type { AccionCarrito, EstadoCarrito, ItemCarrito } from '../types/carrito'

/**
 * Estado inicial del carrito.
 *
 * arranca con hidratado en false: todavía no se leyó localStorage, así que
 * no se puede escribir nada al almacenamiento.
 */
export const ESTADO_INICIAL: EstadoCarrito = {
  items: [],
  hidratado: false,
}

export function crearLineId(objectID: string, branchId: string): string {
  return `${objectID}::${branchId}`
}

/**
 * Redondea hacia abajo y garantiza un mínimo de 1.
 *
 * Se usa solo al agregar. Al cambiar la cantidad, un valor de 0 debe eliminar
 * la línea, y eso lo decide el reducer, no esta función.
 */
function sanearCantidad(cantidad: number): number {
  if (!Number.isFinite(cantidad)) return 1
  return Math.max(Math.floor(cantidad), 1)
}

export function carritoReducer(estado: EstadoCarrito, accion: AccionCarrito): EstadoCarrito {
  switch (accion.type) {
    case 'HIDRATAR': {
      return { items: accion.items, hidratado: true }
    }

    case 'AGREGAR': {
      const cantidad = sanearCantidad(accion.cantidad)
      const lineId = crearLineId(accion.objectID, accion.branchId)
      const indice = estado.items.findIndex(
        (item) => crearLineId(item.objectID, item.branchId) === lineId,
      )

      if (indice === -1) {
        return {
          ...estado,
          items: [
            ...estado.items,
            { objectID: accion.objectID, branchId: accion.branchId, cantidad },
          ],
        }
      }

      const items = [...estado.items]
      items[indice] = { ...items[indice], cantidad: items[indice].cantidad + cantidad }

      return { ...estado, items }
    }

    case 'CAMBIAR_CANTIDAD': {
      const indice = estado.items.findIndex(
        (item) => crearLineId(item.objectID, item.branchId) === accion.lineId,
      )
      if (indice === -1) return estado

      // Se redondea antes de comparar contra cero para que un 0.5 no termine
      // creando una línea con cantidad 0.
      const cantidad = Number.isFinite(accion.cantidad) ? Math.floor(accion.cantidad) : 0

      if (cantidad <= 0) {
        return { ...estado, items: estado.items.filter((_, i) => i !== indice) }
      }

      const items = [...estado.items]
      items[indice] = { ...items[indice], cantidad }

      return { ...estado, items }
    }

    case 'CAMBIAR_SUCURSAL': {
      const indice = estado.items.findIndex(
        (item) => crearLineId(item.objectID, item.branchId) === accion.lineId,
      )
      if (indice === -1) return estado

      const origen = estado.items[indice]
      if (origen.branchId === accion.branchId) return estado

      const lineIdDestino = crearLineId(origen.objectID, accion.branchId)
      const indiceDestino = estado.items.findIndex(
        (item) => crearLineId(item.objectID, item.branchId) === lineIdDestino,
      )

      if (indiceDestino === -1) {
        const items = [...estado.items]
        items[indice] = { ...origen, branchId: accion.branchId }
        return { ...estado, items }
      }

      const destino = estado.items[indiceDestino]
      const items = estado.items
        .filter((_, i) => i !== indice)
        .map((item) =>
          item === destino
            ? { ...item, cantidad: item.cantidad + origen.cantidad }
            : item,
        )

      return { ...estado, items }
    }

    case 'ELIMINAR': {
      const existe = estado.items.some(
        (item) => crearLineId(item.objectID, item.branchId) === accion.lineId,
      )
      if (!existe) return estado

      return {
        ...estado,
        items: estado.items.filter(
          (item) => crearLineId(item.objectID, item.branchId) !== accion.lineId,
        ),
      }
    }

    case 'VACIAR': {
      if (estado.items.length === 0) return estado

      return { ...estado, items: [] }
    }
  }
}

export const accionesCarrito = {
  hidratar: (items: ItemCarrito[]): AccionCarrito => ({ type: 'HIDRATAR', items }),

  agregar: (objectID: string, branchId: string, cantidad: number): AccionCarrito => ({
    type: 'AGREGAR',
    objectID,
    branchId,
    cantidad,
  }),

  cambiarCantidad: (lineId: string, cantidad: number): AccionCarrito => ({
    type: 'CAMBIAR_CANTIDAD',
    lineId,
    cantidad,
  }),

  cambiarSucursal: (lineId: string, branchId: string): AccionCarrito => ({
    type: 'CAMBIAR_SUCURSAL',
    lineId,
    branchId,
  }),

  eliminar: (lineId: string): AccionCarrito => ({ type: 'ELIMINAR', lineId }),

  vaciar: (): AccionCarrito => ({ type: 'VACIAR' }),
}
