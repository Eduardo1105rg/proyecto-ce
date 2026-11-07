import type { Product } from '../../types/product'

export type ProductosPersonalizados = {
	productos: Product[]
	cargando: boolean
}

// TODO conectar: devolver los productos vistos por el usuario activo, del más reciente al más antiguo
export function useVistosRecientes(): ProductosPersonalizados {
	return { productos: [], cargando: false }
}

// TODO conectar: devolver productos recomendados según categorías y búsquedas del usuario activo
export function useRecomendados(): ProductosPersonalizados {
	return { productos: [], cargando: false }
}