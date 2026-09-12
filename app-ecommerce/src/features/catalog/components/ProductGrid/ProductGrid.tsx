import styles from './ProductGrid.module.css'
import { ProductCardGrid } from '../../../../components/ProductCard/ProductCardGrid/ProductCardGrid'
import { ProductCardList } from '../../../../components/ProductCard/ProductCardList/ProductCardList'
import type { Product } from '../../../../types/product'

/** Modo de visualizacion del catalogo */
type ViewMode = 'grid' | 'list'

/** Numero de columnas permitidas en modo grilla */
type Columns = 3 | 4 | 5

/**
 * Props del componente ProductGrid.
 *
 * @prop products        - Arreglo de productos a renderizar (hits de Algolia).
 * @prop viewMode        - Modo de visualizacion: grilla o lista. Por defecto: 'grid'.
 * @prop columns         - Cantidad de columnas en modo grilla. Por defecto: 4.
 * @prop onAddToCart     - Callback que se ejecuta al agregar un producto al carrito.
 * @prop onProductClick  - Callback que se ejecuta al hacer clic en un producto para ir al detalle.
 */
type ProductGridProps = {
  products: Product[]
  viewMode?: ViewMode
  columns?: Columns
  onAddToCart?: (product: Product) => void
  onProductClick?: (product: Product) => void
}

/**
 * Contenedor de productos del catalogo.
 *
 * Decide que tarjeta renderizar segun el viewMode:
 * - 'grid': usa ProductCardGrid, layout vertical con imagen arriba.
 * - 'list': usa ProductCardList, layout horizontal con imagen a la derecha.
 *
 * En modo grid, el numero de columnas se pasa como CSS custom property
 * (--cols) al contenedor, y el CSS de ProductGrid.module.css lo consume
 * en el grid-template-columns.
 *
 * Si no hay productos, muestra un mensaje de estado vacio.
 */
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