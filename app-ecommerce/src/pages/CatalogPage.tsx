import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { liteClient as algoliasearch } from 'algoliasearch/lite'
import {
  InstantSearch,
  useHits,
  useRefinementList,
  useRange,
  useSortBy,
  useClearRefinements,
  usePagination,
} from 'react-instantsearch'
import { CatalogLayout } from '../features/catalog/components/CatalogLayout/CatalogLayout'
import { ProductGrid } from '../features/catalog/components/ProductGrid/ProductGrid'
import { ViewToggle } from '../features/catalog/components/ViewToggle/ViewToggle'
import { FilterPanel } from '../features/catalog/components/FilterPanel/FilterPanel'
import { Pagination } from '../features/catalog/components/Pagination/Pagination'
import { SearchBar } from '../features/catalog/components/SearchBar/SearchBar'
import type { Product } from '../types/product'

type ViewMode = 'grid' | 'list'
type Columns = 3 | 4 | 5

const searchClient = algoliasearch(
  'P312IB0CXE',
  '0c676ad33cf8f9cb11f0cf0b8d3f125a'
)

// Nombres exactos de tus índices en Algolia
// deben coincidir con el indexName del InstantSearch y los nombres de réplicas reales
const INDEX_MAIN = 'grupo-03_products_pruebas'
const INDEX_PRICE_ASC = 'grupo-03_products_pruebas_price_asc'   
const INDEX_PRICE_DESC = 'grupo-03_products_pruebas_price_desc' //ajustar a la réplica real de Algolia

export const SORT_OPTIONS = [
  { label: 'Relevancia', value: INDEX_MAIN },
  { label: 'Precio: menor a mayor', value: INDEX_PRICE_ASC },
  { label: 'Precio: mayor a menor', value: INDEX_PRICE_DESC },
]

function CatalogContent() {
  const navigate = useNavigate()

  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [columns, setColumns] = useState<Columns>(4)

  // Hooks de Algolia
  const { hits, results } = useHits<Product>()
  console.log('hits:', hits)
  console.log('results:', results)

  const { items: categoryItems, refine: refineCategory } = useRefinementList({
    attribute: 'category',
  })

  const { range, start, refine: refinePrice } = useRange({
    attribute: 'price',
  })

  const { currentRefinement: currentSort, refine: refineSort } = useSortBy({
    items: SORT_OPTIONS,
  })

  const { refine: clearRefinements } = useClearRefinements()

  const { currentRefinement: currentPage, nbPages: totalPages, refine: refinePage } = usePagination()

  const minLimit = range?.min ?? 0
  const maxLimit = range?.max ?? 500000

  const activePriceRange: [number, number] = [
    start?.[0] !== undefined && start[0] !== -Infinity ? start[0] : minLimit,
    start?.[1] !== undefined && start[1] !== Infinity ? start[1] : maxLimit,
  ]

  const selectedCategories = categoryItems
    .filter(item => item.isRefined)
    .map(item => item.label)

  function handleCategoriesChange(cats: string[]) {
    categoryItems.forEach(item => {
      const shouldBeActive = cats.includes(item.label)
      if (item.isRefined !== shouldBeActive) {
        refineCategory(item.value)
      }
    })
  }

  function handlePriceChange([min, max]: [number, number]) {
    refinePrice([min, max])
  }

  function handleClearAll() {
    clearRefinements()
    // Volver al índice principal (sort por relevancia)
    refineSort(INDEX_MAIN)
  }

  return (
    <CatalogLayout
      searchBar={<SearchBar />}
      sidebar={
        <FilterPanel
          selectedCategories={selectedCategories}
          onCategoriesChange={handleCategoriesChange}
          priceRange={activePriceRange}
          priceMin={minLimit}
          priceMax={maxLimit}
          onPriceChange={handlePriceChange}
          sortBy={currentSort}
          sortOptions={SORT_OPTIONS}
          onSortChange={(value) => refineSort(value)}
          onClearAll={handleClearAll}
        />
      }
    >
      {/* Header del catálogo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
      }}>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
          {results?.nbHits ?? 0} productos encontrados
        </p>
        <ViewToggle
          viewMode={viewMode}
          columns={columns}
          onViewChange={setViewMode}
          onColumnsChange={setColumns}
        />
      </div>

      {/* Grid de productos */}
      <ProductGrid
        products={hits as Product[]}
        viewMode={viewMode}
        columns={columns}
        onAddToCart={(p) => {
          console.log('Agregar al carrito:', p.title ?? p.name)
        }}
        onProductClick={(p) => navigate(`/producto/${p.object_id}`)}
      />

      {/* Paginación */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage + 1}
          totalPages={totalPages}
          onPageChange={(page) => {
            refinePage(page - 1)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        />
      )}
    </CatalogLayout>
  )
}

export function CatalogPage() {
  return (
    <InstantSearch
      searchClient={searchClient}
      indexName={INDEX_MAIN}
    >
      <CatalogContent />
    </InstantSearch>
  )
}