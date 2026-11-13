import { useEffect, useState } from 'react'
import { useCarrito } from '../../context/carritoContext'
import { CartEmpty } from '../../features/cart/components/CartEmpty/CartEmpty'
import { CartItem } from '../../features/cart/components/CartItem/CartItem'
import { CartSummary } from '../../features/cart/components/CartSummary/CartSummary'
import styles from './CartPage.module.css'
import { useLocation, useNavigate } from 'react-router-dom'
import { UilShoppingCart, UilArrowLeft } from '@iconscout/react-unicons'
import { ConfirmDialog } from '../../components/ConfirmDialog/ConfirmDialog'
import type { ItemCarritoEnriquecido } from '../../types/carrito'

export function CartPage() {
	const {
		items,
		totales,
		cargando,
		error,
		faltantesB2B,
		puedeComprar,
		cambiarCantidad,
		cambiarSucursal,
		eliminar,
		activarConsulta,
	} = useCarrito()
	const navigate = useNavigate()
	const location = useLocation()

	/** Línea que se está por quitar; null si no hay ninguna pendiente de confirmar */
	const [pendingRemoval, setPendingRemoval] = useState<ItemCarritoEnriquecido | null>(null)

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

	/** Los productos no disponibles se quitan directo: no se cobran y no hay nada que perder */
	const requestRemoval = (lineId: string) => {
		const item = items.find((i) => i.lineId === lineId)
		if (!item) return
		if (item.noDisponible) {
			eliminar(lineId)
			return
		}
		setPendingRemoval(item)
	}

	/** Bajar la cantidad a 0 equivale a quitar el producto, así que también se confirma */
	const handleQuantityChange = (lineId: string, cantidad: number) => {
		if (cantidad <= 0) {
			requestRemoval(lineId)
			return
		}
		cambiarCantidad(lineId, cantidad)
	}

	const handleBranchChange = (lineId: string, branchId: string) => {
		cambiarSucursal(lineId, branchId)
	}

	const confirmRemoval = () => {
		if (pendingRemoval) eliminar(pendingRemoval.lineId)
		setPendingRemoval(null)
	}

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

			{faltantesB2B.length > 0 && (
				<div className={styles.b2bNotice} role="status">
					<strong>Mínimo mayorista pendiente</strong>
					<ul>
						{faltantesB2B.map((faltante) => (
							<li key={faltante.objectID}>
								{faltante.titulo || faltante.objectID}: agregue {faltante.faltan} unidades más para alcanzar las {faltante.minimo}.
							</li>
						))}
					</ul>
				</div>
			)}

			{items.length === 0 ? (
				<CartEmpty />
			) : (
				/* Dos columnas: lista de items y resumen de compra */
				<div className={styles.content}>
					<ul className={styles.list}>
						{items.map((item) => (
							<CartItem
								key={item.lineId}
								item={item}
								loading={cargando}
								failed={error !== null}
								onQuantityChange={handleQuantityChange}
								onBranchChange={handleBranchChange}
								onRemove={requestRemoval}
							/>
						))}
					</ul>

					<div className={styles.summaryWrapper}>
						<CartSummary
							totals={totales}
							loading={cargando || error !== null}
							checkoutDisabled={!puedeComprar}
							checkoutReason={
								faltantesB2B.length > 0
									? 'Alcance el mínimo B2B de cada producto para continuar.'
									: undefined
							}
							onCheckout={() => navigate('/checkout')}
						/>
					</div>
				</div>
			)}

			{/* Siempre montado (fuera del condicional) para que el diálogo no se desmonte al quitar el último producto */}
			<ConfirmDialog
				open={pendingRemoval !== null}
				title="Quitar producto"
				message={`¿Desea quitar "${pendingRemoval?.titulo || 'este producto'}" de su carrito?`}
				confirmLabel="Quitar"
				onConfirm={confirmRemoval}
				onCancel={() => setPendingRemoval(null)}
			/>
		</main>
	)
}