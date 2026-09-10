import { useParams, useNavigate } from 'react-router-dom'
import { ProductDetail } from '../features/catalog/ProductDetail/ProductDetail'
import { useInstantSearch } from 'react-instantsearch'
import { useState, useEffect } from 'react'
import { InstantSearch } from 'react-instantsearch'
import { liteClient as algoliasearch } from 'algoliasearch/lite'
import type { Product } from '../types/product'

const searchClient = algoliasearch(
  import.meta.env.VITE_ALGOLIA_APP_ID,
  import.meta.env.VITE_ALGOLIA_SEARCH_KEY
)

const INDEX_MAIN = import.meta.env.VITE_ALGOLIA_INDEX_MAIN

function ProductDetailContent() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { results } = useInstantSearch()

  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    const hitFromResults = results?.hits?.find(
      (hit: any) => hit.objectID === id
    ) as Product | undefined

    if (hitFromResults) {
      setProduct(hitFromResults)
      setLoading(false)
      fetchRelated(hitFromResults)
      return
    }

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
        fetchRelated(hits[0])
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

  function fetchRelated(p: Product) {
    searchClient.search({
      requests: [{
        indexName: INDEX_MAIN,
        query: '',
        filters: `category:"${p.category}" AND NOT objectID:"${p.objectID}"`,
        hitsPerPage: 8,
        attributesToRetrieve: ['*'],
      }]
    }).then((res) => {
      setRelatedProducts((res.results[0] as { hits: Product[] }).hits)
    }).catch(() => {
      setRelatedProducts([])
    })
  }

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

  return <ProductDetail product={product} relatedProducts={relatedProducts} />
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