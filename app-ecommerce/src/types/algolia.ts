import type { Product } from "./product";

export interface Facet {
    value: string;
    count: number;
}

export interface FiltrosDisponibles {
    attribute: string;
    values: Facet[];
}

export interface FiltrosBusqueda {
    filtrosPorFacet?: string[][];
    filtros?: string;
}

export type ResultadoBusquedaProductos = {
    products: Product[]
    total: number
    page: number
    totalPages: number
}