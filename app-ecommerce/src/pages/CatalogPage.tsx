import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Configure, InstantSearch, useHits, useInstantSearch, useSearchBox, useStats } from 'react-instantsearch'
import { CatalogLayout } from '../features/catalog/components/CatalogLayout/CatalogLayout'
import { ProductGrid } from '../features/catalog/components/ProductGrid/ProductGrid'
import { ViewToggle } from '../features/catalog/components/ViewToggle/ViewToggle'
import { FilterPanel } from '../features/catalog/components/FilterPanel/FilterPanel'
import { Pagination } from '../features/catalog/components/Pagination/Pagination'
import { SearchBar } from '../features/catalog/components/SearchBar/SearchBar'
import {
	HITS_PER_PAGE,
	INDEX_MAIN,
	searchClient,
} from '../services/Algolia'
import type { Product } from '../types/product'
import { useCarrito } from '../context/carritoContext'
import { useAnalytics } from '../features/analytics/useAnalytics'
import { BloqueProductos } from '../features/analytics/components/BloqueProductos/BloqueProductos'
import { useRecomendados, useVistosRecientes } from '../features/analytics/usePersonalizacion.mock'
import { useAuth } from '../features/auth/useAuth'

type ViewMode = 'grid' | 'list'
type Columns = 3 | 4 | 5

/**
 * Componente interno que contiene toda la logica del catalogo.
 *
 * Ya no mantiene estado de busqueda propio: todo el estado (query refinada,
 * facets, rango de precio, indice de ordenamiento y pagina) vive en la instancia
 * de InstantSearch que envuelve la pagina. Cada componente lee su parte con hooks
 * (useHits, useStats, usePagination, useRefinementList...).
 *
 * InstantSearch se encarga del trabajo que antes era manual en esta pagina:
 * el debounce del query (queryHook), el reseteo de la pagina al refinar, los
 * conteos disjuntivos de los facets y el cancelamiento de peticiones anteriores.
 *
 * Lo unico que sigue siendo estado local es la preferencia visual de grilla/list
 * y el numero de columnas, que no pertenece al estado de busqueda.
 */
function CatalogContent() {
	const navigate = useNavigate()
	const { agregar } = useCarrito()
	const { registrar } = useAnalytics()
	const { query } = useSearchBox()
	const ultimaBusqueda = useRef('')
	const vistos = useVistosRecientes()
	const recomendados = useRecomendados()
	const { usuario } = useAuth()

	const [viewMode, setViewMode] = useState<ViewMode>('grid')
	const [columns, setColumns] = useState<Columns>(4)

	const { items } = useHits<Product>()
	const { nbHits } = useStats()
	const { status } = useInstantSearch()

	// Se registra la busqueda cuando el usuario deja de escribir, no en cada letra.
	useEffect(() => {
		const termino = query.trim()
		if (termino.length < 2 || termino === ultimaBusqueda.current) return

		const espera = setTimeout(() => {
			ultimaBusqueda.current = termino
			registrar('busqueda', { termino })
		}, 800)

		return () => clearTimeout(espera)
	}, [query, registrar])

	/**
	 * Muestra el estado de carga solo durante la primera busqueda.
	 * En refinamientos posteriores los hits anteriores siguen en pantalla mientras
	 * llega la respuesta, de modo que no parpadea el mensaje de "Cargando".
	 */
	const showLoading = items.length === 0 && status === 'loading'

	return (
		<CatalogLayout
			searchBar={<SearchBar />}
			sidebar={<FilterPanel />}
		>
			<div style={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				marginBottom: '16px',
			}}>
				<p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
					{nbHits} productos encontrados
				</p>
				<ViewToggle
					viewMode={viewMode}
					columns={columns}
					onViewChange={setViewMode}
					onColumnsChange={setColumns}
				/>
			</div>

			{showLoading ? (
				<p style={{ color: 'var(--text-muted)' }}>Cargando productos...</p>
			) : (
				<ProductGrid
					products={items}
					viewMode={viewMode}
					columns={columns}
					onAddToCart={(p) => agregar(p.objectID, 1)}
					onProductClick={(p) => navigate(`/producto/${p.objectID}`)}
				/>
			)}

			<Pagination />
			{query.trim() === '' && (
				<div style={{ marginTop: '40px' }}>
					<BloqueProductos
						titulo="Vistos recientemente"
						productos={vistos.productos}
						maximo={4}
						verTodosHref={usuario ? '/analytics' : undefined}
						onAddToCart={(p) => agregar(p.objectID, 1)}
						onProductClick={(p) => navigate(`/producto/${p.objectID}`)}
					/>
					<BloqueProductos
						titulo="Recomendados para usted"
						productos={recomendados.productos}
						maximo={4}
						onAddToCart={(p) => agregar(p.objectID, 1)}
						onProductClick={(p) => navigate(`/producto/${p.objectID}`)}
					/>
				</div>
			)}
		</CatalogLayout>
	)
}

/**
 * Pagina del catalogo.
 *
 * Monta la instancia de InstantSearch que da contexto de busqueda a todos los
 * widgets del catalogo. El routing se deja desactivado a proposito: la app usa
 * HashRouter y el widget History de Algolia trabaja con pushState sobre el path,
 * lo que es incompatible con el enrutado por hash.
 */
export function CatalogPage() {
	return (
		<InstantSearch
			searchClient={searchClient}
			indexName={INDEX_MAIN}
			routing={false}
		>
			<Configure hitsPerPage={HITS_PER_PAGE} />
			<CatalogContent />
		</InstantSearch>
	)
}