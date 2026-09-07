import styles from './ProductGrid.module.css'
import { ProductCardGrid } from '../../../../components/ProductCard/ProductCardGrid/ProductCardGrid'
import { ProductCardList } from '../../../../components/ProductCard/ProductCardList/ProductCardList'
import type { Product } from '../../../../types/product'

type ViewMode = 'grid' | 'list'
type Columns = 3 | 4 | 5

type ProductGridProps = {
  products: Product[]
  viewMode?: ViewMode
  columns?: Columns
  onAddToCart?: (product: Product) => void
  onProductClick?: (product: Product) => void
}

export function ProductGrid({
  products,
  viewMode = 'grid',
  columns = 4,
  onAddToCart,
  onProductClick,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No se encontraron productos.</p>
      </div>
    )
  }

  return (
    <div
      className={`${styles.grid} ${viewMode === 'list' ? styles.listMode : ''}`}
      style={viewMode === 'grid' ? { '--cols': columns } as React.CSSProperties : undefined}
    >
      {products.map(product =>
        viewMode === 'list' ? (
          <ProductCardList
            key={product.object_id}
            product={product}
            imageUrl={`/images/${product.image}`}
            onAddToCart={onAddToCart}
            onClick={onProductClick}
          />
        ) : (
          <ProductCardGrid
            key={product.object_id}
            product={product}
            imageUrl={`/images/${product.image}`}
            onAddToCart={onAddToCart}
            onClick={onProductClick}
          />
        )
      )}
    </div>
  )
}