import styles from './ProductCardList.module.css'
import type { Product, StockBranch } from '../../../types/product'
import { UilStar } from '@iconscout/react-unicons'
import { UisStar, UisStarHalfAlt } from '@iconscout/react-unicons-solid'
import { Button } from '../../Button/Button'

/**
 * Props del componente ProductCardList.
 *
 * @prop product     - Objeto con todos los datos del producto.
 * @prop imageUrl    - Ruta relativa de la imagen dentro de /public. Se construye con build_imageUrl.
 * @prop onAddToCart - Callback que se ejecuta al hacer clic en "Agregar al carrito".
 * @prop onClick     - Callback que se ejecuta al hacer clic en la tarjeta o en "Ver detalle".
 */
type ProductCardListProps = {
  product: Product
  imageUrl?: string
  onAddToCart?: (product: Product) => void
  onClick?: (product: Product) => void
}

/**
 * Calcula el stock total sumando todas las sucursales del producto.
 *
 * @param product - Producto con su arreglo stock_by_branch.
 * @returns Número total de unidades disponibles entre todas las sucursales.
 */
function getTotalStock(product: Product): number {
  return product.stock_by_branch.reduce((acc: number, b: StockBranch) => acc + b.stock, 0)
}

/**
 * Formatea un precio numérico al formato de colones costarricenses.
 *
 * @param price - Precio en número entero (ej. 15000).
 * @returns String formateado (ej. '₡15.000').
 */
function formatPrice(price: number): string {
  return `₡${price.toLocaleString('es-CR')}`
}

/**
 * Componente visual que renderiza estrellas de rating.
 *
 * A diferencia de la versión en grilla, esta muestra el número de reseñas
 * directamente dentro del componente Stars.
 *
 * @param rating - Valor de 0 a 5 (puede tener decimales).
 */
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

/**
 * Construye la URL completa de la imagen del producto.
 *
 * Las imágenes están alojadas en GitHub Pages bajo el repositorio del proyecto.
 * Si no se recibe una ruta válida, retorna una imagen placeholder.
 *
 * @param imagePath - Ruta relativa de la imagen (ej. 'images/producto.jpg').
 * @returns URL absoluta lista para usar en un <img src>.
 */
function build_imageUrl(imagePath: string): string {
  if (!imagePath) {
    return "https://placehold.co/300x220?text=Sin+imagen";
  }
  return `https://eduardo1105rg.github.io/proyecto-ce/${imagePath}`;
  // Alternativa con variable de entorno: `${import.meta.env.BASE_URL}images/${imagePath}`
}

/**
 * Tarjeta de producto en formato lista (horizontal).
 *
 * A diferencia de ProductCardGrid, el layout es horizontal con tres columnas:
 * - Izquierda: información del producto (categoría, nombre, rating, badges de stock y envío).
 * - Centro: precio y botones de acción.
 * - Derecha: imagen del producto.
 *
 * Se usa cuando el usuario activa el modo lista en el ViewToggle del catálogo.
 *
 * @example
 * <ProductCardList
 *   product={hit}
 *   imageUrl={hit.image}
 *   onAddToCart={(p) => addToCart(p)}
 *   onClick={(p) => navigate(`/producto/${p.objectID}`)}
 * />
 */
export function ProductCardList({ product, imageUrl, onAddToCart, onClick }: ProductCardListProps) {
  const totalStock = getTotalStock(product)
  const inStock = totalStock > 0
  const lowStock = totalStock > 0 && totalStock <= 5
  const displayName = product.title ?? product.name ?? 'Sin nombre'

  return (
    <article className={styles.card} onClick={() => onClick?.(product)}>

      {/* Columna izquierda — información del producto */}
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

        {/* Badges de stock y envío */}
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

      {/* Columna central — precio y botones */}
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

      {/* Columna derecha — imagen */}
      <div className={styles.imgWrapper}>
        <img
          src={build_imageUrl(imageUrl ?? '')}
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