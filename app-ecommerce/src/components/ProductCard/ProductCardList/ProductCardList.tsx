import styles from './ProductCardList.module.css'
import type { Product, StockBranch } from '../../../types/product'
import { UilStar } from '@iconscout/react-unicons'
import { UisStar, UisStarHalfAlt } from '@iconscout/react-unicons-solid'
import { Button } from '../../Button/Button'

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
  const full = Math.floor(rating)
  const half = rating - full >= 0.5
  const empty = 5 - full - (half ? 1 : 0)

  return (
    <div className={styles.stars}>
      {Array.from({ length: full }).map((_, i) => (
        <UisStar key={`f${i}`} size="14" className={styles.starFilled} />
      ))}
      {half && <UisStarHalfAlt size="14" className={styles.starHalf} />}
      {Array.from({ length: empty }).map((_, i) => (
        <UilStar key={`e${i}`} size="14" className={styles.starEmpty} />
      ))}
      <span className={styles.ratingNum}>{rating.toFixed(1)}</span>
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

export function ProductCardList({ product, imageUrl, onAddToCart, onClick }: ProductCardListProps) {
  const totalStock = getTotalStock(product)
  const inStock = totalStock > 0
  const lowStock = totalStock > 0 && totalStock <= 5
  const displayName = product.title ?? product.name ?? 'Sin nombre'


  return (
    <article className={styles.card} onClick={() => onClick?.(product)}>

      {/* Texto - izquierda */}
      <div className={styles.body}>
        <div className={styles.meta}>
          <span className={styles.category}>{product.category}</span>
          <span className={styles.brand}>{product.brand}</span>
        </div>

        <h3 className={styles.name}>{displayName}</h3>

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

      {/* Acciones - centro */}
      <div className={styles.actions}>
        <div className={styles.price}>{formatPrice(product.price)}</div>
        <div className={styles.btns}>
          <Button
            label="Ver detalle"
            variant="outline"
            size="md"
            fullWidth
            onClick={() => onClick?.(product)}
          />
          <Button
            label="Agregar al carrito"
            variant="primary"
            size="md"
            fullWidth
            disabled={!inStock}
            onClick={() => { onAddToCart?.(product) }}
          />
        </div>
      </div>

      {/* Imagen - derecha */}
      <div className={styles.imgWrapper}>
        <img
          src={build_imageUrl(imageUrl)}
          alt={displayName}
          className={styles.img}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/220x185?text=Sin+imagen'
          }}
        />
      </div>

    </article>
  )
}