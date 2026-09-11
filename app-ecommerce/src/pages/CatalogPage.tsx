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
import type { FiltrosDisponibles } from '../types/algolia'
import type { Product } from '../types/product'

type ViewMode = 'grid' | 'list'
type Columns = 3 | 4 | 5

function CatalogContent() {
  const navigate = useNavigate()

  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [columns, setColumns] = useState<Columns>(4)

  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [priceFilter, setPriceFilter] = useState<[number, number] | null>(null)
  const [sortIndex, setSortIndex] = useState<string>(INDEX_MAIN)
  const [page, setPage] = useState(1)

  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [facets, setFacets] = useState<FiltrosDisponibles[]>([])
  const [hasLoaded, setHasLoaded] = useState(false)

  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined)

  useEffect(() => {
    let active = true
    getMaxPrice().then((price) => {
      if (active) setMaxPrice(price)
    })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    let active = true

    Promise.all([
      buscarProductos({
        query: debouncedQuery,
        page: page - 1,
        priceRange: priceFilter,
        categories,
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

    return () => {
      active = false
    }
  }, [debouncedQuery, categories, priceFilter, sortIndex, page])

  function handleQueryChange(value: string) {
    setQuery(value)
    setPage(1)
  }

  function handleCategoriesChange(cats: string[]) {
    const label = cats[0]
    if (!label) return
    setCategories((prev) =>
      prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label]
    )
    setPage(1)
  }

  function handlePriceChange(range: [number, number]) {
    setPriceFilter(range)
    setPage(1)
  }

  function handleSortChange(value: string) {
    setSortIndex(value)
    setPage(1)
  }

  function handleClearAll() {
    setQuery('')
    setDebouncedQuery('')
    setCategories([])
    setPriceFilter(null)
    setSortIndex(INDEX_MAIN)
    setPage(1)
  }

  const categoryItems =
    facets
      .find((f) => f.attribute === 'category')
      ?.values.map((v) => ({
        label: v.value,
        value: v.value,
        count: v.count,
        isRefined: categories.includes(v.value),
      })) ?? []

  return (
    <CatalogLayout
      searchBar={<SearchBar query={query} onQueryChange={handleQueryChange} />}
      sidebar={
        <FilterPanel
          categories={categoryItems}
          onCategoriesChange={handleCategoriesChange}
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

export function CatalogPage() {
  return <CatalogContent />
}