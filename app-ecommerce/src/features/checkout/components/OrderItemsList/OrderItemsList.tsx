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
				<li key={item.objectID} className={styles.row}>
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
							{item.cantidad} x {formatPrice(item.precio)}
						</p>
					</div>
					<p className={styles.total}>{formatPrice(item.precio * item.cantidad)}</p>
				</li>
			))}
		</ul>
	)
}