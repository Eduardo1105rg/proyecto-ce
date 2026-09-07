import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  useHits, 
  useSearchBox, 
  useRefinementList, 
  useRange,
  useSortBy,
  useClearRefinements,
  usePagination        
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

function SearchBarWrapper() {
  const { refine } = useSearchBox()
  
  return (
    <SearchBar 
      onChange={(value: string) => refine(value)}
    />
  )
}

// Componente principal del catálogo
export function CatalogPage() {
  const navigate = useNavigate()
  
  // Estados de UI
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [columns, setColumns] = useState<Columns>(4)
  
  // Hooks de Algolia
  const { hits, results } = useHits<Product>()
  
  const { items: categoryItems, refine: refineCategory } = useRefinementList({
    attribute: 'category',
  })
  
  const { range, refine: refinePrice } = useRange({
    attribute: 'price',
  })
  
  const { currentRefinement: currentSort, refine: refineSort } = useSortBy({
    items: [
      { label: 'Relevancia', value: 'relevance' },
      { label: 'Precio: menor a mayor', value: 'price_asc' },
      { label: 'Precio: mayor a menor', value: 'price_desc' },
      { label: 'Más nuevos', value: 'newest' },
      { label: 'Más antiguos', value: 'oldest' },
    ]
  })
  
  const { refine: clearAll } = useClearRefinements()
  const { currentRefinement: currentPage, nbPages: totalPages, refine: refinePage } = usePagination()
  
  // Extraer valores del range de precio de forma segura
  const currentMinPrice = range?.min ?? 0
  const currentMaxPrice = range?.max ?? 500000
  
  // Obtener la lista de nombres de categorías activas
  const selectedCategories = categoryItems
    .filter(item => item.isRefined)
    .map(item => item.label)

  return (
    <CatalogLayout 
      searchBar={<SearchBarWrapper />}
      sidebar={
        <FilterPanel
          // Categorías
          selectedCategories={selectedCategories}
          onCategoriesChange={(cats) => {
            categoryItems.forEach(item => {
              const debeEstarActivo = cats.includes(item.label)
              if (item.isRefined !== debeEstarActivo) {
                refineCategory(item.value)
              }
            })
          }}
          // Precio
          priceRange={[currentMinPrice, currentMaxPrice]}
          onPriceChange={([min, max]) => {
            // useRange espera una tupla array [min, max] en vez de un objeto
            refinePrice([min, max])
          }}
          // Ordenamiento
          sortBy={currentSort}
          onSortChange={(value) => {
            refineSort(value)
          }}
          
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
          console.log('Agregar al carrito:', p.name)
        }}
        // Volvemos a p.object_id ya que coincide con interfaz Product
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
