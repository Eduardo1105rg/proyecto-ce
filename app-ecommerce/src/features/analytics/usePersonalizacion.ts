import { useEffect, useState } from 'react'
import { INDEX_MAIN, escapeFilterValue, searchClient } from '../../services/Algolia'
import type { Product } from '../../types/product'
import { useAuth } from '../auth/useAuth'
import { obtenerBusquedasRecientes, obtenerVistosRecientes } from './analyticsApi'
import { USUARIO_ANONIMO } from './useAnalytics'

const MAX_PRODUCTOS = 8
const MAX_CATEGORIAS = 3

export type ProductosPersonalizados = {
  productos: Product[]
  cargando: boolean
  error: string | null
}

type HitProducto = Product & { objectID: string }

function filtrarPorIds(ids: string[]): string {
  return ids.map((id) => `objectID:"${escapeFilterValue(id)}"`).join(' OR ')
}

function excluirIds(ids: string[]): string {
  return ids.map((id) => `NOT objectID:"${escapeFilterValue(id)}"`).join(' AND ')
}

function mensajeError(fallo: unknown): string {
  return fallo instanceof Error
    ? fallo.message
    : 'No se pudieron cargar los productos personalizados.'
}

async function consultarProductos(
  query: string,
  filters: string | undefined,
  hitsPerPage: number,
): Promise<Product[]> {
  const { results } = await searchClient.search<HitProducto>({
    requests: [
      {
        indexName: INDEX_MAIN,
        query,
        ...(filters ? { filters } : {}),
        hitsPerPage,
      },
    ],
  })

  const respuesta = results[0]

  if (!respuesta || !('hits' in respuesta)) {
    throw new Error('Algolia no devolvió productos personalizados.')
  }

  return respuesta.hits
}

async function consultarPorIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return []

  const hits = await consultarProductos('', filtrarPorIds(ids), ids.length)
  const porId = new Map(hits.map((hit) => [hit.objectID, hit]))

  return ids
    .map((id) => porId.get(id))
    .filter((producto): producto is HitProducto => producto !== undefined)
}

/** Productos vistos por el usuario activo, del más reciente al más antiguo. */
export function useVistosRecientes(): ProductosPersonalizados {
  const { usuario } = useAuth()
  const usuarioId = usuario?.id ?? USUARIO_ANONIMO
  const [productos, setProductos] = useState<Product[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let vigente = true

    const cargar = async () => {
      const ids = obtenerVistosRecientes(usuarioId)

      return ids.length === 0 ? [] : consultarPorIds(ids)
    }

    cargar()
      .then((resultado) => {
        if (!vigente) return

        setProductos(resultado)
        setError(null)
      })
      .catch((fallo: unknown) => {
        if (!vigente) return

        setProductos([])
        setError(mensajeError(fallo))
      })
      .finally(() => {
        if (vigente) setCargando(false)
      })

    return () => {
      vigente = false
    }
  }, [usuarioId])

  return { productos, cargando, error }
}

/**
 * Recomendaciones a partir de las categorías de los productos vistos y de las
 * últimas búsquedas. Si no hay historial, devuelve productos destacados.
 */
export function useRecomendados(): ProductosPersonalizados {
  const { usuario } = useAuth()
  const usuarioId = usuario?.id ?? USUARIO_ANONIMO
  const [productos, setProductos] = useState<Product[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let vigente = true

    const cargar = async () => {
      const idsVistos = obtenerVistosRecientes(usuarioId)
      const terminos = obtenerBusquedasRecientes(usuarioId)
      const vistos = await consultarPorIds(idsVistos)

      const categorias = [
        ...new Set(vistos.map((producto) => producto.category).filter(Boolean)),
      ].slice(0, MAX_CATEGORIAS)

      const filtros: string[] = []

      if (categorias.length > 0) {
        filtros.push(
          `(${categorias
            .map((categoria) => `category:"${escapeFilterValue(categoria)}"`)
            .join(' OR ')})`,
        )
      }

      if (idsVistos.length > 0) {
        filtros.push(excluirIds(idsVistos))
      }

      const filtro = filtros.length > 0 ? filtros.join(' AND ') : undefined
      const query = categorias.length === 0 && terminos.length > 0 ? terminos[0] : ''

      let resultado = await consultarProductos(query, filtro, MAX_PRODUCTOS)

      if (resultado.length === 0) {
        const exclusion = idsVistos.length > 0 ? excluirIds(idsVistos) : undefined
        resultado = await consultarProductos('', exclusion, MAX_PRODUCTOS)
      }

      return resultado
    }

    cargar()
      .then((resultado) => {
        if (!vigente) return

        setProductos(resultado)
      })
      .catch((fallo: unknown) => {
        if (!vigente) return

        setProductos([])
        setError(mensajeError(fallo))
      })
      .finally(() => {
        if (vigente) setCargando(false)
      })

    return () => {
      vigente = false
    }
  }, [usuarioId])

  return { productos, cargando, error }
}
