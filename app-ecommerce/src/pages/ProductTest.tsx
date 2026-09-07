import { useState } from 'react'
import { CatalogLayout } from '../features/catalog/components/CatalogLayout/CatalogLayout'
import { ProductGrid } from '../features/catalog/components/ProductGrid/ProductGrid'
import { ViewToggle } from '../features/catalog/components/ViewToggle/ViewToggle'
import productsData from '../data/products.json'
import type { Product } from '../types/product'
import { useNavigate } from 'react-router-dom'


type ViewMode = 'grid' | 'list'
type Columns = 3 | 4 | 5

const products = (productsData as Product[]).slice(0, 30)

export function ProductTest() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [columns, setColumns] = useState<Columns>(4)
  const navigate = useNavigate()

  return (
    <CatalogLayout>

      {/* Header del catálogo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
      }}>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
          {products.length} productos
        </p>
        <ViewToggle
          viewMode={viewMode}
          columns={columns}
          onViewChange={setViewMode}
          onColumnsChange={setColumns}
        />
      </div>

      <ProductGrid
        products={products}
        viewMode={viewMode}
        columns={columns}
        onAddToCart={(p) => console.log('Agregar:', p.name)}
        onProductClick={(p) => navigate(`/producto/${p.object_id}`)} 
      />
    </CatalogLayout>
  )
}