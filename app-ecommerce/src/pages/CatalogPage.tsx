import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { liteClient as algoliasearch } from 'algoliasearch/lite'
import {
  InstantSearch,
  Configure,
  useHits,
  useRefinementList,
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
  import.meta.env.VITE_ALGOLIA_APP_ID,
  import.meta.env.VITE_ALGOLIA_SEARCH_KEY
)

const INDEX_MAIN = import.meta.env.VITE_ALGOLIA_INDEX_MAIN
const INDEX_PRICE_ASC = import.meta.env.VITE_ALGOLIA_INDEX_PRICE_ASC
const INDEX_PRICE_DESC = import.meta.env.VITE_ALGOLIA_INDEX_PRICE_DESC

export const SORT_OPTIONS = [
  { label: 'Relevancia', value: INDEX_MAIN },
  { label: 'Precio: menor a mayor', value: INDEX_PRICE_ASC },
  { label: 'Precio: mayor a menor', value: INDEX_PRICE_DESC },
]

function CatalogContent() {
  const navigate = useNavigate()

  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [columns, setColumns] = useState<Columns>(4)
  const [priceFilter, setPriceFilter] = useState<[number, number] | null>(null)

  const { hits, results } = useHits<Product>()

  const { items: categoryItems, refine: refineCategory } = useRefinementList({
    attribute: 'category',
  })

  const { currentRefinement: currentSort, refine: refineSort } = useSortBy({
    items: SORT_OPTIONS,
  })

  const { refine: clearRefinements } = useClearRefinements()

  const { currentRefinement: currentPage, nbPages: totalPages, refine: refinePage } = usePagination()

  function handleCategoriesChange(cats: string[]) {
    const item = categoryItems.find(i => i.label === cats[0])
    if (item) refineCategory(item.value)
  }

  function handleClearAll() {
    clearRefinements()
    setPriceFilter(null)
    refineSort(INDEX_MAIN)
  }

  const [globalMaxPrice, setGlobalMaxPrice] = useState<number | undefined>(undefined)

  useEffect(() => {
    searchClient.search({
      requests: [{
        indexName: INDEX_MAIN,
        query: '',
        hitsPerPage: 1000,
        attributesToRetrieve: ['price'],
      }]
    }).then((res) => {
      const prices = (res.results[0] as { hits: Product[] }).hits
        .map(h => h.price)
        .filter(Boolean)
      if (prices.length) setGlobalMaxPrice(Math.max(...prices))
    })
  }, [])

  return (
    <>
      <Configure
        numericFilters={priceFilter ? [
          `price >= ${priceFilter[0]}`,
          `price <= ${priceFilter[1]}`,
        ] : []}
      />
      <CatalogLayout
        searchBar={<SearchBar />}
        sidebar={
          <FilterPanel
            categories={categoryItems}
            onCategoriesChange={handleCategoriesChange}
            onPriceChange={([min, max]) => setPriceFilter([min, max])}
            maxPrice={globalMaxPrice}
            sortBy={currentSort}
            sortOptions={SORT_OPTIONS}
            onSortChange={(value) => refineSort(value)}
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
            {results?.nbHits ?? 0} productos encontrados
          </p>
          <ViewToggle
            viewMode={viewMode}
            columns={columns}
            onViewChange={setViewMode}
            onColumnsChange={setColumns}
          />
        </div>

        <ProductGrid
          products={hits as Product[]}
          viewMode={viewMode}
          columns={columns}
          onAddToCart={(p) => console.log('Agregar al carrito:', p.title ?? p.name)}
          onProductClick={(p) => navigate(`/producto/${p.object_id}`)}
        />

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
    </>
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