import { useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Configure, InstantSearch, useHits, useInstantSearch } from 'react-instantsearch'
import { ProductDetail } from '../features/catalog/ProductDetail/ProductDetail'
import { RelatedProducts } from '../features/catalog/ProductDetail/RelatedProducts'
import {
	INDEX_MAIN,
	RELATED_HITS_PER_PAGE,
	escapeFilterValue,
	searchClient,
} from '../services/Algolia'
import type { Product } from '../types/product'
import { useAnalytics } from '../features/analytics/useAnalytics'

/**
 * Estado de carga mostrado mientras Algolia responde.
 */
function DetailLoading() {
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

/**
 * Estado de error mostrado cuando no hay ningun producto con el ID de la URL.
 */
function DetailNotFound() {
	const navigate = useNavigate()

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

/**
 * Contenido de la pagina de detalle.
 *
 * Lee el producto del contexto de InstantSearch con useHits. El refinamiento por
 * objectID y el limite de un resultado los aplica el Configure de ProductDetailPage.
 *
 * Los productos relacionados viven en una segunda instancia de InstantSearch
 * porque requieren otra consulta (misma categoria, excluyendo el producto actual)
 * y no pueden compartir el estado de busqueda del producto principal.
 */
function ProductDetailContent() {
	const { id } = useParams()
	const { items } = useHits<Product>()
	const { status } = useInstantSearch()
	const { registrar } = useAnalytics()
	const ultimoRegistrado = useRef<string | null>(null)

	const product = items[0]
	const productoListo = status === 'idle' && product !== undefined && product.objectID === id
	const nombre = product?.name
	const categoria = product?.category

	// Solo se registra la vista cuando el producto de la URL ya cargó, una vez por visita.
	useEffect(() => {
		if (!productoListo || !id || ultimoRegistrado.current === id) return
		ultimoRegistrado.current = id
		registrar('vista_producto', { productoId: id, nombre: nombre ?? '', categoria: categoria ?? '' })
	}, [productoListo, id, nombre, categoria, registrar])

	if (status === 'loading' || status === 'stalled') {
		return <DetailLoading />
	}

	if (!product) {
		return <DetailNotFound />
	}

	return (
		<ProductDetail product={product}>
			<InstantSearch
				searchClient={searchClient}
				indexName={INDEX_MAIN}
				routing={false}
			>
				<Configure
					filters={`category:"${escapeFilterValue(product.category)}" AND NOT objectID:"${escapeFilterValue(product.objectID)}"`}
					hitsPerPage={RELATED_HITS_PER_PAGE}
				/>
				<RelatedProducts category={product.category} />
			</InstantSearch>
		</ProductDetail>
	)
}

/**
 * Pagina de detalle de producto.
 *
 * Lee el ID del producto de los params de la URL (:id) y monta una instancia de
 * InstantSearch refinada a ese unico registro. El routing se deja desactivado
 * porque la app usa HashRouter.
 */
export function ProductDetailPage() {
	const { id } = useParams()

	if (!id) {
		return <DetailNotFound />
	}

	return (
		<InstantSearch
			searchClient={searchClient}
			indexName={INDEX_MAIN}
			routing={false}
		>
			<Configure
				filters={`objectID:"${escapeFilterValue(id)}"`}
				hitsPerPage={1}
			/>
			<ProductDetailContent />
		</InstantSearch>
	)
}