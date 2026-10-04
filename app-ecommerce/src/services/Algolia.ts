import { liteClient as algoliasearch } from 'algoliasearch/lite'

import type { DropdownOption } from '../components/Dropdown/Dropdown'
import type { FacetSectionDefinition } from '../types/algolia'

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
export const SORT_OPTIONS: DropdownOption[] = [
    { label: 'Relevancia', value: INDEX_MAIN },
    { label: 'Precio: menor a mayor', value: INDEX_PRICE_ASC },
    { label: 'Precio: mayor a menor', value: INDEX_PRICE_DESC },
]

/**
 * Definicion estatica de todas las secciones de facets del catalogo.
 *
 * Cada entrada indica el atributo de Algolia, el titulo visible en el FilterPanel,
 * y un mapa opcional de labels para reemplazar valores crudos (como true/false)
 * por texto legible en espanol.
 *
 * Este arreglo es la unica fuente de verdad: el FilterPanel genera una instancia
 * de useRefinementList por entrada y descarta las secciones sin resultados.
 *
 * Agregar o quitar un facet del catalogo solo requiere modificar este arreglo.
 */
export const FACET_SECTIONS: FacetSectionDefinition[] = [
    { attribute: 'category', title: 'Categoria' },
    { attribute: 'brand', title: 'Marca' },
    { attribute: 'facets.color', title: 'Color' },
    { attribute: 'facets.material', title: 'Material' },
    { attribute: 'facets.style', title: 'Estilo' },
    { attribute: 'facets.subcategory', title: 'Subcategoria' },
    { attribute: 'facets.eco_friendly', title: 'Eco friendly', labels: { true: 'Si', false: 'No' } },
    { attribute: 'facets.free_shipping', title: 'Envio gratis', labels: { true: 'Si', false: 'No' } },
    { attribute: 'facets.tax_exempt', title: 'Exento de impuestos', labels: { true: 'Si', false: 'No' } },
]

/** Atributo numerico usado por el filtro de precio del FilterPanel */
export const PRICE_ATTRIBUTE = 'price'

/** Cantidad de productos por pagina en el catalogo */
export const HITS_PER_PAGE = 20

/** Cantidad maxima de productos relacionados en la pagina de detalle */
export const RELATED_HITS_PER_PAGE = 8

/** Milisegundos de espera antes de disparar la busqueda al escribir */
export const SEARCH_DEBOUNCE_MS = 300

/** Cliente de Algolia inicializado con las credenciales del proyecto */
export const searchClient = algoliasearch(appId, searchKey)

/**
 * Escapa caracteres especiales en valores de filtro para evitar
 * errores de sintaxis en las queries de Algolia.
 * Escapa backslashes primero para no doble-escapar las comillas.
 */
export function escapeFilterValue(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}
