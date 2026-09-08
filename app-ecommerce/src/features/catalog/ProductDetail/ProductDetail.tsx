import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './ProductDetail.module.css'
import type { Product, StockBranch } from '../../../types/product'
import { UilArrowLeft } from '@iconscout/react-unicons'
import { UisStar, UisStarHalfAlt } from '@iconscout/react-unicons-solid'
import { UilStar } from '@iconscout/react-unicons'
import { Button } from '../../../components/Button/Button'

type ProductDetailProps = {
  product: Product
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
        <UisStar key={`f${i}`} size="18" className={styles.starFilled} />
      ))}
      {half && <UisStarHalfAlt size="18" className={styles.starHalf} />}
      {Array.from({ length: empty }).map((_, i) => (
        <UilStar key={`e${i}`} size="18" className={styles.starEmpty} />
      ))}
    </div>
  )
}

export function ProductDetail({ product }: ProductDetailProps) {
  const navigate = useNavigate()
  const totalStock = getTotalStock(product)
  const inStock = totalStock > 0
  const lowStock = totalStock > 0 && totalStock <= 5
  const displayName = product.title ?? product.name ?? 'Sin nombre'

  // Agregar al inicio del componente junto a los otros estados:
  const [isB2B, setIsB2B] = useState(false)

  // Precio activo según modo:
  const activePrice = isB2B && product.tiered_b2b_pricing.length > 0
    ? product.tiered_b2b_pricing[0].unit_price
    : product.price

  const minQty = product.tiered_b2b_pricing[0]?.min_qty

  const images = product.images.length > 0
    ? product.images.map(_ => `https://placehold.co/600x500?text=${encodeURIComponent(displayName)}`)
    : ['https://placehold.co/600x500?text=Sin+imagen']

  const [activeImg, setActiveImg] = useState(0)

  return (
    <div className={styles.page}>

      {/* Botón volver */}
      <button className={styles.backBtn} onClick={() => navigate(-1)}>
        <UilArrowLeft size="18" />
        Volver al catálogo
      </button>

      <div className={styles.layout}>

        {/* Columna izquierda - galería fija */}
        <div className={styles.gallery}>
          <div className={styles.mainImg}>
            <img
              src={images[activeImg]}
              alt={displayName}
              className={styles.img}
            />
          </div>
          {images.length > 1 && (
            <div className={styles.thumbs}>
              {images.map((img, i) => (
                <button
                  key={i}
                  className={`${styles.thumb} ${i === activeImg ? styles.thumbActive : ''}`}
                  onClick={() => setActiveImg(i)}
                >
                  <img src={img} alt={`Vista ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Columna derecha - info apilada */}
        <div className={styles.rightCol}>

          {/* Switch B2B */}
          {product.tiered_b2b_pricing.length > 0 && (
            <div className={styles.b2bRow}>
              <span className={styles.b2bLabel}>Modo mayorista (B2B)</span>
              <button
                className={`${styles.switch} ${isB2B ? styles.switchOn : ''}`}
                onClick={() => setIsB2B(prev => !prev)}
                aria-label="Cambiar modo B2B"
              >
                <span className={styles.switchThumb} />
              </button>
            </div>
          )}

          {/* Burbuja 1 - info principal + botones */}
          <div className={styles.card}>
            <div className={styles.topRow}>
              <span className={styles.category}>{product.category}</span>
              {product.facets.free_shipping && (
                <span className={`${styles.badge} ${styles.badgeShipping}`}>Envío gratis</span>
              )}
              {product.facets.eco_friendly && (
                <span className={`${styles.badge} ${styles.badgeEco}`}>Eco</span>
              )}
            </div>

            <h1 className={styles.name}>{displayName}</h1>
            <p className={styles.brand}>{product.brand}</p>

            <div className={styles.ratingRow}>
              <Stars rating={product.rating} />
              <span className={styles.ratingNum}>{product.rating.toFixed(1)}</span>
              <span className={styles.reviews}>({product.reviews_count} reseñas)</span>
            </div>

            <div className={styles.priceBlock}>
              <span className={styles.price}>{formatPrice(activePrice)}</span>
              <span className={styles.currency}>{product.currency}</span>
              {isB2B && minQty && (
                <span className={styles.minQty}>mín. {minQty} unidades</span>
              )}
            </div>

            <div className={styles.stockRow}>
              {!inStock && <span className={`${styles.stock} ${styles.stockOut}`}>Agotado</span>}
              {lowStock && <span className={`${styles.stock} ${styles.stockLow}`}>Pocas unidades — quedan {totalStock}</span>}
              {inStock && !lowStock && <span className={`${styles.stock} ${styles.stockOk}`}>En stock ({totalStock} disponibles)</span>}
            </div>

            <div className={styles.btnGroup}>
              <Button label="Agregar al carrito" variant="outline" size="lg" fullWidth disabled={!inStock} />
              <Button label="Comprar ahora" variant="primary" size="lg" fullWidth disabled={!inStock} />
            </div>
          </div>

          {/* Burbuja 2 - info extra */}
          <div className={styles.card}>
            <span className={styles.cardTitle}>Información del producto</span>

            <div className={styles.details}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>SKU</span>
                <span className={styles.detailValue}>{product.sku}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Garantía</span>
                <span className={styles.detailValue}>{product.warranty_months} meses</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Devolución</span>
                <span className={styles.detailValue}>{product.return_days} días</span>
              </div>
              {product.facets.color && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Color</span>
                  <span className={styles.detailValue}>{product.facets.color}</span>
                </div>
              )}
              {product.facets.material && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Material</span>
                  <span className={styles.detailValue}>{product.facets.material}</span>
                </div>
              )}
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Subcategoría</span>
                <span className={styles.detailValue}>{product.facets.subcategory}</span>
              </div>
              {product.facets.tax_exempt && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Impuesto</span>
                  <span className={styles.detailValue}>Exento</span>
                </div>
              )}
            </div>

            <span className={styles.cardTitle}>Etiquetas:</span>
            {product.tags.length > 0 && (
              <div className={styles.tags}>
                {product.tags.map(tag => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}