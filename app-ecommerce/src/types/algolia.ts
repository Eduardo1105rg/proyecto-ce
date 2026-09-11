import type { Product } from "./product";

export interface Facet {
    value: string;
    count: number;
}

export interface FiltrosDisponibles {
    attribute: string;
    values: Facet[];
}

export interface CategoriaFacet {
    label: string;
    value: string;
    count: number;
    isRefined: boolean;
}

export interface ParametrosBusqueda {
    query?: string;
    page?: number;
    hitsPerPage?: number;
    indexName?: string;
    priceRange?: [number, number] | null;
    categories?: string[];
}

export type ResultadoBusquedaProductos = {
    products: Product[]
    total: number
    page: number
    totalPages: number
}