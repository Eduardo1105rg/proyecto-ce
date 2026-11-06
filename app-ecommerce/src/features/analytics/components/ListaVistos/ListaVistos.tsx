import { useId, useState } from 'react'
import type { Product } from '../../../../types/product'
import { ProductoMini } from '../ProductoMini/ProductoMini'
import styles from './ListaVistos.module.css'

type ListaVistosProps = {
	titulo: string
	productos: Product[]
	mensajeVacio: string
	cargando?: boolean
	maximo?: number
}

export function ListaVistos({
	titulo,
	productos,
	mensajeVacio,
	cargando = false,
	maximo = 4,
}: ListaVistosProps) {
	const idTitulo = useId()
	const [verTodos, setVerTodos] = useState(false)

	const visibles = verTodos ? productos : productos.slice(0, maximo)

	return (
		<section className={styles.panel} aria-labelledby={idTitulo}>
			<header className={styles.header}>
				<h2 id={idTitulo} className={styles.title}>
					{titulo}
				</h2>
				{productos.length > maximo && (
					<button type="button" className={styles.toggle} onClick={() => setVerTodos((v) => !v)}>
						{verTodos ? 'Ver menos' : `Ver todos (${productos.length})`}
					</button>
				)}
			</header>

			{cargando ? (
				<p className={styles.empty}>Cargando productos...</p>
			) : visibles.length === 0 ? (
				<p className={styles.empty}>{mensajeVacio}</p>
			) : (
				<ul className={styles.list}>
					{visibles.map((p) => (
						<li key={p.objectID}>
							<ProductoMini product={p} />
						</li>
					))}
				</ul>
			)}
		</section>
	)
}