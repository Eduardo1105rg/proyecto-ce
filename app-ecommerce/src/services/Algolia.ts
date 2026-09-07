import { algoliasearch } from "algoliasearch";

import type { FiltrosBusqueda, FiltrosDisponibles, ResultadoBusquedaProductos } from "../types/algolia";
import type { Product } from "../types/product";

const appId = import.meta.env.VITE_ALGOLIA_APP_ID;
const searchApiKey = import.meta.env.VITE_ALGOLIA_SEARCH_API_KEY;
const indexName = import.meta.env.VITE_ALGOLIA_INDEX_NAME;

if (!appId) {
    throw new Error("VITE_ALGOLIA_APP_ID no está configurado");
}

if (!searchApiKey) {
    throw new Error("VITE_ALGOLIA_SEARCH_API_KEY no está configurado");
}

if (!indexName) {
    throw new Error("VITE_ALGOLIA_INDEX_NAME no está configurado");
}

export const algoliaClient = algoliasearch(
    appId,
    searchApiKey
);


export async function get_filtros_disponibles(): Promise<FiltrosDisponibles[]> {
    const response = await algoliaClient.searchSingleIndex({
        indexName,
        searchParams: {
            query: "",
            facets: ["*"],
            hitsPerPage: 0,
        },
    });

    return Object.entries(response.facets ?? {}).map(
        ([attribute, values]) => ({
            attribute,
            values: Object.entries(values).map(([value, count]) => ({
                value,
                count,
            })),
        })
    );
}


export async function get_filtros_actualizados(
    query: string,
    filtros?: FiltrosBusqueda
): Promise<FiltrosDisponibles[]> {
    const response = await algoliaClient.searchSingleIndex({
        indexName,
        searchParams: {
            query,
            facets: ["*"],
            hitsPerPage: 0,
            facetFilters: filtros?.filtrosPorFacet,
            filters: filtros?.filtros,
        },
    });

    return Object.entries(response.facets ?? {}).map(
        ([attribute, values]) => ({
            attribute,
            values: Object.entries(values).map(([value, count]) => ({
                value,
                count,
            })),
        })
    );
}


export async function buscar_productos(
    query: string,
    page = 0,
    filters?: FiltrosBusqueda
): Promise<ResultadoBusquedaProductos> {
    const response = await algoliaClient.searchSingleIndex({
        indexName,
        searchParams: {
            query,
            page,
            hitsPerPage: 20,
            facetFilters: filters?.filtrosPorFacet,
            filters: filters?.filtros,
        },
    })

    const products: Product[] = response.hits.map((hit) => {
        const { objectID, ...product } = hit

        return {
            ...product,
            object_id: objectID,
        } as Product
    })

    return {
        products,
        total: response.nbHits,
        page: response.page,
        totalPages: response.nbPages,
    }
}