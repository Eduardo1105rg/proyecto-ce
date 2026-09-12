import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './ProductDetail.module.css'
import type { Product, StockBranch } from '../../../types/product'
import {
  UilArrowLeft,
  UilCardAtm,
  UilMobileAndroid,
  UilUniversity,
  UilStar
} from '@iconscout/react-unicons'
import { UisStar, UisStarHalfAlt } from '@iconscout/react-unicons-solid'
import { Button } from '../../../components/Button/Button'
import { ProductGrid } from '../components/ProductGrid/ProductGrid'

/**
 * Props del componente ProductDetail.
 *
 * @prop product         - Producto principal a mostrar en detalle.
 * @prop relatedProducts - Productos de la misma categoria para mostrar al final. Por defecto: [].
 */
type ProductDetailProps = {
  product: Product
  relatedProducts?: Product[]
}

/**
 * Calcula el stock total sumando todas las sucursales del producto.
 *
 * @param product - Producto con su arreglo stock_by_branch.
 * @returns Numero total de unidades disponibles entre todas las sucursales.
 */
function getTotalStock(product: Product): number {
  return product.stock_by_branch.reduce((acc: number, b: StockBranch) => acc + b.stock, 0)
}

/**
 * Formatea un precio numerico al formato de colones costarricenses.
 *
 * @param price - Precio en numero entero (ej. 15000).
 * @returns String formateado (ej. '₡15.000').
 */
function formatPrice(price: number): string {
  return `₡${price.toLocaleString('es-CR')}`
}

/**
 * Componente visual que renderiza estrellas de rating.
 * Calcula estrellas llenas, media estrella y vacias a partir del valor numerico.
 *
 * @param rating - Valor de 0 a 5, puede tener decimales.
 */
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

/**
 * Construye la URL completa de la imagen del producto.
 * Las imagenes estan alojadas en GitHub Pages bajo el repositorio del proyecto.
 * Si no se recibe una ruta valida, retorna una imagen placeholder.
 *
 * @param imagePath - Ruta relativa de la imagen (ej. 'producto.jpg').
 * @returns URL absoluta lista para usar en un img src.
 */
function buildImageUrl(imagePath: string | undefined): string {
  if (!imagePath) {
    return "https://placehold.co/600x500?text=Sin+imagen"
  }
  return `https://eduardo1105rg.github.io/proyecto-ce/images/${imagePath}`;
}

/** Capitaliza la primera letra de un string */
const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

/**
 * Mapa de metodos de pago a sus etiquetas e iconos visuales.
 * Si un metodo no esta en el mapa, se usa un icono generico y se capitaliza el string.
 */
const paymentMethodIcons: Record<string, { label: string; icon: React.ReactNode }> = {
  tarjeta: {
    label: 'Tarjeta de Credito/Debito',
    icon: <UilCardAtm size="18" className={styles.paymentIcon} />
  },
  sinpe: {
    label: 'Sinpe Movil',
    icon: <UilMobileAndroid size="18" className={styles.paymentIcon} />
  },
  transferencia: {
    label: 'Transferencia Bancaria',
    icon: <UilUniversity size="18" className={styles.paymentIcon} />
  },
}

/**
 * Convierte un branch_id interno al nombre legible de la sucursal.
 * Si el ID no esta en la lista conocida, lo formatea separando por guion y capitalizando.
 *
 * @param branchId - ID de sucursal (ej. 'lm-guapiles').
 * @returns Nombre legible (ej. 'Limon, Guapiles').
 */
function nombreSucursal(branchId: string): string {
  if (branchId === 'lm-guapiles') return 'Limon, Guapiles'
  if (branchId === 'sj-escazu') return 'San Jose, Escazu'
  if (branchId === 'ct-central') return 'Cartago, Central'
  if (branchId === 'hr-sarapiqui') return 'Heredia, Sarapiqui'
  return branchId.split('-').map(word => capitalize(word)).join(' ')
}

