import { UilMinus, UilPlus, UilTrashAlt } from '@iconscout/react-unicons'
import { useNavigate } from 'react-router-dom' // Asegúrate de tener react-router-dom instalado
import type { ItemCarritoEnriquecido } from '../../../../types/carrito'
import { formatPrice } from '../../../../utils/formatPrice'
import styles from './CartItem.module.css'

type CartItemProps = {
    item: ItemCarritoEnriquecido
    loading: boolean
    failed: boolean
    onQuantityChange: (objectID: string, quantity: number) => void
    onRemove: (objectID: string) => void
}

/**
 * Construye la URL completa de la imagen del producto.
 */
function build_imageUrl(imagePath: string): string {
    console.log("build_imageUrl called with imagePath:", imagePath); 
    const url = `https://eduardo1105rg.github.io/proyecto-ce/images/${imagePath}`;
    return url
}


export function CartItem({ item, loading, failed, onQuantityChange, onRemove }: CartItemProps) {
    const navigate = useNavigate()

    const unresolved = item.noDisponible && (loading || failed)
    const unavailable = item.noDisponible && !loading && !failed

    const title =
        item.titulo ||
        (loading
            ? 'Cargando producto...'
            : failed
                ? 'No se pudo cargar este producto'
                : 'Producto no disponible')

    // Función para navegar al detalle del producto
    const handleTitleClick = () => {
        if (!unavailable && item.objectID) {
            navigate(`/producto/${item.objectID}`)
        }
    }

    return (
        <li className={`${styles.item} ${unavailable ? styles.unavailable : ''}`}>
            <div className={styles.imageBox}>
                {item.imagen && !unavailable ? (
                    <img
                        className={styles.image}
                        src={build_imageUrl(item.imagen)}
                        alt={title}
                        onError={(e) => { 
                            (e.target as HTMLImageElement).src = 'https://placehold.co/300x220?text=Sin+imagen'
                        }}
                    />
                ) : (
                    <div className={styles.imagePlaceholder} aria-hidden="true" />
                )}
            </div>

            <div className={styles.info}>
                {/* Título clickeable */}
                <p
                    className={`${styles.title} ${!unavailable ? styles.titleClickable : ''}`}
                    onClick={handleTitleClick}
                    role={!unavailable ? "button" : undefined}
                    tabIndex={!unavailable ? 0 : undefined}
                    onKeyDown={(e) => {
                        if (!unavailable && (e.key === 'Enter' || e.key === ' ')) {
                            e.preventDefault()
                            handleTitleClick()
                        }
                    }}
                >
                    {title}
                </p>

                {unavailable ? (
                    <p className={styles.warning}>Este producto ya no esta disponible y no se cobrara.</p>
                ) : (
                    <p className={styles.unitPrice}>
                        {unresolved ? '...' : `${formatPrice(item.precio)} c/u`}
                    </p>
                )}
            </div>

            {!unavailable && (
                <div className={styles.quantity} role="group" aria-label={`Cantidad de ${title}`}>
                    <button
                        type="button"
                        className={styles.qtyButton}
                        onClick={() => onQuantityChange(item.objectID, item.cantidad - 1)}
                        aria-label={
                            item.cantidad === 1 ? `Quitar ${title} del carrito` : `Disminuir cantidad de ${title}`
                        }
                    >
                        <UilMinus size="18" />
                    </button>
                    <span className={styles.qtyValue} aria-live="polite">
                        {item.cantidad}
                    </span>
                    <button
                        type="button"
                        className={styles.qtyButton}
                        onClick={() => onQuantityChange(item.objectID, item.cantidad + 1)}
                        aria-label={`Aumentar cantidad de ${title}`}
                    >
                        <UilPlus size="18" />
                    </button>
                </div>
            )}

            {!unavailable && (
                <p className={styles.subtotal}>
                    {unresolved ? '...' : formatPrice(item.precio * item.cantidad)}
                </p>
            )}

            <button
                type="button"
                className={styles.removeButton}
                onClick={() => onRemove(item.objectID)}
                aria-label={`Eliminar ${title} del carrito`}
                title="Eliminar"
            >
                <UilTrashAlt size="18" />
            </button>
        </li>
    )
}