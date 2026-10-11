import { useEffect } from 'react'
import { useCarrito } from '../../context/carritoContext'
import { CartEmpty } from '../../features/cart/components/CartEmpty/CartEmpty'
import { CartItem } from '../../features/cart/components/CartItem/CartItem'
import { CartSummary } from '../../features/cart/components/CartSummary/CartSummary'
import styles from './CartPage.module.css'
import { useLocation, useNavigate } from 'react-router-dom'
import { UilShoppingCart, UilArrowLeft } from '@iconscout/react-unicons'

export function CartPage() {
	const { items, totales, cargando, error, cambiarCantidad, eliminar, activarConsulta } =
		useCarrito()
	const navigate = useNavigate()
	const location = useLocation()

	/**
	 * Vuelve a la página anterior. Si el carrito se abrió directamente
	 * (key 'default' = primera entrada del historial), va al catálogo.
	 */
	const handleBack = () => {
		if (location.key !== 'default') {
			navigate(-1)
		} else {
			navigate('/catalogo')
		}
	}

	useEffect(() => {
		activarConsulta()
	}, [activarConsulta])

	return (
		<main className={styles.page}>
			<button type="button" className={styles.back} onClick={handleBack}>
				<UilArrowLeft size="18" /> Volver
			</button>

			<h1 className={styles.heading}>
				<UilShoppingCart className={styles.icon} size="1.25em" /> Carrito de compras
			</h1>

			{error && (
				<p className={styles.error} role="alert">
					No se pudieron cargar los precios: {error}
				</p>
			)}

			{items.length === 0 ? (
				<CartEmpty />
			) : (
				/* Dos columnas: lista de items y resumen de compra */
				<div className={styles.content}>
					<ul className={styles.list}>
						{items.map((item) => (
							<CartItem
								key={item.objectID}
								item={item}
								loading={cargando}
								failed={error !== null}
								onQuantityChange={cambiarCantidad}
								onRemove={eliminar}
							/>
						))}
					</ul>

					<div className={styles.summaryWrapper}>
						{/* Sin onCheckout hasta que exista la pagina de checkout */}
						<CartSummary totals={totales} loading={cargando || error !== null} />
					</div>
				</div>
			)}
		</main>
	)
}