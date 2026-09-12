import type { Product } from "./product";

/**
 * Representa un valor de faceta con su conteo de resultados.
 */
export interface Facet {
    value: string;
    count: number;
}

/**
 * Agrupación de valores de faceta para un atributo concreto.
 */
export interface FiltrosDisponibles {
    attribute: string;
    values: Facet[];
}

/**
 * Elemento individual de una faceta ya procesada para UI.
 */
export interface FacetItem {
    label: string;
    value: string;
    count: number;
    isRefined: boolean;
}

/**
 * Sección de facetas lista para renderizar (título + items).
 */
export interface FacetSection {
    attribute: string;
    title: string;
    items: FacetItem[];
}

/**
 * Parámetros de entrada para una búsqueda.
 */
export interface ParametrosBusqueda {
    query?: string;
    page?: number;
    hitsPerPage?: number;
    indexName?: string;
    priceRange?: [number, number] | null;
    filters?: Record<string, string[]>;
}

/**
 * Resultado normalizado de una búsqueda de productos.
 */
export type ResultadoBusquedaProductos = {
    products: Product[]
    total: number
    page: number
    totalPages: number
}