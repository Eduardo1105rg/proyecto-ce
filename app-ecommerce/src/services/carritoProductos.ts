import { INDEX_MAIN, escapeFilterValue, searchClient } from './Algolia'
import type { ItemCarrito, ItemCarritoEnriquecido } from '../types/carrito'


export const MAX_PRODUCTOS_POR_CONSULTA = 1000


type HitProducto = {
  objectID: string
  name?: string
  price?: number
  image?: string
}


export function construirClaveProductos(items: ItemCarrito[]): string {
  return items.map((item) => item.objectID).sort().join(',')
}

export function construirFiltroIds(ids: string[]): string {
  return ids.map((id) => `objectID:"${escapeFilterValue(id)}"`).join(' OR ')
}

export async function obtenerProductosPorIds(
  items: ItemCarrito[],
): Promise<ItemCarritoEnriquecido[]> {
  if (items.length === 0) return []

  const idsUnicos = [...new Set(items.map((item) => item.objectID))]
  const consultables = idsUnicos.slice(0, MAX_PRODUCTOS_POR_CONSULTA)

  if (idsUnicos.length > MAX_PRODUCTOS_POR_CONSULTA) {
    console.warn(
      `[carrito] el carrito tiene ${idsUnicos.length} productos y solo se consultarán los primeros ${MAX_PRODUCTOS_POR_CONSULTA}.`,
    )
  }

  const { results } = await searchClient.search<HitProducto>({
    requests: [
      {
        indexName: INDEX_MAIN,
        query: '',
        filters: construirFiltroIds(consultables),

        hitsPerPage: consultables.length,
        attributesToRetrieve: ['objectID', 'name', 'price', 'image'],
      },
    ],
  })

  const respuesta = results[0]

  if (!respuesta || !('hits' in respuesta)) {
    throw new Error('Algolia no devolvió hits para la consulta del carrito')
  }

  const porId = new Map<string, HitProducto>()

  for (const hit of respuesta.hits) {
    if (hit && typeof hit.objectID === 'string') {
      porId.set(hit.objectID, hit)
    }
  }

  return items.map((item) => {
    const hit = porId.get(item.objectID)

    if (!hit) {
      return {
        objectID: item.objectID,
        cantidad: item.cantidad,
        titulo: '',
        precio: 0,
        imagen: '',
        noDisponible: true,
      }
    }

    const precio = typeof hit.price === 'number' && Number.isFinite(hit.price) ? hit.price : 0

    return {
      objectID: item.objectID,
      titulo: typeof hit.name === 'string' && hit.name.trim() !== '' ? hit.name : '',
      cantidad: item.cantidad,
      precio,
      imagen: typeof hit.image === 'string' ? hit.image : '',
      // El hit existe, así que el producto está disponible aunque su precio
      // sea 0. Un producto gratuito no es un producto desaparecido.
      noDisponible: false,
    }
  })
}


export function combinarLineas(
  items: ItemCarrito[],
  resolucion: ItemCarritoEnriquecido[],
): ItemCarritoEnriquecido[] {
  const porId = new Map(resolucion.map((linea) => [linea.objectID, linea]))

  return items.map((item) => {
    const resuelta = porId.get(item.objectID)

    return {
      objectID: item.objectID,
      cantidad: item.cantidad,
      titulo: resuelta?.titulo ?? '',
      precio: resuelta?.precio ?? 0,
      imagen: resuelta?.imagen ?? '',
      noDisponible: resuelta?.noDisponible ?? true,
    }
  })
}