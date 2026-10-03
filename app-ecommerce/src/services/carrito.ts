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

/**
 * Reducer del carrito.
 *
 * Función pura: no toca localStorage, no consulta Algolia y no usa React.
 * Recibe el estado y una acción, y devuelve el estado siguiente.
 *
 * Dos decisiones que conviene tener presentes al leerlo:
 *
 * - Las acciones sobre un objectID que no está en el carrito devuelven el mismo
 *   estado en vez de lanzar. Un doble clic rápido o un dispatch desfasado no
 *   debe romper la aplicación, y devolver la misma referencia además deja que
 *   React omita el re-render.
 *
 * - La única identidad de una línea es su objectID. El reducer solo lleva
 *   cuentas de identificadores y cantidades: no sabe qué nombre ni qué precio
 *   tiene un producto, y por eso nunca puede quedar desincronizado con el
 *   catálogo.
 */
export function carritoReducer(estado: EstadoCarrito, accion: AccionCarrito): EstadoCarrito {
  switch (accion.type) {
    case 'HIDRATAR': {
      return { items: accion.items, hidratado: true }
    }

    case 'AGREGAR': {
      const cantidad = sanearCantidad(accion.cantidad)
      const indice = estado.items.findIndex((item) => item.objectID === accion.objectID)

      if (indice === -1) {
        return {
          ...estado,
          items: [...estado.items, { objectID: accion.objectID, cantidad }],
        }
      }

      const items = [...estado.items]
      items[indice] = { ...items[indice], cantidad: items[indice].cantidad + cantidad }

      return { ...estado, items }
    }

    case 'CAMBIAR_CANTIDAD': {
      const indice = estado.items.findIndex((item) => item.objectID === accion.objectID)
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

    case 'ELIMINAR': {
      if (!estado.items.some((item) => item.objectID === accion.objectID)) return estado

      return {
        ...estado,
        items: estado.items.filter((item) => item.objectID !== accion.objectID),
      }
    }

    case 'VACIAR': {
      if (estado.items.length === 0) return estado

      return { ...estado, items: [] }
    }
  }
}

/**
 * Constructores de acciones del carrito.
 *
 * Evitan que las cadenas de type queden repetidas por toda la aplicación, que
 * es la forma más fácil de que un typo se convierta en un bug silencioso.
 */
export const accionesCarrito = {
  hidratar: (items: ItemCarrito[]): AccionCarrito => ({ type: 'HIDRATAR', items }),

  agregar: (objectID: string, cantidad: number): AccionCarrito => ({
    type: 'AGREGAR',
    objectID,
    cantidad,
  }),

  cambiarCantidad: (objectID: string, cantidad: number): AccionCarrito => ({
    type: 'CAMBIAR_CANTIDAD',
    objectID,
    cantidad,
  }),

  eliminar: (objectID: string): AccionCarrito => ({ type: 'ELIMINAR', objectID }),

  vaciar: (): AccionCarrito => ({ type: 'VACIAR' }),
}