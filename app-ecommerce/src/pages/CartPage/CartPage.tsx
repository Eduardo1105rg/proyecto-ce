import { useEffect, useState } from 'react'
import { useCarrito } from '../../context/carritoContext'
import { CartEmpty } from '../../features/cart/components/CartEmpty/CartEmpty'
import { CartItem } from '../../features/cart/components/CartItem/CartItem'
import { CartSummary } from '../../features/cart/components/CartSummary/CartSummary'
import { motivoBloqueoCompra } from '../../features/cart/motivoBloqueo'
import styles from './CartPage.module.css'
import { UilShoppingCart, UilArrowLeft } from '@iconscout/react-unicons'
import { ConfirmDialog } from '../../components/ConfirmDialog/ConfirmDialog'
import type { ItemCarritoEnriquecido } from '../../types/carrito'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { SUCURSALES } from '../../data/sucursales'
import { useAuth } from '../../features/auth/useAuth'

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
	const { usuario } = useAuth()

	/** Línea que se está por quitar; null si no hay ninguna pendiente de confirmar */
	const [pendingRemoval, setPendingRemoval] = useState<ItemCarritoEnriquecido | null>(null)

	/** Cambio de sucursal que requiere confirmación por falta de stock */
	const [pendingBranch, setPendingBranch] = useState<{
		item: ItemCarritoEnriquecido
		branchId: string
		stock: number
	} | null>(null)

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
		const item = items.find((i) => i.lineId === lineId)
		if (!item) return

		const stock = item.stockPorSucursal[branchId] ?? 0

		if (stock >= item.cantidad) {
			cambiarSucursal(lineId, branchId)
			return
		}

		setPendingBranch({ item, branchId, stock })
	}

	const confirmRemoval = () => {
		if (pendingRemoval) eliminar(pendingRemoval.lineId)
		setPendingRemoval(null)
	}

	const confirmBranch = () => {
		if (pendingBranch) {
			const { item, branchId, stock } = pendingBranch
			// TODO conectar: Eduardo debería ajustar la cantidad dentro de cambiarSucursal
			cambiarCantidad(item.lineId, stock)
			cambiarSucursal(item.lineId, branchId)
		}
		setPendingBranch(null)
	}

	const branchMessage = () => {
		if (!pendingBranch) return ''

		const { item, branchId, stock } = pendingBranch
		const nombre = SUCURSALES.find((s) => s.id === branchId)?.nombre ?? 'La sucursal'
		const totalProducto = items
			.filter((i) => i.objectID === item.objectID)
			.reduce((suma, i) => suma + i.cantidad, 0)
		const nuevoTotal = totalProducto - item.cantidad + stock
		const bajaDelMinimo = usuario?.rol === 'B2B' && nuevoTotal < item.minimoB2B

		return (
			`${nombre} solo tiene ${stock} ${stock === 1 ? 'unidad' : 'unidades'}. ` +
			`Su cantidad pasará de ${item.cantidad} a ${stock}.` +
			(bajaDelMinimo
				? ` Quedará por debajo del mínimo B2B (${item.minimoB2B}); deberá agregar más desde otra sucursal.`
				: '') +
			' ¿Desea cambiar de sucursal?'
		)
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
					<strong>Mínimo B2B pendiente</strong>
					<ul>
						{faltantesB2B.map((faltante) => (
							<li key={faltante.objectID}>
								{faltante.titulo || faltante.objectID}: {faltante.minimo - faltante.faltan} de {faltante.minimo} unidades.
								Agregue {faltante.faltan} más, también desde otra sucursal.{' '}
								<Link to={`/producto/${faltante.objectID}`}>Ir al producto</Link>
							</li>
						))}
					</ul>
				</div>
			)}

			{items.length === 0 ? (
				<CartEmpty />
			) : (
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

					<CartSummary
						totals={totales}
						loading={cargando || error !== null}
						checkoutDisabled={!puedeComprar}
						checkoutReason={
							cargando || error !== null
								? undefined
								: motivoBloqueoCompra(items, faltantesB2B.length > 0)
						}
						onCheckout={() => navigate('/checkout')}
					/>
				</div>
			)}

			{/* Siempre montados (fuera del condicional) para que los diálogos no se desmonten al quitar el último producto */}
			<ConfirmDialog
				open={pendingRemoval !== null}
				title="Quitar producto"
				message={`¿Desea quitar "${pendingRemoval?.titulo || 'este producto'}" de su carrito?`}
				confirmLabel="Quitar"
				onConfirm={confirmRemoval}
				onCancel={() => setPendingRemoval(null)}
			/>

			<ConfirmDialog
				open={pendingBranch !== null}
				title="Cambiar de sucursal"
				message={branchMessage()}
				confirmLabel="Cambiar"
				onConfirm={confirmBranch}
				onCancel={() => setPendingBranch(null)}
			/>
		</main>
	)
}