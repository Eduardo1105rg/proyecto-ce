import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ProductDetail } from '../features/catalog/ProductDetail/ProductDetail'
import { getProductById, getRelatedProducts } from '../services/Algolia'
import type { Product } from '../types/product'

/**
 * Estructura del estado interno de la pagina de detalle.
 *
 * @prop id              - ID del producto actualmente cargado.
 * @prop product         - Datos del producto, o null si no fue encontrado o hay error.
 * @prop relatedProducts - Productos relacionados de la misma categoria.
 * @prop loaded          - Indica si la carga ya termino (exitosa o con error).
 */
type ProductResult = {
  id: string
  product: Product | null
  relatedProducts: Product[]
  loaded: boolean
}

/** Estado inicial antes de cualquier carga */
const EMPTY_RESULT: ProductResult = {
  id: '',
  product: null,
  relatedProducts: [],
  loaded: false,
}

/**
 * Pagina de detalle de producto.
 *
 * Lee el ID del producto desde los params de la URL (:id) y realiza
 * dos llamadas secuenciales a Algolia:
 * 1. getProductById para obtener el producto.
 * 2. getRelatedProducts para obtener productos de la misma categoria.
 */
export function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [result, setResult] = useState<ProductResult>(EMPTY_RESULT)

  useEffect(() => {
    if (!id) return

    let active = true

    getProductById(id)
      .then((p) => {
        if (!active) return
        if (!p) {
          setResult({ id, product: null, relatedProducts: [], loaded: true })
          return
        }
        return getRelatedProducts(p).then((related) => {
          if (active) {
            setResult({ id, product: p, relatedProducts: related, loaded: true })
          }
        })
      })
      .catch((error) => {
        if (!active) return
        console.error('Error buscando producto en Algolia:', error)
        setResult({ id, product: null, relatedProducts: [], loaded: true })
      })

    return () => {
      active = false
    }
  }, [id])

  const loading = !id || result.id !== id || !result.loaded
  const product = result.product
  const relatedProducts = result.relatedProducts

  if (loading) {
    return (
      <div style={{
        padding: '48px 24px',
        textAlign: 'center',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <p style={{ color: 'var(--text-muted)' }}>Cargando producto...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div style={{
        padding: '48px 24px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <p style={{ fontSize: '18px', marginBottom: '16px' }}>
          Producto no encontrado
        </p>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '10px 24px',
            backgroundColor: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Volver al catalogo
        </button>
      </div>
    )
  }

  return <ProductDetail product={product} relatedProducts={relatedProducts} />
}