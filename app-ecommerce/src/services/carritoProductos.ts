import { INDEX_MAIN, escapeFilterValue, searchClient } from './Algolia'
import type { ItemCarrito, ItemCarritoEnriquecido } from '../types/carrito'

/**
 * Máximo de productos que Algolia devuelve en una sola respuesta.
 *
 * Es el techo de hitsPerPage. Superarlo no es un caso realista para un
 * carrito, pero el módulo lo maneja en vez de asumir que nunca pasa.
 */
export const MAX_PRODUCTOS_POR_CONSULTA = 1000

/**
 * Subconjunto del registro que el carrito necesita.
 *
 * Todos los campos son opcionales a propósito: un registro mal indexado no
 * debe romper la resolución del carrito completo.
 */
type HitProducto = {
  objectID: string
  name?: string
  price?: number
  image?: string
}

/**
 * Construye la clave que identifica al conjunto de productos del carrito.
 *
 * Las cantidades quedan fuera a propósito: cambiar cantidades no cambia qué
 * productos hay, así que el precio y la imagen siguen siendo válidos y no hay
 * motivo para volver a consultar.
 *
 * El orden se ignora porque no es información: agregar y quitar productos
 * puede reordenar el arreglo sin que cambie el conjunto. Si no se ordenara,
 * dos carritos con los mismos productos en distinto orden pedirían recursos
 * distintos y la caché no serviría de nada.
 *
 * El carrito vacío produce una cadena vacía, que es una clave válida.
 */
export function construirClaveProductos(items: ItemCarrito[]): string {
  return items.map((item) => item.objectID).sort().join(',')
}

/**
 * Arma el filtro de Algolia que recupera varios productos por su objectID.
 *
 * La cadena con OR es la estrategia elegida porque es la más flexible: se
 * puede combinar con otros filtros y no exige declarar objectID para faceting,
 * ya que Algolia siempre permite filtrar por ese atributo.
 */
export function construirFiltroIds(ids: string[]): string {
  return ids.map((id) => `objectID:"${escapeFilterValue(id)}"`).join(' OR ')
}

/**
 * Resuelve los datos de los productos del carrito contra Algolia.
 *
 * Devuelve un arreglo con la misma cantidad de elementos y en el mismo orden
 * que items, para que la interfaz pueda recorrer los dos en paralelo. Cada
 * línea queda marcada en noDisponible si su producto ya no existe en el
 * índice, conservando su cantidad.
 *
 * Un fallo de red o de Algolia se propaga al llamador en vez de convertirse
 * en líneas marcadas como no disponibles. La distinción importa: si la
 * petición falla, el producto sigue existiendo y marcarlo como no disponible
 * le diría al usuario que sus productos desaparecieron cuando lo que pasó es
 * que no hubo respuesta.
 *
 * El nombre y el precio siempre provienen de Algolia, que es la fuente de
 * verdad. El carrito no guarda copia del nombre, así que una línea sin nombre
 * en el índice queda con título vacío en vez de inventar uno: la interfaz
 * decide el texto con el que se muestra.
 *
 * El campo de imagen se devuelve tal cual, sin construir la URL. El catálogo
 * lo resuelve con `/images/${image}`, y devolver el valor crudo permite que el
 * carrito use exactamente la misma convención sin duplicar la lógica.
 */
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
        // Debe cubrir la cantidad de IDs consultados. Si se dejara el valor
        // por defecto, un carrito de más de 20 productos marcaría el resto
        // como no disponibles solo porque la respuesta vino truncada.
        hitsPerPage: consultables.length,
        attributesToRetrieve: ['objectID', 'name', 'price', 'image'],
      },
    ],
  })

  const respuesta = results[0]

  // SearchResult es una unión: el mismo método también sirve búsquedas de
  // facets. Se estrecha por la propiedad en vez de castear a ciegas.
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

/**
 * Combina las líneas del carrito con los datos resueltos de Algolia.
 *
 * Existe porque la consulta a Algolia no se repite cuando cambia una cantidad:
 * la clave de caché cubre solo los identificadores, ya que los precios siguen
 * siendo válidos. Eso obliga a separar lo que se guarda de lo que se resuelve.
 *
 * La cantidad siempre se toma del carrito, nunca de la respuesta consultada.
 * Si se usara la de la respuesta, cambiar una cantidad dejaría la línea
 * mostrando el valor anterior hasta que se volviera a consultar el índice.
 *
 * Cada campo se escribe de forma explícita en vez de extender el objeto de
 * entrada, para que un campo sobrante de un carrito guardado con una versión
 * anterior del esquema no termine filtrándose al resultado.
 */
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