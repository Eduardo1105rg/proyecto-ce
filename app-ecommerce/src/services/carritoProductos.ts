import { INDEX_MAIN, escapeFilterValue, searchClient } from './Algolia'
import { crearLineId } from './carrito'
import { crearMapaStock, leerInventarioOverrides } from './inventario'
import { calcularCantidadesPorProducto, resolverPrecio } from './precios'
import { nombreSucursal, obtenerSucursal } from '../data/sucursales'
import type {
  ItemCarrito,
  ItemCarritoEnriquecido,
  ProductoCarritoResuelto,
} from '../types/carrito'
import type { B2BPriceTier, StockBranch } from '../types/product'
import type { Rol } from '../types/usuario'

export const MAX_PRODUCTOS_POR_CONSULTA = 1000

type HitProducto = {
  objectID: string
  name?: string
  price?: number
  image?: string
  facets?: { free_shipping?: boolean }
  tiered_b2b_pricing?: B2BPriceTier[]
  stock_by_branch?: StockBranch[]
}

export function construirClaveProductos(items: ItemCarrito[]): string {
  return [...new Set(items.map((item) => item.objectID))].sort().join(',')
}

export function construirFiltroIds(ids: string[]): string {
  return ids.map((id) => `objectID:"${escapeFilterValue(id)}"`).join(' OR ')
}

export async function obtenerProductosPorIds(
  items: ItemCarrito[],
): Promise<ProductoCarritoResuelto[]> {
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
        attributesToRetrieve: [
          'objectID',
          'name',
          'price',
          'image',
          'facets.free_shipping',
          'tiered_b2b_pricing',
          'stock_by_branch',
        ],
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

  const overrides = leerInventarioOverrides()

  return consultables.map((objectID) => {
    const hit = porId.get(objectID)
    const stockPorSucursal = crearMapaStock(objectID, hit?.stock_by_branch, overrides)

    if (!hit) {
      return {
        objectID,
        titulo: '',
        precioB2C: 0,
        preciosB2B: [],
        imagen: '',
        noDisponible: true,
        envioGratis: false,
        stockPorSucursal,
      }
    }

    return {
      objectID,
      titulo: typeof hit.name === 'string' && hit.name.trim() !== '' ? hit.name : '',
      precioB2C: typeof hit.price === 'number' && Number.isFinite(hit.price) ? hit.price : 0,
      preciosB2B: Array.isArray(hit.tiered_b2b_pricing) ? hit.tiered_b2b_pricing : [],
      imagen: typeof hit.image === 'string' ? hit.image : '',
      noDisponible: false,
      envioGratis: hit.facets?.free_shipping === true,
      stockPorSucursal,
    }
  })
}

export function combinarLineas(
  items: ItemCarrito[],
  resolucion: ProductoCarritoResuelto[],
  rol: Rol | null,
): ItemCarritoEnriquecido[] {
  const porId = new Map(resolucion.map((producto) => [producto.objectID, producto]))
  const cantidades = calcularCantidadesPorProducto(items)

  return items.map((item) => {
    const resuelta = porId.get(item.objectID)
    const branch = obtenerSucursal(item.branchId)
    const lineId = crearLineId(item.objectID, item.branchId)
    const cantidadTotalProducto = cantidades.get(item.objectID) ?? item.cantidad
    const stockPorSucursal = resuelta?.stockPorSucursal ?? {}
    const stockSucursal = stockPorSucursal[item.branchId] ?? 0
    const branchName = branch?.nombre ?? nombreSucursal(item.branchId)

    if (!resuelta) {
      return {
        objectID: item.objectID,
        branchId: item.branchId,
        cantidad: item.cantidad,
        lineId,
        titulo: '',
        precio: 0,
        precioB2C: 0,
        precioB2BReferencia: null,
        tipoPrecio: 'B2C',
        minimoB2B: 0,
        cumpleMinimoB2B: true,
        cantidadTotalProducto,
        errorCondicion: null,
        imagen: '',
        noDisponible: true,
        stockSucursal,
        stockInsuficiente: false,
        stockPorSucursal,
        branchName,
        envioGratis: false,
      }
    }

    const precio = resolverPrecio(
      { price: resuelta.precioB2C, tiered_b2b_pricing: resuelta.preciosB2B },
      rol,
      cantidadTotalProducto,
    )
    const noDisponible = resuelta.noDisponible || branch === null

    return {
      objectID: item.objectID,
      branchId: item.branchId,
      cantidad: item.cantidad,
      lineId,
      titulo: resuelta.titulo,
      precio: precio.precioUnitario,
      precioB2C: precio.precioB2C,
      precioB2BReferencia: precio.precioB2BReferencia,
      tipoPrecio: precio.tipo,
      minimoB2B: precio.minimoB2B,
      cumpleMinimoB2B: precio.cumpleMinimoB2B,
      cantidadTotalProducto,
      errorCondicion: precio.errorCondicion,
      imagen: resuelta.imagen,
      noDisponible,
      stockSucursal,
      stockInsuficiente: !noDisponible && stockSucursal < item.cantidad,
      stockPorSucursal,
      branchName,
      envioGratis: resuelta.envioGratis,
    }
  })
}