/**
 * Vista de detalle de un producto.
 *
 * Layout de dos columnas:
 * - Izquierda: galeria de imagenes con miniaturas seleccionables.
 * - Derecha: informacion apilada en tarjetas (cards):
 *   1. Info principal - nombre, precio, rating, stock y botones de accion.
 *   2. Info del producto - atributos del facet, SKU, garantia, tags.
 *   3. Metodos de pago - iconos y etiquetas por metodo disponible.
 *   4. Stock por sucursal - disponibilidad desglosada por branch.
 *
 * Incluye un switch de modo B2B que cambia el precio activo al primer
 * precio del arreglo tiered_b2b_pricing cuando esta activado.
 * Solo aparece si el producto tiene precios B2B configurados.
 *
 * Al final de la pagina se muestra un grid de productos relacionados
 * de la misma categoria, si se reciben via la prop relatedProducts.
 */
export function ProductDetail({ product, relatedProducts = [] }: ProductDetailProps) {
  const navigate = useNavigate()
  const totalStock = getTotalStock(product)
  const inStock = totalStock > 0
  const lowStock = totalStock > 0 && totalStock <= 5
  const displayName = product.title ?? product.name ?? 'Sin nombre'

  /** Controla si el modo mayorista B2B esta activo */
  const [isB2B, setIsB2B] = useState(false)

  /**
   * Precio activo segun el modo:
   * - B2B activo: primer precio del arreglo tiered_b2b_pricing.
   * - B2B inactivo: precio normal del producto.
   */
  const activePrice = isB2B && product.tiered_b2b_pricing.length > 0
    ? product.tiered_b2b_pricing[0].unit_price
    : product.price

  const minQty = product.tiered_b2b_pricing[0]?.min_qty

  /** Construye el arreglo de URLs de imagenes; usa placeholder si no hay imagenes */
  const images = product.images && product.images.length > 0
    ? product.images.map(img => buildImageUrl(img))
    : ['https://placehold.co/600x500?text=Sin+imagen']

  /** Indice de la imagen activa en la galeria */
  const [activeImg, setActiveImg] = useState(0)

  return (
    <div className={styles.page}>

      {/* Boton volver - navega a la pagina anterior en el historial */}
      <button className={styles.backBtn} onClick={() => navigate(-1)}>
        <UilArrowLeft size="18" />
        Volver al catalogo
      </button>

      <div className={styles.layout}>

        {/* Columna izquierda - galeria de imagenes */}
        <div className={styles.gallery}>
          <div className={styles.mainImg}>
            <img
              src={images[activeImg]}
              alt={displayName}
              className={styles.img}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/600x500?text=Sin+imagen'
              }}
            />
          </div>
          {/* Miniaturas - solo se muestran si hay mas de una imagen */}
          {images.length > 1 && (
            <div className={styles.thumbs}>
              {images.map((img, i) => (
                <button
                  key={i}
                  className={`${styles.thumb} ${i === activeImg ? styles.thumbActive : ''}`}
                  onClick={() => setActiveImg(i)}
                >
                  <img
                    src={img}
                    alt={`Vista ${i + 1}`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/72x72?text=Sin+imagen'
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Columna derecha - informacion apilada en cards */}
        <div className={styles.rightCol}>

          {/* Switch B2B - visible solo si el producto tiene precios mayoristas */}
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

          {/* Card 1 - info principal, precio y botones de accion */}
          <div className={styles.card}>
            <div className={styles.topRow}>
              <span className={styles.category}>{product.category}</span>
              {product.facets.free_shipping && (
                <span className={`${styles.badge} ${styles.badgeShipping}`}>Envio gratis</span>
              )}
              {product.facets.eco_friendly && (
                <span className={`${styles.badge} ${styles.badgeEco}`}>Eco</span>
              )}
              {product.facets.tax_exempt && (
                <span className={`${styles.badge} ${styles.badgeTax}`}>Exento de impuestos</span>
              )}
            </div>

            <h1 className={styles.name}>{displayName}</h1>
            <p className={styles.brand}>{product.brand || 'Marca no especificada'}</p>

            <div className={styles.ratingRow}>
              <Stars rating={product.rating} />
              <span className={styles.ratingNum}>{product.rating.toFixed(1)}</span>
              <span className={styles.reviews}>({product.reviews_count} resenas)</span>
            </div>

            <div className={styles.priceBlock}>
              <span className={styles.price}>{formatPrice(activePrice)}</span>
              <span className={styles.currency}>{product.currency}</span>
              {/* Cantidad minima de compra en modo B2B */}
              {isB2B && minQty && (
                <span className={styles.minQty}>min. {minQty} unidades</span>
              )}
            </div>

            <div className={styles.stockRow}>
              {!inStock && <span className={`${styles.stock} ${styles.stockOut}`}>Agotado</span>}
              {lowStock && <span className={`${styles.stock} ${styles.stockLow}`}>Pocas unidades - quedan {totalStock}</span>}
              {inStock && !lowStock && <span className={`${styles.stock} ${styles.stockOk}`}>En stock ({totalStock} disponibles)</span>}
            </div>

            <div className={styles.btnGroup}>
              <Button label="Agregar al carrito" variant="outline" size="lg" fullWidth disabled={!inStock} />
              <Button label="Comprar ahora" variant="primary" size="lg" fullWidth disabled={!inStock} />
            </div>
          </div>

          {/* Card 2 - atributos del producto y tags */}
          <div className={styles.card}>
            <span className={styles.cardTitle}>Informacion del producto</span>

            <div className={styles.details}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>SKU</span>
                <span className={styles.detailValue}>{product.sku}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Garantia</span>
                <span className={styles.detailValue}>{product.warranty_months} meses</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Devolucion</span>
                <span className={styles.detailValue}>{product.return_days} dias</span>
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
              {product.facets.style && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Estilo</span>
                  <span className={styles.detailValue}>{product.facets.style}</span>
                </div>
              )}
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Subcategoria</span>
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
            {product.tags && product.tags.length > 0 && (
              <div className={styles.tags}>
                {product.tags.map(tag => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* Card 3 - metodos de pago con iconos */}
          {product.payment_methods && product.payment_methods.length > 0 && (
            <div className={styles.card}>
              <span className={styles.cardTitle}>Metodos de pago</span>
              <div className={styles.paymentMethods}>
                {product.payment_methods.map((method) => {
                  /* Si el metodo no esta en el mapa, usa icono generico y capitaliza */
                  const info = paymentMethodIcons[method] || {
                    label: capitalize(method),
                    icon: <UilCardAtm size="18" className={styles.paymentIcon} />
                  }
                  return (
                    <div key={method} className={styles.paymentMethod}>
                      {info.icon}
                      <span className={styles.paymentLabel}>{info.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Card 4 - stock desglosado por sucursal */}
          {product.stock_by_branch && product.stock_by_branch.length > 0 && (
            <div className={styles.card}>
              <span className={styles.cardTitle}>Disponibilidad por sucursal</span>
              <div className={styles.branchStock}>
                {product.stock_by_branch.map((branch) => {
                  const branchName = nombreSucursal(branch.branch_id)
                  return (
                    <div key={branch.branch_id} className={styles.branchStockRow}>
                      <span className={styles.branchName}>{branchName}</span>
                      <span className={branch.stock > 0 ? styles.branchStockOk : styles.branchStockOut}>
                        {branch.stock > 0 ? `${branch.stock} unidades` : 'Agotado'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Seccion de productos relacionados - visible solo si hay productos */}
      {relatedProducts.length > 0 && (
        <section className={styles.related}>
          <div className={styles.relatedHeader}>
            <h2 className={styles.relatedTitle}>Mas productos en {product.category}</h2>
            <span className={styles.relatedCount}>{relatedProducts.length} productos</span>
          </div>
          <ProductGrid
            products={relatedProducts}
            viewMode="grid"
            columns={4}
            onProductClick={(p) => navigate(`/producto/${p.objectID}`)}
            onAddToCart={(p) => console.log('Agregar al carrito:', p.title ?? p.name)}
          />
        </section>
      )}

    </div>
  )
}