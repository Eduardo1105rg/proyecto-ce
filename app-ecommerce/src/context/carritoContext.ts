import { createContext, useContext } from 'react'
import type { ItemCarritoEnriquecido, TotalesCarrito } from '../types/carrito'

/**
 * API pública del carrito.
 *
 * Se expone a la interfaz completa, pero las líneas ya vienen resueltas: el
 * Provider se encarga de consultar Algolia y de entregar datos utilizables,
 * de modo que ningún componente tenga que consultar el índice por su cuenta.
 *
 * La cantidad es opcional al agregar porque agregar un producto desde el
 * catálogo es la operación más común y casi siempre es de una unidad.
 */
export type ValorCarrito = {
  /**
   * Líneas del carrito con los datos del catálogo ya resueltos.
   *
   * Mientras cargando sea true, una línea puede venir sin precio y con
   * noDisponible, aunque el producto sí exista: lo que falta es la respuesta
   * del índice. La interfaz debe mostrar un estado de carga en ese caso, y no
   * interpretar la bandera como que el producto desapareció.
   */
  items: ItemCarritoEnriquecido[]
  /** Resumen de compra, recalculado en cada cambio. */
  totales: TotalesCarrito
  /** true mientras hay una consulta al índice en curso. */
  cargando: boolean
  /** Mensaje del último fallo al consultar productos, o null si no hubo. */
  error: string | null
  /**
   * Agrega un producto por su identificador.
   *
   * No recibe el nombre ni el precio porque ninguno de los dos se guarda: se
   * consultan del índice. Si el producto ya está en el carrito, se le suma la
   * cantidad en vez de crear una línea repetida.
   */
  agregar: (objectID: string, cantidad?: number) => void
  /** Fija la cantidad de una línea. Un valor menor o igual a 0 la elimina. */
  cambiarCantidad: (objectID: string, cantidad: number) => void
  /** Quita una línea del carrito. */
  eliminar: (objectID: string) => void
  /** Vacía el carrito por completo. */
  vaciar: () => void
  /**
   * Pide que se consulten los productos del carrito.
   *
   * La consulta es perezosa a propósito: cargar el catálogo no necesita los
   * precios del carrito, así que no se consume una búsqueda hasta que alguien
   * abre el carrito. Es idempotente, se puede llamar en cada render sin
   * consequence alguna.
   */
  activarConsulta: () => void
}

/**
 * Contexto del carrito.
 *
 * Vive en un archivo propio, separado del Provider, porque la regla
 * react-refresh/only-export-components rechaza un módulo que exporte a la vez
 * un componente y un hook. Acá no hay ningún componente, así que la regla no
 * se activa y ambos archivos pueden seguir la convención de nombres del resto
 * del proyecto.
 *
 * El valor por defecto es null a propósito: permite distinguir el carrito sin
 * Provider de uno que sí lo tiene, y responder con un error claro.
 */
export const CarritoContext = createContext<ValorCarrito | null>(null)

/**
 * Acceso al carrito desde cualquier componente.
 *
 * Lanza fuera del Provider en lugar de devolver null, porque un null
 * terminado en un error de lectura atribuido a los datos en lugar de a la
 * causa real. El error dice exactamente qué falta montar.
 */
export function useCarrito(): ValorCarrito {
  const valor = useContext(CarritoContext)

  if (valor === null) {
    throw new Error(
      'useCarrito debe usarse dentro de un <CarritoProvider>. Revisa que el Provider envuelva la aplicación en App.tsx.',
    )
  }

  return valor
}