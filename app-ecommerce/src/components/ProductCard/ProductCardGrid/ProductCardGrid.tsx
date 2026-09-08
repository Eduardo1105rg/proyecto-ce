import styles from './ProductCardGrid.module.css'
import type { Product, StockBranch } from '../../../types/product'
import { UilShoppingCart, UilStar } from '@iconscout/react-unicons'
import { UisStar, UisStarHalfAlt } from '@iconscout/react-unicons-solid'
import { Button } from '../../Button/Button'

type ProductCardGridProps = {
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
  const full = Math.floor(rating)
  const half = rating - full >= 0.5
  const empty = 5 - full - (half ? 1 : 0)

  return (
    <div className={styles.stars}>
      {Array.from({ length: full }).map((_, i) => (
        <UisStar key={`f${i}`} size="13" className={styles.starFilled} />
      ))}
      {half && <UisStarHalfAlt size="13" className={styles.starHalf} />}
      {Array.from({ length: empty }).map((_, i) => (
        <UilStar key={`e${i}`} size="13" className={styles.starEmpty} />
      ))}
    </div>
  )
}

function build_imageUrl(imagePath: string): string {
  if (!imagePath) {
    return "https://placehold.co/300x220?text=Sin+imagen";
  }
  // Ajusta según tu estructura real en /public
  return `proyecto-ce/public${imagePath}`;
  // return `${import.meta.env.BASE_URL}images/${imagePath}`;
}



export function ProductCardGrid({ product, imageUrl, onAddToCart, onClick }: ProductCardGridProps) {
  const totalStock = getTotalStock(product)
  const inStock = totalStock > 0
  const lowStock = totalStock > 0 && totalStock <= 5
  const displayName = product.title ?? product.name ?? 'Sin nombre'


  return (
    <article className={styles.card} onClick={() => onClick?.(product)}>

      {/* Imagen */}
      <div className={styles.imgWrapper}>
        <img
          src={build_imageUrl(imageUrl)}
          alt={displayName}
          className={styles.img}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/300x220?text=Sin+imagen'
          }}
        />

        {/* Badges izquierda */}
        <div className={styles.badges}>
          {product.facets.free_shipping && (
            <span className={`${styles.badge} ${styles.badgeShipping}`}>Envío gratis</span>
          )}
          {product.facets.eco_friendly && (
            <span className={`${styles.badge} ${styles.badgeEco}`}>Eco</span>
          )}
        </div>

        {/* Stock derecha */}
        <div className={styles.stockBadge}>
          {!inStock && <span className={`${styles.stock} ${styles.stockOut}`}>Agotado</span>}
          {lowStock && <span className={`${styles.stock} ${styles.stockLow}`}>Pocas unidades</span>}
        </div>
      </div>

      {/* Cuerpo */}
      <div className={styles.body}>
        <span className={styles.category}>{product.category}</span>
        <h3 className={styles.name}>{displayName}</h3>

        {/* Rating + reseñas en la misma fila */}
        <div className={styles.ratingRow}>
          <Stars rating={product.rating} />
          <span className={styles.ratingNum}>{product.rating.toFixed(1)}</span>
          <span className={styles.reviews}>({product.reviews_count})</span>
        </div>

      </div>

      {/* Footer - precio arriba, botones abajo */}
      <div className={styles.footer}>
        <div className={styles.priceRow}>
          <div className={styles.price}>{formatPrice(product.price)}</div>
          <button
            className={styles.cartBtn}
            disabled={!inStock}
            title={inStock ? 'Agregar al carrito' : 'Sin stock'}
            onClick={(e) => { e.stopPropagation(); onAddToCart?.(product) }}
          >
            <UilShoppingCart size="16" />
          </button>
        </div>
        <Button
          label="Ver detalle"
          variant="soft"
          size="sm"
          fullWidth
          onClick={() => onClick?.(product)}
        />
      </div>

    </article >
  )
}