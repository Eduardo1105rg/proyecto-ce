import { useParams, useNavigate } from 'react-router-dom'
import { ProductDetail } from '../features/catalog/ProductDetail/ProductDetail'
import productsData from '../data/products.json'
import type { Product } from '../types/product'

const products = productsData as Product[]

export function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const product = products.find(p => p.object_id === id)

  if (!product) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>Producto no encontrado.</p>
        <button onClick={() => navigate(-1)} style={{ marginTop: '16px', cursor: 'pointer' }}>
          Volver
        </button>
      </div>
    )
  }

  return <ProductDetail product={product} />
}