import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { ESTADO_INICIAL, accionesCarrito, carritoReducer } from '../services/carrito'
import { calcularTotales } from '../services/carritoCalculos'
import { guardarCarrito, leerCarrito } from '../services/carritoStorage'
import { combinarLineas, construirClaveProductos, obtenerProductosPorIds } from '../services/carritoProductos'
import { CarritoContext } from './carritoContext'
import type { ValorCarrito } from './carritoContext'
import type { ItemCarritoEnriquecido } from '../types/carrito'

/**
 * Proveedor del carrito.
 *
 * Es el único lugar de la aplicación donde se mezclan las tres fuentes de
 * información del carrito: el estado en memoria, lo guardado en localStorage y
 * los datos del catálogo. Los componentes solo reciben el resultado por
 * contexto y nunca coordinan nada entre sí.
 *
 * Este archivo se mantiene separado del contexto porque la regla
 * react-refresh/only-export-components impide exportar desde el mismo módulo un
 * componente y un hook.
 */
export function CarritoProvider({ children }: PropsWithChildren) {
  const [estado, dispatch] = useReducer(carritoReducer, ESTADO_INICIAL)

  // Datos devueltos por la última consulta al índice, y el conjunto de
  // productos que esos datos describen. Guardar la clave resuelta es lo que
  // permite distinguir "todavía no consulté" de "consulté y el producto no
  // existe": en ambos casos hay líneas sin precio, pero solo en el primero hay
  // algo pendiente por resolver.
  const [resolucion, setResolucion] = useState<ItemCarritoEnriquecido[]>([])
  const [claveResuelta, setClaveResuelta] = useState('')
  const [error, setError] = useState<string | null>(null)

  // La consulta solo se dispara si alguien la pide, para no gastar una búsqueda
  // del índice en cada carga del catálogo.
  const [consultaActiva, setConsultaActiva] = useState(false)

  // Espejo de las líneas actuales para que el efecto de consulta pueda leerlas
  // sin depender de ellas.
  const itemsRef = useRef(estado.items)

  // Se declara antes que los demás efectos a propósito: React los ejecuta en
  // orden, así que este efecto garantiza que la consulta de este commit ya
  // encuentre las líneas recién despachadas.
  useEffect(() => {
    itemsRef.current = estado.items
  })

  // Recupera el carrito guardado. Solo corre al montar, y el reducer devuelve
  // el mismo estado si recibe la acción dos veces, así que es seguro que
  // React lo ejecute dos veces en desarrollo.
  useEffect(() => {
    dispatch(accionesCarrito.hidratar(leerCarrito()))
  }, [])

  // Persiste los cambios, pero nunca antes de terminar la hidratación: sin esta
  // protección, el primer render escribiría un carrito vacío sobre el guardado.
  useEffect(() => {
    if (!estado.hidratado) return

    guardarCarrito(estado.items)
  }, [estado.items, estado.hidratado])

  // La clave ignora las cantidades a propósito, así que cambiar una cantidad no
  // vuelve a consultar el índice: los precios que ya tenemos siguen siendo
  // válidos y la cantidad se recombina en memoria.
  const clave = construirClaveProductos(estado.items)

  useEffect(() => {
    if (!estado.hidratado || !consultaActiva) return

    const items = itemsRef.current

    if (items.length === 0) {
      setResolucion([])
      setClaveResuelta('')
      setError(null)
      return
    }

    // Si el carrito cambia mientras la petición está en vuelo, la respuesta
    // que llegue corresponde a un conjunto de productos que ya no es el actual.
    let vigente = true

    setError(null)

    obtenerProductosPorIds(items)
      .then((resultado) => {
        if (!vigente) return

        setResolucion(resultado)
        setClaveResuelta(clave)
      })
      .catch((fallo: unknown) => {
        if (!vigente) return

        // La clave resuelta no se actualiza: las líneas siguen sin precio, y
        // eso junto con el error es lo que la interfaz necesita para no
        // mostrar productos como desaparecidos cuando el problema fue la red.
        setError(
          fallo instanceof Error
            ? fallo.message
            : 'No se pudieron consultar los productos del carrito.',
        )
      })

    return () => {
      vigente = false
    }
  }, [clave, estado.hidratado, consultaActiva])

  // La cantidad de cada línea sale del reducer, no de la respuesta consultada.
  const itemsEnriquecidos = useMemo(
    () => combinarLineas(estado.items, resolucion),
    [estado.items, resolucion],
  )

  const totales = useMemo(() => calcularTotales(itemsEnriquecidos), [itemsEnriquecidos])

  // Hay líneas sin resolver mientras la respuesta en estado no describa el
  // conjunto actual. El error apaga la señal de carga: si la consulta falló, no
  // se está cargando nada.
  const pendiente = estado.items.length > 0 && claveResuelta !== clave
  const cargando = consultaActiva && pendiente && error === null

  const agregar = useCallback((objectID: string, cantidad = 1) => {
    dispatch(accionesCarrito.agregar(objectID, cantidad))
  }, [])

  const cambiarCantidad = useCallback((objectID: string, cantidad: number) => {
    dispatch(accionesCarrito.cambiarCantidad(objectID, cantidad))
  }, [])

  const eliminar = useCallback((objectID: string) => {
    dispatch(accionesCarrito.eliminar(objectID))
  }, [])

  const vaciar = useCallback(() => {
    dispatch(accionesCarrito.vaciar())
  }, [])

  const activarConsulta = useCallback(() => {
    setConsultaActiva(true)
  }, [])

  const valor = useMemo<ValorCarrito>(
    () => ({
      items: itemsEnriquecidos,
      totales,
      cargando,
      error,
      agregar,
      cambiarCantidad,
      eliminar,
      vaciar,
      activarConsulta,
    }),
    [
      itemsEnriquecidos,
      totales,
      cargando,
      error,
      agregar,
      cambiarCantidad,
      eliminar,
      vaciar,
      activarConsulta,
    ],
  )

  return <CarritoContext.Provider value={valor}>{children}</CarritoContext.Provider>
}