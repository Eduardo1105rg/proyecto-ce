import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './ProductDetail.module.css'
import type { Product } from '../../../types/product'
import {
  UilArrowLeft,
  UilStar
} from '@iconscout/react-unicons'
import { UisStar, UisStarHalfAlt } from '@iconscout/react-unicons-solid'
import { Button } from '../../../components/Button/Button'
import { QuantityStepper } from '../../../components/QuantityStepper/QuantityStepper'
import { useCarrito } from '../../../context/carritoContext'
import { useAuth } from '../../auth/useAuth'
import { SUCURSALES, nombreSucursal } from '../../../data/sucursales'
import { resolverPrecio } from '../../../services/precios'
import {
  obtenerStockSucursal,
  obtenerStockTotal,
  obtenerSucursalConMayorStock,
} from '../../../services/inventario'

/**
 * Props del componente ProductDetail.
 *
 * @prop product  - Producto principal a mostrar en detalle.
 * @prop children - Contenido adicional al final de la pagina, dentro del mismo
 *                  contenedor. Lo usa ProductDetailPage para inyectar la grilla
 *                  de productos relacionados, que es una busqueda independiente.
 */
type ProductDetailProps = {
  product: Product
  children?: React.ReactNode
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

/**
 * Vista de detalle de un producto.
 *
 * Layout de dos columnas:
 * - Izquierda: galeria de imagenes con miniaturas seleccionables.
 * - Derecha: informacion apilada en tarjetas (cards):
 *   1. Info principal - nombre, precio, rating, stock y botones de accion.
 *   2. Info del producto - atributos del facet, SKU, garantia, tags.
 *   3. Stock por sucursal - disponibilidad desglosada por branch.
 *
 * El precio se resuelve automaticamente a partir del rol y de la cantidad
 * total del producto en el carrito. La sucursal de compra se elige aqui y la
 * cantidad maxima se limita al stock efectivo de esa sucursal.
 *
 * Al final de la pagina renderiza los children recibidos, que se usan para
 * mostrar un grid de productos relacionados.
 */
export function ProductDetail({ product, children }: ProductDetailProps) {
  const navigate = useNavigate()
  const { items, agregar, cambiarCantidad } = useCarrito()
  const { usuario } = useAuth()
  const totalStock = obtenerStockTotal(product)
  const inStock = totalStock > 0
  const displayName = product.name ?? 'Sin nombre'
  const esAdmin = usuario?.rol === 'ADMIN'

  const [branchId, setBranchId] = useState(
    () => obtenerSucursalConMayorStock(product).branchId,
  )

  const lineasProducto = items.filter((item) => item.objectID === product.objectID)
  const cantidadTotalProducto = lineasProducto.reduce(
    (total, item) => total + item.cantidad,
    0,
  )
  const lineaSeleccionada = lineasProducto.find((item) => item.branchId === branchId)
  const quantity = lineaSeleccionada?.cantidad ?? 0
  const stockSucursal = obtenerStockSucursal(product, branchId)
  const agotadoSucursal = stockSucursal <= 0
  const lowStock = stockSucursal > 0 && stockSucursal <= 5
  const precio = resolverPrecio(product, usuario?.rol ?? null, cantidadTotalProducto)
  const referenciaB2B =
    precio.precioB2BReferencia !== null && precio.precioB2BReferencia !== precio.precioUnitario
      ? precio.precioB2BReferencia
      : null
  const minQty = precio.minimoB2B || product.tiered_b2b_pricing[0]?.min_qty

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

          <div className={styles.branchSelector}>
            <label className={styles.branchSelectLabel} htmlFor="sucursal-compra">
              Sucursal de compra
            </label>
            <select
              id="sucursal-compra"
              className={styles.branchSelect}
              value={branchId}
              onChange={(event) => setBranchId(event.target.value)}
            >
              {SUCURSALES.map((sucursal) => {
                const stock = obtenerStockSucursal(product, sucursal.id)

                return (
                  <option key={sucursal.id} value={sucursal.id} disabled={stock <= 0}>
                    {sucursal.nombre} — {stock > 0 ? `${stock} unidades` : 'Agotado'}
                  </option>
                )
              })}
            </select>
          </div>

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
              <span className={styles.price}>{formatPrice(precio.precioUnitario)}</span>
              <span className={styles.currency}>{product.currency}</span>
              {precio.tipo === 'B2B' && (
                <span className={styles.minQty}>Precio B2B aplicado</span>
              )}
              {referenciaB2B !== null && (
                <span className={styles.b2bRef}>
                  Referencia B2B: {formatPrice(referenciaB2B)} c/u
                </span>
              )}
              {usuario?.rol === 'B2B' && minQty > 0 && (
                <span className={styles.minQty}>min. {minQty} unidades por producto</span>
              )}
            </div>

            <div className={styles.stockRow}>
              {!inStock && <span className={`${styles.stock} ${styles.stockOut}`}>Agotado en todas las sucursales</span>}
              {inStock && agotadoSucursal && (
                <span className={`${styles.stock} ${styles.stockOut}`}>
                  Agotado en {nombreSucursal(branchId)}
                </span>
              )}
              {lowStock && (
                <span className={`${styles.stock} ${styles.stockLow}`}>
                  Pocas unidades en {nombreSucursal(branchId)} - quedan {stockSucursal}
                </span>
              )}
              {inStock && !agotadoSucursal && !lowStock && (
                <span className={`${styles.stock} ${styles.stockOk}`}>
                  En stock en {nombreSucursal(branchId)} ({stockSucursal} disponibles)
                </span>
              )}
            </div>

            <div className={styles.btnGroup}>
              {/* Si el producto ya esta en el carrito, el boton se transforma en el control de cantidad */}
              {quantity > 0 && lineaSeleccionada ? (
                <QuantityStepper
                  label={displayName}
                  quantity={quantity}
                  max={stockSucursal}
                  size="lg"
                  fullWidth
                  onDecrease={() => cambiarCantidad(lineaSeleccionada.lineId, quantity - 1)}
                  onIncrease={() => agregar(product.objectID, branchId, 1, product.name)}
                />
              ) : (
                <Button
                  label={esAdmin ? 'No disponible para ADMIN' : 'Agregar al carrito'}
                  variant="outline"
                  size="lg"
                  fullWidth
                  disabled={!inStock || agotadoSucursal || esAdmin}
                  onClick={() => agregar(product.objectID, branchId, 1, product.name)}
                />
              )}
              {/* <Button label="Comprar ahora" variant="primary" size="lg" fullWidth disabled={!inStock} /> */}
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

          {/* Card 3 - stock desglosado por sucursal */}
          <div className={styles.card}>
            <span className={styles.cardTitle}>Disponibilidad por sucursal</span>
            <div className={styles.branchStock}>
              {SUCURSALES.map((sucursal) => {
                const stock = obtenerStockSucursal(product, sucursal.id)

                return (
                  <div key={sucursal.id} className={styles.branchStockRow}>
                    <span className={styles.branchName}>{sucursal.nombre}</span>
                    <span className={stock > 0 ? styles.branchStockOk : styles.branchStockOut}>
                      {stock > 0 ? `${stock} unidades` : 'Agotado'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Espacio para contenido adicional, por ejemplo los productos relacionados */}
      {children}

    </div>
  )
}
