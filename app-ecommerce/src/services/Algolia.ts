import { liteClient as algoliasearch } from 'algoliasearch/lite'

import type {
    FiltrosDisponibles,
    ParametrosBusqueda,
    ResultadoBusquedaProductos,
} from '../types/algolia'
import type { Product } from '../types/product'

const appId = import.meta.env.VITE_ALGOLIA_APP_ID
const searchKey = import.meta.env.VITE_ALGOLIA_SEARCH_KEY

if (!appId) {
    throw new Error("VITE_ALGOLIA_APP_ID no está configurado")
}

if (!searchKey) {
    throw new Error("VITE_ALGOLIA_SEARCH_KEY no está configurado")
}

/**
 * Nombres de los indices de Algolia leidos desde variables de entorno.
 * INDEX_MAIN es el indice principal por relevancia.
 * INDEX_PRICE_ASC y INDEX_PRICE_DESC son replicas configuradas en Algolia
 * para ordenar por precio ascendente y descendente respectivamente.
 */
export const INDEX_MAIN = import.meta.env.VITE_ALGOLIA_INDEX_MAIN
export const INDEX_PRICE_ASC = import.meta.env.VITE_ALGOLIA_INDEX_PRICE_ASC
export const INDEX_PRICE_DESC = import.meta.env.VITE_ALGOLIA_INDEX_PRICE_DESC

/** Opciones de ordenamiento disponibles en el FilterPanel */
export const SORT_OPTIONS = [
    { label: 'Relevancia', value: INDEX_MAIN },
    { label: 'Precio: menor a mayor', value: INDEX_PRICE_ASC },
    { label: 'Precio: mayor a menor', value: INDEX_PRICE_DESC },
]

const HITS_PER_PAGE = 20
const RELATED_HITS_PER_PAGE = 8

/**
 * Lista de atributos de facets habilitados para filtrar en Algolia.
 * Deben coincidir exactamente con los atributos configurados como
 * "Attributes for faceting" en el dashboard de Algolia.
 */
export const FACET_ATTRIBUTES = [
    'brand',
    'category',
    'payment_methods',
    'facets.color',
    'facets.eco_friendly',
    'facets.free_shipping',
    'facets.material',
    'facets.style',
    'facets.subcategory',
    'facets.tax_exempt',
]

/** Forma minima de un hit devuelto por Algolia */
type AlgoliaHit = Record<string, unknown> & { objectID: string }

/** Estructura de la respuesta de Algolia normalizada para uso interno */
type SearchResponse = {
    hits: AlgoliaHit[]
    nbHits?: number
    page?: number
    nbPages?: number
    facets?: Record<string, Record<string, number>>
}

/** Cliente de Algolia inicializado con las credenciales del proyecto */
export const searchClient = algoliasearch(appId, searchKey)

/**
 * Escapa caracteres especiales en valores de filtro para evitar
 * errores de sintaxis en las queries de Algolia.
 * Escapa backslashes primero para no doble-escapar las comillas.
 */
