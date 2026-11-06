import { useId } from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '../../../../types/product'
import { ProductGrid } from '../../../catalog/components/ProductGrid/ProductGrid'
import styles from './BloqueProductos.module.css'

type BloqueProductosProps = {
	titulo: string
	productos: Product[]
	maximo?: number
	verTodosHref?: string
	onAddToCart?: (product: Product) => void
	onProductClick?: (product: Product) => void
}

export function BloqueProductos({
	titulo,
	productos,
	maximo = 4,
	verTodosHref,
	onAddToCart,
	onProductClick,
}: BloqueProductosProps) {
	const idTitulo = useId()

	if (productos.length === 0) return null

	return (
		<section className={styles.block} aria-labelledby={idTitulo}>
			<header className={styles.header}>
				<h2 id={idTitulo} className={styles.title}>
					{titulo}
				</h2>
				{verTodosHref && (
					<Link to={verTodosHref} className={styles.more}>
						Ver todos
					</Link>
				)}
			</header>
			<ProductGrid
				products={productos.slice(0, maximo)}
				columns={4}
				onAddToCart={onAddToCart}
				onProductClick={onProductClick}
			/>
		</section>
	)
}