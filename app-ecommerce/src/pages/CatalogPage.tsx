import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CatalogLayout } from '../features/catalog/components/CatalogLayout/CatalogLayout'
import { ProductGrid } from '../features/catalog/components/ProductGrid/ProductGrid'
import { ViewToggle } from '../features/catalog/components/ViewToggle/ViewToggle'
import { FilterPanel } from '../features/catalog/components/FilterPanel/FilterPanel'
import { Pagination } from '../features/catalog/components/Pagination/Pagination'
import { SearchBar } from '../features/catalog/components/SearchBar/SearchBar'
import {
  INDEX_MAIN,
  SORT_OPTIONS,
  buscarProductos,
  getFiltrosDisponibles,
  getMaxPrice,
} from '../services/Algolia'
import type { FacetSection, FiltrosDisponibles } from '../types/algolia'
import type { Product } from '../types/product'

type ViewMode = 'grid' | 'list'
type Columns = 3 | 4 | 5

/**
 * Definicion estatica de todas las secciones de facets del catalogo.
 *
 * Cada entrada indica el atributo de Algolia, el titulo visible en el FilterPanel,
 * y un mapa opcional de labels para reemplazar valores crudos (como true/false)
 * por texto legible en espanol.
 *
 * Agregar o quitar un facet del catalogo solo requiere modificar este arreglo.
 */
const FACET_SECTIONS: { attribute: string; title: string; labels?: Record<string, string> }[] = [
  { attribute: 'category', title: 'Categoria' },
  { attribute: 'brand', title: 'Marca' },
  { attribute: 'payment_methods', title: 'Metodos de pago' },
  { attribute: 'facets.color', title: 'Color' },
  { attribute: 'facets.material', title: 'Material' },
  { attribute: 'facets.style', title: 'Estilo' },
  { attribute: 'facets.subcategory', title: 'Subcategoria' },
  { attribute: 'facets.eco_friendly', title: 'Eco friendly', labels: { true: 'Si', false: 'No' } },
  { attribute: 'facets.free_shipping', title: 'Envio gratis', labels: { true: 'Si', false: 'No' } },
  { attribute: 'facets.tax_exempt', title: 'Exento de impuestos', labels: { true: 'Si', false: 'No' } },
]

/**
 * Componente interno que contiene toda la logica del catalogo.
 *
 * Maneja de forma local:
 * - query: texto del buscador (con debounce de 300ms para no disparar una
 *   llamada a Algolia por cada tecla).
 * - facetFilters: mapa de atributo -> valores seleccionados para los filtros activos.
 * - priceFilter: rango [min, max] del filtro de precio, o null si no esta activo.
 * - sortIndex: nombre del indice de Algolia activo para el ordenamiento.
 * - page: pagina actual (base 1).
 *
 * Al cambiar cualquiera de esos valores se dispara un useEffect que llama
 * en paralelo a buscarProductos y getFiltrosDisponibles. El flag 'active'
 * en cada effect evita actualizar el estado si el componente se desmonto
 * o si llego una respuesta de una peticion anterior (race condition).
 *
 * facetSections construye el arreglo que recibe FilterPanel combinando
 * FACET_SECTIONS con los valores disponibles en Algolia y el estado
 * actual de refinamiento, filtrando las secciones sin resultados.
 */
