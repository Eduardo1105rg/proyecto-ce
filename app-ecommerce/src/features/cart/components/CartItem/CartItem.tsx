import { UilMinus, UilPlus, UilTrashAlt } from '@iconscout/react-unicons'
import { Link } from 'react-router-dom'
import type { ItemCarritoEnriquecido } from '../../../../types/carrito'
import { SUCURSALES } from '../../../../data/sucursales'
import { Dropdown } from '../../../../components/Dropdown/Dropdown'
import type { DropdownOption } from '../../../../components/Dropdown/Dropdown'
import { formatPrice } from '../../../../utils/formatPrice'
import { buildImageUrl } from '../../../../utils/imageUrl'
import styles from './CartItem.module.css'

type CartItemProps = {
    item: ItemCarritoEnriquecido
    loading: boolean
    failed: boolean
    onQuantityChange: (lineId: string, quantity: number) => void
    onBranchChange: (lineId: string, branchId: string) => void
    onRemove: (lineId: string) => void
}

export function CartItem({ item, loading, failed, onQuantityChange, onBranchChange, onRemove }: CartItemProps) {
    const unresolved = item.noDisponible && (loading || failed)
    const unavailable = item.noDisponible && !loading && !failed

    const title =
        item.titulo ||
        (loading
            ? 'Cargando producto...'
            : failed
                ? 'No se pudo cargar este producto'
                : 'Producto no disponible')

    const branchOptions: DropdownOption[] = SUCURSALES.map((sucursal) => {
        const stock = item.stockPorSucursal[sucursal.id] ?? 0

        return {
            value: sucursal.id,
            label: `${sucursal.nombre} - ${stock > 0 ? `${stock} disponibles` : 'Agotado'}`,
            disabled: loading || failed || (stock <= 0 && sucursal.id !== item.branchId),
        }
    })

    return (
        <li className={`${styles.item} ${unavailable ? styles.unavailable : ''}`}>
            <div className={styles.imageBox}>
                {item.imagen && !unavailable ? (
                    <img
                        className={styles.image}
                        src={buildImageUrl(item.imagen)}
                        alt=""
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/300x220?text=Sin+imagen'
                        }}
                    />
                ) : (
                    <div className={styles.imagePlaceholder} aria-hidden="true" />
                )}
            </div>

            <div className={styles.info}>
                {unavailable ? (
                    <p className={styles.title}>{title}</p>
                ) : (
                    <Link
                        to={`/producto/${item.objectID}`}
                        className={`${styles.title} ${styles.titleLink}`}
                    >
                        {title}
                    </Link>
                )}

                {unavailable ? (
                    <p className={styles.warning}>Este producto ya no está disponible y no se cobrará.</p>
                ) : (
                    <>
                        <p className={styles.unitPrice}>
                            {unresolved ? '...' : `${formatPrice(item.precio)} c/u`}
                            {item.tipoPrecio === 'B2B' && (
                                <span className={styles.priceBadge}>B2B</span>
                            )}
                        </p>
                        {item.precioB2BReferencia !== null && item.precioB2BReferencia !== item.precio && (
                            <p className={styles.b2bRef}>
                                Ref. B2B: {formatPrice(item.precioB2BReferencia)} c/u desde {item.minimoB2B} unidades
                            </p>
                        )}
                        <div className={styles.branchLabel}>
                            <span>Sucursal</span>
                            <div className={styles.branchField}>
                                <Dropdown
                                    options={branchOptions}
                                    value={item.branchId}
                                    onChange={(branchId) => onBranchChange(item.lineId, branchId)}
                                    ariaLabel={`Sucursal de ${title}`}
                                />
                            </div>
                        </div>
                        {item.stockInsuficiente && (
                            <p className={styles.stockWarning}>
                                Solo hay {item.stockSucursal} unidades en {item.branchName}.
                            </p>
                        )}
                    </>
                )}
            </div>

            {!unavailable && (
                <div className={styles.quantity} role="group" aria-label={`Cantidad de ${title}`}>
                    <button
                        type="button"
                        className={styles.qtyButton}
                        onClick={() => onQuantityChange(item.lineId, item.cantidad - 1)}
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
                        onClick={() => onQuantityChange(item.lineId, item.cantidad + 1)}
                        aria-label={`Aumentar cantidad de ${title}`}
                        disabled={item.cantidad >= item.stockSucursal}
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
                onClick={() => onRemove(item.lineId)}
                aria-label={`Eliminar ${title} del carrito`}
                title="Eliminar"
            >
                <UilTrashAlt size="18" />
            </button>
        </li>
    )
}