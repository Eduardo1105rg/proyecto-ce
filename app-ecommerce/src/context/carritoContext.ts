import { createContext, useContext } from 'react'
import type { ItemCarritoEnriquecido, TotalesCarrito } from '../types/carrito'
import type { FaltanteB2B } from '../types/precios'

/**
 * API pública del carrito.
 *
 * Se expone a la interfaz completa, pero las líneas ya vienen resueltas: el
 * Provider se encarga de consultar Algolia y de entregar datos utilizables,
 * de modo que ningún componente tenga que consultar el índice por su cuenta.
 *
 * Cada línea se identifica con `objectID::branchId`. El mismo producto puede
 * aparecer en varias líneas si se compra en sucursales distintas.
 */
export type ValorCarrito = {
  items: ItemCarritoEnriquecido[]
  /** Resumen de compra, recalculado en cada cambio. */
  totales: TotalesCarrito
  /** true mientras hay una consulta al índice en curso. */
  cargando: boolean
  /** Mensaje del último fallo al consultar productos, o null si no hubo. */
  error: string | null
  /** Productos B2B que todavía no alcanzan la cantidad mínima. */
  faltantesB2B: FaltanteB2B[]
  /** true si el carrito puede pasar al checkout sin bloqueos de negocio. */
  puedeComprar: boolean
  /**
   * Agrega un producto por su identificador y sucursal.
   *
   * El nombre es opcional y solo se usa para la actividad registrada: la línea
   * del carrito no lo guarda, se consulta del índice. Si ya existe una línea
   * para la misma combinación producto/sucursal, se suma la cantidad.
   */
  agregar: (objectID: string, branchId: string, cantidad?: number, nombre?: string) => void
  /** Fija la cantidad de una línea. Un valor menor o igual a 0 la elimina. */
  cambiarCantidad: (lineId: string, cantidad: number) => void
  /** Cambia la sucursal de una línea, fusionándola si ya existe en el destino. */
  cambiarSucursal: (lineId: string, branchId: string) => void
  /** Quita una línea del carrito. */
  eliminar: (lineId: string) => void
  /** Vacía el carrito por completo. */
  vaciar: () => void
  /**
   * Pide que se consulten los productos del carrito.
   *
   * La consulta es perezosa a propósito: cargar el catálogo no necesita los
   * precios del carrito, así que no se consume una búsqueda hasta que alguien
   * abre el carrito. Es idempotente, se puede llamar en cada render sin
   * consecuencia alguna.
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