function CatalogContent() {
  const navigate = useNavigate()

  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [columns, setColumns] = useState<Columns>(4)

  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [facetFilters, setFacetFilters] = useState<Record<string, string[]>>({})
  const [priceFilter, setPriceFilter] = useState<[number, number] | null>(null)
  const [sortIndex, setSortIndex] = useState<string>(INDEX_MAIN)
  const [page, setPage] = useState(1)

  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [facets, setFacets] = useState<FiltrosDisponibles[]>([])
  const [hasLoaded, setHasLoaded] = useState(false)

  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined)

  /** Carga el precio maximo global una sola vez al montar el componente */
  useEffect(() => {
    let active = true
    getMaxPrice().then((price) => {
      if (active) setMaxPrice(price)
    })
    return () => { active = false }
  }, [])

  /** Debounce del query: espera 300ms despues del ultimo cambio antes de buscar */
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  /** Busca productos y facets disponibles cada vez que cambia algun filtro o la pagina */
  useEffect(() => {
    let active = true

    Promise.all([
      buscarProductos({
        query: debouncedQuery,
        page: page - 1,
        priceRange: priceFilter,
        filters: facetFilters,
        indexName: sortIndex,
      }),
      getFiltrosDisponibles({
        query: debouncedQuery,
        priceRange: priceFilter,
      }),
    ])
      .then(([resultado, disponibles]) => {
        if (!active) return
        setProducts(resultado.products)
        setTotal(resultado.total)
        setTotalPages(resultado.totalPages)
        setFacets(disponibles)
        setHasLoaded(true)
      })
      .catch(() => {
        if (!active) return
        setProducts([])
        setTotal(0)
        setTotalPages(1)
        setFacets([])
        setHasLoaded(true)
      })

    return () => { active = false }
  }, [debouncedQuery, facetFilters, priceFilter, sortIndex, page])

  /** Actualiza el query y resetea a la pagina 1 */
  function handleQueryChange(value: string) {
    setQuery(value)
    setPage(1)
  }

  /**
   * Activa o desactiva un valor de facet.
   * Si el valor ya estaba seleccionado lo quita; si no, lo agrega.
   * Si el atributo queda sin valores, se elimina del mapa.
   */
  function handleFacetToggle(attribute: string, value: string) {
    setFacetFilters((prev) => {
      const current = prev[attribute] ?? []
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]

      const updated = { ...prev }
      if (next.length === 0) {
        delete updated[attribute]
      } else {
        updated[attribute] = next
      }
      return updated
    })
    setPage(1)
  }

  /** Aplica el filtro de precio y resetea a la pagina 1 */
  function handlePriceChange(range: [number, number]) {
    setPriceFilter(range)
    setPage(1)
  }

  /** Cambia el indice de ordenamiento y resetea a la pagina 1 */
  function handleSortChange(value: string) {
    setSortIndex(value)
    setPage(1)
  }

  /** Limpia todos los filtros, query y ordenamiento */
  function handleClearAll() {
    setQuery('')
    setDebouncedQuery('')
    setFacetFilters({})
    setPriceFilter(null)
    setSortIndex(INDEX_MAIN)
    setPage(1)
  }

  /**
   * Construye el arreglo de secciones de facets para el FilterPanel.
   * Combina la definicion estatica de FACET_SECTIONS con los valores
   * disponibles en Algolia y el estado de refinamiento actual.
   * Las secciones sin items se filtran para no mostrar filtros vacios.
   */
  const facetSections: FacetSection[] = FACET_SECTIONS
    .map(({ attribute, title, labels }) => {
      const facet = facets.find((f) => f.attribute === attribute)
      const refined = facetFilters[attribute] ?? []
      return {
        attribute,
        title,
        items: (facet?.values ?? []).map((v) => ({
          label: labels?.[v.value] ?? v.value,
          value: v.value,
          count: v.count,
          isRefined: refined.includes(v.value),
        })),
      }
    })
    .filter((section) => section.items.length > 0)

  return (
    <CatalogLayout
      searchBar={<SearchBar query={query} onQueryChange={handleQueryChange} />}
      sidebar={
        <FilterPanel
          facetSections={facetSections}
          onFacetToggle={handleFacetToggle}
          onPriceChange={handlePriceChange}
          maxPrice={maxPrice}
          sortBy={sortIndex}
          sortOptions={SORT_OPTIONS}
          onSortChange={handleSortChange}
          onClearAll={handleClearAll}
        />
      }
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
      }}>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
          {total} productos encontrados
        </p>
        <ViewToggle
          viewMode={viewMode}
          columns={columns}
          onViewChange={setViewMode}
          onColumnsChange={setColumns}
        />
      </div>

      {/* Muestra mensaje de carga solo en el primer render antes de recibir datos */}
      {!hasLoaded && products.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>Cargando productos...</p>
      ) : (
        <ProductGrid
          products={products}
          viewMode={viewMode}
          columns={columns}
          onAddToCart={(p) => console.log('Agregar al carrito:', p.title ?? p.name)}
          onProductClick={(p) => navigate(`/producto/${p.objectID}`)}
        />
      )}

      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(nextPage) => {
            setPage(nextPage)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        />
      )}
    </CatalogLayout>
  )
}

/**
 * Pagina del catalogo. Envuelve CatalogContent sin logica adicional,
 * separando el punto de entrada de la pagina del contenido interno.
 */
export function CatalogPage() {
  return <CatalogContent />
}