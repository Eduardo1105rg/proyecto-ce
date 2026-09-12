import styles from './ProductCardGrid.module.css'
import type { Product, StockBranch } from '../../../types/product'
import { UilShoppingCart, UilStar } from '@iconscout/react-unicons'
import { UisStar, UisStarHalfAlt } from '@iconscout/react-unicons-solid'
import { Button } from '../../Button/Button'

/**
 * Props del componente ProductCardGrid.
 *
 * @prop product     - Objeto con todos los datos del producto (tipo, precio, stock, etc.).
 * @prop imageUrl    - Ruta relativa de la imagen dentro de /public. Se construye con build_imageUrl.
 * @prop onAddToCart - Callback que se ejecuta al hacer clic en el botón de carrito.
 * @prop onClick     - Callback que se ejecuta al hacer clic en la tarjeta o en "Ver detalle".
 */
type ProductCardGridProps = {
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
 * Calcula cuántas estrellas llenas, medias y vacías mostrar
 * a partir del rating numérico del producto.
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
        <UisStar key={`f${i}`} size="13" className={styles.starFilled} />
      ))}
      {half && <UisStarHalfAlt size="13" className={styles.starHalf} />}
      {Array.from({ length: empty }).map((_, i) => (
        <UilStar key={`e${i}`} size="13" className={styles.starEmpty} />
      ))}
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
 * Tarjeta de producto en formato grid.
 *
 * Muestra la imagen con badges superpuestos (envío gratis, eco, exento de impuestos),
 * el nombre, rating, precio y botones de acción. El botón de carrito se deshabilita
 * si el producto no tiene stock.
 *
 * El clic en la tarjeta completa también dispara `onClick` para navegar al detalle.
 * El botón de carrito usa `stopPropagation` para no activar el onClick de la tarjeta.
 *
 * @example
 * <ProductCardGrid
 *   product={hit}
 *   imageUrl={hit.image}
 *   onAddToCart={(p) => addToCart(p)}
 *   onClick={(p) => navigate(`/producto/${p.objectID}`)}
 * />
 */
export function ProductCardGrid({ product, imageUrl, onAddToCart, onClick }: ProductCardGridProps) {
  const totalStock = getTotalStock(product)
  const inStock = totalStock > 0
  const lowStock = totalStock > 0 && totalStock <= 5
  const displayName = product.title ?? product.name ?? 'Sin nombre'

  return (
    <article className={styles.card} onClick={() => onClick?.(product)}>

      {/* Imagen con badges superpuestos */}
      <div className={styles.imgWrapper}>
        <img
          src={build_imageUrl(imageUrl ?? '')}
          alt={displayName}
          className={styles.img}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/300x220?text=Sin+imagen'
          }}
        />

        {/* Badges — esquina izquierda */}
        <div className={styles.badges}>
          {product.facets.free_shipping && (
            <span className={`${styles.badge} ${styles.badgeShipping}`}>Envío gratis</span>
          )}
          {product.facets.eco_friendly && (
            <span className={`${styles.badge} ${styles.badgeEco}`}>Eco</span>
          )}
          {product.facets.tax_exempt && (
            <span className={`${styles.badge} ${styles.badgeTax}`}>Exento de impuestos</span>
          )}
        </div>

        {/* Badge de stock — esquina derecha, solo si es bajo o agotado */}
        <div className={styles.stockBadge}>
          {!inStock && <span className={`${styles.stock} ${styles.stockOut}`}>Agotado</span>}
          {lowStock && <span className={`${styles.stock} ${styles.stockLow}`}>Pocas unidades</span>}
        </div>
      </div>

      {/* Información del producto */}
      <div className={styles.body}>
        <span className={styles.category}>{product.category}</span>
        <h3 className={styles.name}>{displayName}</h3>

        <div className={styles.ratingRow}>
          <Stars rating={product.rating} />
          <span className={styles.ratingNum}>{product.rating.toFixed(1)}</span>
          <span className={styles.reviews}>({product.reviews_count})</span>
        </div>
      </div>

      {/* Footer: precio y acciones */}
      <div className={styles.footer}>
        <div className={styles.priceRow}>
          <div className={styles.price}>{formatPrice(product.price)}</div>
          {/* stopPropagation evita que el clic en carrito también active onClick de la tarjeta */}
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
    </article>
  )
}