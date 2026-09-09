import { useParams, useNavigate } from 'react-router-dom'
import { ProductDetail } from '../features/catalog/ProductDetail/ProductDetail'
import { useInstantSearch } from 'react-instantsearch'
import { useState, useEffect } from 'react'
import { InstantSearch } from 'react-instantsearch'
import { liteClient as algoliasearch } from 'algoliasearch/lite'
import type { Product } from '../types/product'

// Configuración del cliente Algolia
const searchClient = algoliasearch(
  import.meta.env.VITE_ALGOLIA_APP_ID,
  import.meta.env.VITE_ALGOLIA_SEARCH_KEY
)

const INDEX_MAIN = import.meta.env.VITE_ALGOLIA_INDEX_MAIN

// Crear un componente interno que usa useInstantSearch
function ProductDetailContent() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { results } = useInstantSearch()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    // Buscar en los resultados actuales del catálogo
    const hitFromResults = results?.hits?.find(
      (hit: any) => hit.objectID === id
    ) as Product | undefined

    if (hitFromResults) {
      setProduct(hitFromResults)
      setLoading(false)
      return
    }

    // Buscar específicamente en Algolia
    searchClient.search({
      requests: [{
        indexName: INDEX_MAIN,
        query: '',
        filters: `objectID:"${id}"`,
        hitsPerPage: 1,
        attributesToRetrieve: ['*'],
      }]
    }).then((response) => {
      const hits = (response.results[0] as { hits: Product[] }).hits
      if (hits.length > 0) {
        setProduct(hits[0])
      } else {
        setProduct(null)
      }
      setLoading(false)
    }).catch((error) => {
      console.error('Error buscando producto en Algolia:', error)
      setProduct(null)
      setLoading(false)
    })
  }, [id, results])

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
          Volver al catálogo
        </button>
      </div>
    )
  }

  return <ProductDetail product={product} />
}

export function ProductDetailPage() {
  return (
    <InstantSearch
      searchClient={searchClient}
      indexName={INDEX_MAIN}
    >
      <ProductDetailContent />
    </InstantSearch>
  )
}