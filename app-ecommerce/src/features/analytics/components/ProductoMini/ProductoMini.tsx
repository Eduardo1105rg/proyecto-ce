import { Link } from 'react-router-dom'
import type { Product } from '../../../../types/product'
import { buildImageUrl } from '../../../../utils/imageUrl'
import { formatPrice } from '../../../../utils/formatPrice'
import styles from './ProductoMini.module.css'

type ProductoMiniProps = {
	product: Product
}

export function ProductoMini({ product }: ProductoMiniProps) {
	return (
		<Link to={`/producto/${product.objectID}`} className={styles.item}>
			<img
				src={buildImageUrl(product.image)}
				alt=""
				className={styles.img}
				onError={(e) => {
					if (!e.currentTarget.src.startsWith('https://placehold.co')) {
						e.currentTarget.src = 'https://placehold.co/56x56?text=Sin+imagen'
					}
				}}
			/>
			<span className={styles.info}>
				<span className={styles.name}>{product.name}</span>
				<span className={styles.meta}>
					{product.category} · {formatPrice(product.price)}
				</span>
			</span>
		</Link>
	)
}