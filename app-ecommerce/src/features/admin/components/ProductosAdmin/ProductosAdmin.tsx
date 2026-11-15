import { useEffect, useState } from 'react'
import {
	Configure,
	InstantSearch,
	useHits,
	useInstantSearch,
	useSearchBox,
	useStats,
} from 'react-instantsearch'
import { INDEX_MAIN, searchClient } from '../../../../services/Algolia'
import { formatPrice } from '../../../../utils/formatPrice'
import type { Product } from '../../../../types/product'
import { Pagination } from '../../../catalog/components/Pagination/Pagination'
import styles from './ProductosAdmin.module.css'

const PRODUCTOS_POR_PAGINA = 10

function obtenerTramoB2B(product: Product) {
	return product.tiered_b2b_pricing[0] ?? null
}

function ProductosContenido() {
	const { query, refine } = useSearchBox()
	const { items } = useHits<Product>()
	const { nbHits } = useStats()
	const { status } = useInstantSearch()
	const [texto, setTexto] = useState(query)

	useEffect(() => {
		if (texto === query) return
		const espera = setTimeout(() => refine(texto), 300)
		return () => clearTimeout(espera)
	}, [texto, query, refine])

	const cargando = items.length === 0 && status === 'loading'

	return (
		<div>
			<div className={styles.toolbar}>
				<div className={styles.search}>
					<label htmlFor="admin-buscar-producto" className={styles.label}>
						Buscar producto
					</label>
					<input
						id="admin-buscar-producto"
						type="search"
						className={styles.input}
						value={texto}
						onChange={(e) => setTexto(e.target.value)}
						placeholder="Nombre, marca o categoría"
					/>
				</div>
				<p className={styles.count}>{nbHits} productos</p>
			</div>

			{cargando ? (
				<p className={styles.empty}>Cargando productos...</p>
			) : items.length === 0 ? (
				<p className={styles.empty}>No se encontraron productos con esa búsqueda.</p>
			) : (
				<div className={styles.tableWrap}>
					<table className={styles.table}>
						<caption className={styles.caption}>Catálogo de productos</caption>
						<thead>
							<tr>
								<th scope="col">Producto</th>
								<th scope="col">Categoría</th>
								<th scope="col">Marca</th>
								<th scope="col" className={styles.right}>
									Precio B2C
								</th>
								<th scope="col" className={styles.right}>
									Precio B2B
								</th>
							</tr>
						</thead>
						<tbody>
							{items.map((p) => {
								const tramo = obtenerTramoB2B(p)
								return (
									<tr key={p.objectID}>
										<td>
											<span className={styles.name}>{p.name}</span>
											<span className={styles.sku}>SKU {p.sku}</span>
										</td>
										<td>{p.category}</td>
										<td>{p.brand}</td>
										<td className={styles.right}>{formatPrice(p.price)}</td>
										<td className={styles.right}>
											{tramo ? (
												<>
													<span>{formatPrice(tramo.unit_price)}</span>
													<span className={styles.sku}>desde {tramo.min_qty} unidades</span>
												</>
											) : (
												<span className={styles.muted}>Sin precio B2B</span>
											)}
										</td>
									</tr>
								)
							})}
						</tbody>
					</table>
				</div>
			)}

			<div className={styles.pagination}>
				<Pagination />
			</div>
		</div>
	)
}

export function ProductosAdmin() {
	return (
		<InstantSearch searchClient={searchClient} indexName={INDEX_MAIN} routing={false}>
			<Configure hitsPerPage={PRODUCTOS_POR_PAGINA} />
			<ProductosContenido />
		</InstantSearch>
	)
}