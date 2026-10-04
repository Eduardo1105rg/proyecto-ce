import { useNavigate } from 'react-router-dom'
import { useHits } from 'react-instantsearch'
import styles from './ProductDetail.module.css'
import { ProductGrid } from '../components/ProductGrid/ProductGrid'
import type { Product } from '../../../types/product'
import { useCarrito } from '../../../context/carritoContext'

/**
 * Props del componente RelatedProducts.
 *
 * @prop category - Categoria cuyo productos relacionados se muestran.
 */
type RelatedProductsProps = {
  category: string
}

/**
 * Grilla de productos relacionados de la misma categoria.
 *
 * Los hits provienen del contexto de InstantSearch que envuelve a este
 * componente, refinado por ProductDetailPage con un Configure que filtra por
 * `category` y excluye el producto actual.
 *
 * No renderiza nada mientras no haya resultados, de modo que la seccion aparece
 * solo cuando la consulta devuelve productos de la misma categoria.
 *
 * @prop category - Categoria cuyo productos relacionados se muestran.
 */
export function RelatedProducts({ category }: RelatedProductsProps) {
  const navigate = useNavigate()
  const { agregar } = useCarrito()
  const { items } = useHits<Product>()

  if (items.length === 0) return null

  return (
    <section className={styles.related}>
      <div className={styles.relatedHeader}>
        <h2 className={styles.relatedTitle}>Mas productos en {category}</h2>
        <span className={styles.relatedCount}>{items.length} productos</span>
      </div>
      <ProductGrid
        products={items}
        viewMode="grid"
        columns={4}
        onProductClick={(p) => navigate(`/producto/${p.objectID}`)}
        onAddToCart={(p) => agregar(p.objectID, 1)}
      />
    </section>
  )
}
