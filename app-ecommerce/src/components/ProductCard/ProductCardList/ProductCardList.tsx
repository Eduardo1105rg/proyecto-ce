import styles from './ProductCardList.module.css'
import type { Product, StockBranch } from '../../types/product'

type ProductCardListProps = {
  product: Product
  imageUrl?: string
  onAddToCart?: (product: Product) => void
  onClick?: (product: Product) => void
}

function getTotalStock(product: Product): number {
  return product.stock_by_branch.reduce((acc: number, b: StockBranch) => acc + b.stock, 0)
}

function formatPrice(price: number): string {
  return `₡${price.toLocaleString('es-CR')}`
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className={styles.stars}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= Math.round(rating) ? styles.starFilled : styles.starEmpty}>
          ★
        </span>
      ))}
      <span className={styles.ratingNum}>{rating.toFixed(1)}</span>
    </div>
  )
}

export function ProductCardList({ product, imageUrl, onAddToCart, onClick }: ProductCardListProps) {
  const totalStock = getTotalStock(product)
  const inStock = totalStock > 0
  const lowStock = totalStock > 0 && totalStock <= 5

  return (
    <article className={styles.card} onClick={() => onClick?.(product)}>

      {/* Texto - izquierda */}
      <div className={styles.body}>
        <div className={styles.meta}>
          <span className={styles.category}>{product.category}</span>
          <span className={styles.brand}>{product.brand}</span>
        </div>

        <h3 className={styles.name}>{product.name}</h3>

        <div className={styles.row}>
          <Stars rating={product.rating} />
          <span className={styles.reviews}>({product.reviews_count} reseñas)</span>
        </div>

        <div className={styles.row}>
          {!inStock && <span className={`${styles.stock} ${styles.stockOut}`}>Agotado</span>}
          {lowStock && <span className={`${styles.stock} ${styles.stockLow}`}>Pocas unidades</span>}
          {inStock && !lowStock && <span className={`${styles.stock} ${styles.stockOk}`}>En stock</span>}
          {product.facets.free_shipping && (
            <span className={`${styles.badge} ${styles.badgeShipping}`}>Envío gratis</span>
          )}
          {product.facets.eco_friendly && (
            <span className={`${styles.badge} ${styles.badgeEco}`}>Eco</span>
          )}
        </div>
      </div>

      {/* Precio y acción */}
      <div className={styles.actions}>
        <div className={styles.price}>{formatPrice(product.price)}</div>
        <button
          className={styles.addBtn}
          disabled={!inStock}
          onClick={(e) => { e.stopPropagation(); onAddToCart?.(product) }}
        >
          {inStock ? '+ Carrito' : 'Avisar'}
        </button>
      </div>

      {/* Imagen - derecha */}
      <div className={styles.imgWrapper}>
        <img
          src={imageUrl ?? 'https://placehold.co/160x140?text=Sin+imagen'}
          alt={product.name}
          className={styles.img}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/160x140?text=Sin+imagen'
          }}
        />
      </div>

    </article>
  )
}