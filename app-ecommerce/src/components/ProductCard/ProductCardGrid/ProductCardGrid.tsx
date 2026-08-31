import styles from './ProductCardGrid.module.css'
import type { Product } from '../../../types/product'

type ProductCardGridProps = {
  product: Product
  imageUrl?: string
  listMode?: boolean           // ← agregar
  onAddToCart?: (product: Product) => void
  onClick?: (product: Product) => void
}

// Calcula el stock total sumando todas las sucursales
function getTotalStock(product: Product): number {
  return product.stock_by_branch.reduce((acc, b) => acc + b.stock, 0)
}

// Formatea el precio en colones
function formatPrice(price: number): string {
  return `₡${price.toLocaleString('es-CR')}`
}

// Renderiza las estrellas de rating
function Stars({ rating }: { rating: number }) {
  return (
    <div className={styles.stars}>
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          className={i <= Math.round(rating) ? styles.starFilled : styles.starEmpty}
        >
          ★
        </span>
      ))}
      <span className={styles.ratingNum}>{rating.toFixed(1)}</span>
    </div>
  )
}

export function ProductCardGrid({ product, imageUrl, listMode = false, onAddToCart, onClick }: ProductCardGridProps) {
  const totalStock = getTotalStock(product)
  const inStock = totalStock > 0
  const lowStock = totalStock > 0 && totalStock <= 5

  return (
    <article
      className={`${styles.card} ${listMode ? styles.cardList : ''}`}
      onClick={() => onClick?.(product)}
    >

      {/* Imagen */}
      <div className={styles.imgWrapper}>
        <img
          src={imageUrl ?? 'https://placehold.co/300x200?text=Sin+imagen'}
          alt={product.name}
          className={styles.img}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/300x200?text=Sin+imagen'
          }}
        />
        <div className={styles.badges}>
          {product.facets.free_shipping && (
            <span className={`${styles.badge} ${styles.badgeShipping}`}>Envío gratis</span>
          )}
          {product.facets.eco_friendly && (
            <span className={`${styles.badge} ${styles.badgeEco}`}>Eco</span>
          )}
        </div>
      </div>
      
      {/* Cuerpo - en lista va primero */}
      <div className={styles.body}>
        <span className={styles.category}>{product.category}</span>
        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.brand}>{product.brand}</p>
        <Stars rating={product.rating} />
        <span className={styles.reviews}>({product.reviews_count} reseñas)</span>

        <div className={styles.stockRow}>
          {!inStock && <span className={`${styles.stock} ${styles.stockOut}`}>Agotado</span>}
          {lowStock && <span className={`${styles.stock} ${styles.stockLow}`}>Pocas unidades</span>}
          {inStock && !lowStock && <span className={`${styles.stock} ${styles.stockOk}`}>En stock</span>}
        </div>

        {/* Precio y botón - en lista van dentro del body */}
        {listMode && (
          <div className={styles.listFooter}>
            <div className={styles.price}>{formatPrice(product.price)}</div>
            <button
              className={styles.addBtn}
              disabled={!inStock}
              onClick={(e) => { e.stopPropagation(); onAddToCart?.(product) }}
            >
              {inStock ? '+ Carrito' : 'Avisar'}
            </button>
          </div>
        )}
      </div>

      {/* Footer - solo en modo grid */}
      {!listMode && (
        <div className={styles.footer}>
          <div className={styles.price}>{formatPrice(product.price)}</div>
          <button
            className={styles.addBtn}
            disabled={!inStock}
            onClick={(e) => { e.stopPropagation(); onAddToCart?.(product) }}
          >
            {inStock ? '+ Carrito' : 'Avisar'}
          </button>
        </div>
      )}

    </article>
  )
}