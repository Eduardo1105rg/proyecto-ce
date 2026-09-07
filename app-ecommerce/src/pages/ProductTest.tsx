import { useState, useMemo } from 'react'
import { CatalogLayout } from '../features/catalog/components/CatalogLayout/CatalogLayout'
import { ProductGrid } from '../features/catalog/components/ProductGrid/ProductGrid'
import { ViewToggle } from '../features/catalog/components/ViewToggle/ViewToggle'
import productsData from '../data/products.json'
import type { Product } from '../types/product'
import { useNavigate } from 'react-router-dom'
import { UilSearch } from '@iconscout/react-unicons'
import { FilterPanel } from '../features/catalog/components/FilterPanel/FilterPanel'
import { Pagination } from '../features/catalog/components/Pagination/Pagination'

const ITEMS_PER_PAGE = 30

type ViewMode = 'grid' | 'list'
type Columns = 3 | 4 | 5

//Esto es una version de prueba de la pagina de catalogo usando datos locales, sin Algolia.

const allProducts = productsData as Product[]

interface SearchBarMockProps {
  value: string
  onChange: (val: string) => void
}

// Wrapper del Buscador Local
function SearchBarMock({ value, onChange }: SearchBarMockProps) {
  return (
    <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
      <span style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)', display: 'flex' }}>
        <UilSearch size="18" />
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%', height: '44px', padding: '0 44px',
          border: '1.5px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-white)',
          color: 'var(--text-primary)',
          fontSize: 'var(--text-base)',
          fontFamily: 'inherit',
          outline: 'none',
        }}
        placeholder="Buscar productos localmente..."
      />
    </div>
  )
}

export function ProductTest() {
  const navigate = useNavigate()
  
  // Estados de UI
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [columns, setColumns] = useState<Columns>(4)
  const [currentPage, setCurrentPage] = useState(1)

  // Estados de Filtros y Búsqueda
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000])
  const [sortBy, setSortBy] = useState('relevance')

  // --- MOTOR DE BÚSQUEDA Y FILTRADO LOCAL ---
  const filteredProducts = useMemo(() => {
    let result = [...allProducts]

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase()
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.brand.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      )
    }

    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.category))
    }

    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])

    if (sortBy === 'price_asc') {
      result.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.price - a.price)
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating)
    }

    return result;
  }, [searchQuery, selectedCategories, priceRange, sortBy])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE))
  
  const activePage = currentPage > totalPages ? totalPages : currentPage

  const paginatedProducts = useMemo(() => {
    const startIndex = (activePage - 1) * ITEMS_PER_PAGE
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredProducts, activePage])

  return (
    <CatalogLayout 
      searchBar={
        <SearchBarMock 
          value={searchQuery} 
          onChange={(val) => {
            setSearchQuery(val)
            setCurrentPage(1) 
          }} 
        />
      }
      sidebar={
        <FilterPanel
          selectedCategories={selectedCategories}
          onCategoriesChange={(cats) => {
            setSelectedCategories(cats)
            setCurrentPage(1) 
          }}
          priceRange={priceRange}
          onPriceChange={(range) => {
            setPriceRange(range)
            setCurrentPage(1) 
          }}
          sortBy={sortBy}
          onSortChange={(sort) => {
            setSortBy(sort)
            setCurrentPage(1) 
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
          {filteredProducts.length} productos encontrados
        </p>
        <ViewToggle
          viewMode={viewMode}
          columns={columns}
          onViewChange={setViewMode}
          onColumnsChange={setColumns}
        />
      </div>

      {/* Grid de Productos Filtrados y Paginados */}
      <ProductGrid
        products={paginatedProducts}
        viewMode={viewMode}
        columns={columns}
        onAddToCart={(p) => console.log('Agregar:', p.name)}
        onProductClick={(p) => navigate(`/producto/${p.object_id}`)}
      />

      {/* Paginación Dinámica */}
      {totalPages > 1 && (
        <Pagination
          currentPage={activePage}
          totalPages={totalPages}
          onPageChange={(page) => {
            setCurrentPage(page)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        />
      )}
    </CatalogLayout>
  )
}