function escapeFilterValue(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

/**
 * Construye el arreglo de filtros numericos de precio para Algolia.
 * Solo agrega las condiciones cuyos valores no son null o undefined.
 */
function buildNumericFilters(priceRange?: [number, number] | null): string[] {
    const filters: string[] = []
    if (priceRange?.[0] != null) filters.push(`price >= ${priceRange[0]}`)
    if (priceRange?.[1] != null) filters.push(`price <= ${priceRange[1]}`)
    return filters
}

/**
 * Convierte el mapa de filtros activos al formato de facetFilters de Algolia.
 *
 * El formato es un arreglo de arreglos donde:
 * - El arreglo externo representa condiciones AND (entre atributos).
 * - Cada arreglo interno representa condiciones OR (dentro del mismo atributo).
 *
 * Retorna undefined si no hay filtros activos para no enviar el parametro.
 */
function buildFacetFilters(
    filters?: Record<string, string[]>
): string[][] | undefined {
    const entries = Object.entries(filters ?? {}).filter(([, values]) => values.length > 0)

    if (entries.length === 0) return undefined

    return entries.map(([attribute, values]) =>
        values.map((value) => `${attribute}:${escapeFilterValue(value)}`)
    )
}

/**
 * Normaliza un hit de Algolia al tipo Product usado en la aplicacion.
 * Agrega object_id como alias de objectID para compatibilidad con
 * los componentes que usan una u otra propiedad.
 */
function normalizeHit(hit: AlgoliaHit): Product {
    const { objectID, ...rest } = hit

    return {
        ...rest,
        objectID,
        object_id: objectID,
    } as Product
}

/**
 * Abstraccion interna para ejecutar una busqueda en un indice especifico.
 * Envuelve el formato de peticion multiple de Algolia en una interfaz
 * mas simple de un solo indice.
 */
async function searchSingleIndex(
    indexName: string,
    searchParams: Record<string, unknown>
): Promise<SearchResponse> {
    const response = await searchClient.search({
        requests: [{ indexName, ...searchParams }],
    })

    return response.results[0] as SearchResponse
}

/**
 * Busca productos en Algolia aplicando todos los filtros activos.
 *
 * Acepta query de texto, pagina (base 0), rango de precio,
 * filtros de facets y el indice a usar para el ordenamiento.
 * Retorna los productos normalizados, el total de resultados
 * y la cantidad de paginas.
 */
export async function buscarProductos(
    params: ParametrosBusqueda = {}
): Promise<ResultadoBusquedaProductos> {
    const {
        query = '',
        page = 0,
        hitsPerPage = HITS_PER_PAGE,
        indexName = INDEX_MAIN,
        priceRange,
        filters,
    } = params

    const response = await searchSingleIndex(indexName, {
        query,
        page,
        hitsPerPage,
        numericFilters: buildNumericFilters(priceRange),
        facetFilters: buildFacetFilters(filters),
        attributesToRetrieve: ['*'],
    })

    return {
        products: response.hits.map(normalizeHit),
        total: response.nbHits ?? 0,
        page: response.page ?? page,
        totalPages: response.nbPages ?? 1,
    }
}

/**
 * Obtiene los valores y conteos disponibles para cada facet
 * dado el query y rango de precio activos.
 *
 * Usa hitsPerPage: 0 para no traer productos, solo los facets.
 * Estos datos alimentan las secciones del FilterPanel en CatalogPage.
 */
export async function getFiltrosDisponibles(
    params: { query?: string; priceRange?: [number, number] | null } = {}
): Promise<FiltrosDisponibles[]> {
    const { query = '', priceRange } = params

    const response = await searchSingleIndex(INDEX_MAIN, {
        query,
        hitsPerPage: 0,
        facets: FACET_ATTRIBUTES,
        numericFilters: buildNumericFilters(priceRange),
    })

    return Object.entries(response.facets ?? {}).map(
        ([attribute, values]) => ({
            attribute,
            values: Object.entries(values).map(([value, count]) => ({
                value,
                count,
            })),
        })
    )
}

/**
 * Obtiene el precio maximo entre todos los productos del indice.
 * Usa hitsPerPage: 1000 recuperando solo el campo price para minimizar
 * el peso de la respuesta. Se usa como referencia para el placeholder
 * del filtro de precio en el FilterPanel.
 * Retorna undefined si no hay productos con precio.
 */
export async function getMaxPrice(): Promise<number | undefined> {
    const response = await searchSingleIndex(INDEX_MAIN, {
        query: '',
        hitsPerPage: 1000,
        attributesToRetrieve: ['price'],
    })

    const prices = response.hits
        .map((hit) => hit.price as number | undefined)
        .filter((price): price is number => !!price)

    return prices.length > 0 ? Math.max(...prices) : undefined
}

/**
 * Busca un producto por su objectID exacto usando un filtro de texto.
 * Retorna el producto normalizado o null si no existe.
 */
export async function getProductById(id: string): Promise<Product | null> {
    const response = await searchSingleIndex(INDEX_MAIN, {
        query: '',
        filters: `objectID:"${escapeFilterValue(id)}"`,
        hitsPerPage: 1,
        attributesToRetrieve: ['*'],
    })

    const hit = response.hits[0]
    return hit ? normalizeHit(hit) : null
}

/**
 * Obtiene productos relacionados al producto dado.
 * Filtra por la misma categoria excluyendo el producto actual via NOT objectID.
 * Retorna hasta RELATED_HITS_PER_PAGE (8) productos normalizados.
 */
export async function getRelatedProducts(product: Product): Promise<Product[]> {
    const objectId = product.objectID ?? product.object_id

    const response = await searchSingleIndex(INDEX_MAIN, {
        query: '',
        filters: `category:"${escapeFilterValue(product.category)}" AND NOT objectID:"${escapeFilterValue(objectId)}"`,
        hitsPerPage: RELATED_HITS_PER_PAGE,
        attributesToRetrieve: ['*'],
    })

    return response.hits.map(normalizeHit)
}