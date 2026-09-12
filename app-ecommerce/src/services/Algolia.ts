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

export const INDEX_MAIN = import.meta.env.VITE_ALGOLIA_INDEX_MAIN
export const INDEX_PRICE_ASC = import.meta.env.VITE_ALGOLIA_INDEX_PRICE_ASC
export const INDEX_PRICE_DESC = import.meta.env.VITE_ALGOLIA_INDEX_PRICE_DESC

export const SORT_OPTIONS = [
    { label: 'Relevancia', value: INDEX_MAIN },
    { label: 'Precio: menor a mayor', value: INDEX_PRICE_ASC },
    { label: 'Precio: mayor a menor', value: INDEX_PRICE_DESC },
]

const HITS_PER_PAGE = 20
const RELATED_HITS_PER_PAGE = 8

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

type AlgoliaHit = Record<string, unknown> & { objectID: string }

type SearchResponse = {
    hits: AlgoliaHit[]
    nbHits?: number
    page?: number
    nbPages?: number
    facets?: Record<string, Record<string, number>>
}

export const searchClient = algoliasearch(appId, searchKey)

function escapeFilterValue(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function buildNumericFilters(priceRange?: [number, number] | null): string[] {
    const filters: string[] = []
    if (priceRange?.[0] != null) filters.push(`price >= ${priceRange[0]}`)
    if (priceRange?.[1] != null) filters.push(`price <= ${priceRange[1]}`)
    return filters
}

function buildFacetFilters(
    filters?: Record<string, string[]>
): string[][] | undefined {
    const entries = Object.entries(filters ?? {}).filter(([, values]) => values.length > 0)

    if (entries.length === 0) return undefined

    return entries.map(([attribute, values]) =>
        values.map((value) => `${attribute}:${escapeFilterValue(value)}`)
    )
}

function normalizeHit(hit: AlgoliaHit): Product {
    const { objectID, ...rest } = hit

    return {
        ...rest,
        objectID,
        object_id: objectID,
    } as Product
}

async function searchSingleIndex(
    indexName: string,
    searchParams: Record<string, unknown>
): Promise<SearchResponse> {
    const response = await searchClient.search({
        requests: [{ indexName, ...searchParams }],
    })

    return response.results[0] as SearchResponse
}

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