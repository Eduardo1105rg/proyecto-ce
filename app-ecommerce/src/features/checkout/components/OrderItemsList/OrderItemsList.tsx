import type { ItemCarritoEnriquecido } from '../../../../types/carrito'
import { buildImageUrl } from '../../../../utils/imageUrl'
import { formatPrice } from '../../../../utils/formatPrice'
import styles from './OrderItemsList.module.css'

type OrderItemsListProps = {
	items: ItemCarritoEnriquecido[]
}

/** Lista de solo lectura con los productos de la compra. */
export function OrderItemsList({ items }: OrderItemsListProps) {
	return (
		<ul className={styles.list}>
			{items.map((item) => (
				<li key={item.lineId} className={styles.row}>
					<img
						className={styles.image}
						src={buildImageUrl(item.imagen)}
						alt=""
						onError={(e) => {
							; (e.target as HTMLImageElement).src = 'https://placehold.co/120x120?text=Sin+imagen'
						}}
					/>
					<div className={styles.info}>
						<p className={styles.name}>{item.titulo}</p>
						<p className={styles.meta}>
							{item.cantidad} x {formatPrice(item.precio)} · {item.branchName}
						</p>
						{item.precioB2BReferencia !== null && item.precioB2BReferencia !== item.precio && (
							<p className={styles.meta}>
								Precio B2C · Referencia B2B {formatPrice(item.precioB2BReferencia)} c/u
							</p>
						)}
						{item.tipoPrecio === 'B2B' && (
							<p className={styles.meta}>Precio B2B aplicado</p>
						)}
					</div>
					<p className={styles.total}>{formatPrice(item.precio * item.cantidad)}</p>
				</li>
			))}
		</ul>
	)
}