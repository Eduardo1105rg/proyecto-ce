import { useState, useRef, useCallback } from 'react'
import type { FocusEvent, KeyboardEvent, ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCarrito } from '../../../../context/carritoContext'
import { Button } from '../../../../components/Button/Button'
import { formatPrice } from '../../../../utils/formatPrice'
import { buildImageUrl } from '../../../../utils/imageUrl'
import type { ItemCarritoEnriquecido } from '../../../../types/carrito'
import styles from './MiniCart.module.css'

/** Cantidad máxima de productos que se listan en la vista previa */
const MAX_VISIBLE_ITEMS = 5

/** Espera antes de cerrar, para que el popover no parpadee al mover el mouse */
const CLOSE_DELAY_MS = 150

/** Rutas donde no se muestra la vista previa (ya se ve el carrito completo) */
const HIDDEN_ON = ['/carrito']

/** En pantallas táctiles no hay hover: el toque va directo al carrito */
const CAN_HOVER =
    typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches

type MiniCartProps = {
    /** Elemento que dispara la vista previa (el botón del carrito del Navbar) */
    children: ReactNode
}

type MiniCartRowProps = {
    item: ItemCarritoEnriquecido
    loading: boolean
    failed: boolean
}

/**
 * Fila de producto dentro de la vista previa.
 * Replica los estados de CartItem: cargando, fallo y producto no disponible.
 */
function MiniCartRow({ item, loading, failed }: MiniCartRowProps) {
    const unresolved = item.noDisponible && (loading || failed)
    const unavailable = item.noDisponible && !loading && !failed

    const title =
        item.titulo ||
        (loading
            ? 'Cargando producto...'
            : failed
                ? 'No se pudo cargar este producto'
                : 'Producto no disponible')

    const content = (
        <>
            <div className={styles.thumb}>
                {item.imagen && !unavailable && (
                    <img src={buildImageUrl(item.imagen)} alt="" />
                )}
            </div>
            <div className={styles.info}>
                <p className={styles.title}>{title}</p>
                <p className={styles.meta}>
                    {unavailable
                        ? 'No se cobrará'
                        : unresolved
                            ? '...'
                            : `${item.cantidad} × ${formatPrice(item.precio)}`}
                </p>
            </div>
        </>
    )

    return (
        <li>
            {unavailable ? (
                <div className={styles.row}>{content}</div>
            ) : (
                <Link to={`/producto/${item.objectID}`} className={styles.row}>
                    {content}
                </Link>
            )}
        </li>
    )
}

/**
 * Vista previa del carrito para el Navbar.
 *
 * Envuelve el botón del carrito y muestra un popover al pasar el mouse o al
 * enfocarlo con teclado. Se cierra con Esc, al salir con un pequeño retraso y
 * al cambiar de ruta.
 *
 * Guarda la ruta en la que se abrió en lugar de un booleano: al navegar, la
 * ruta cambia y el popover se cierra solo, sin necesidad de un efecto.
 *
 * @prop children - Botón o enlace del carrito que dispara la vista previa.
 */
export function MiniCart({ children }: MiniCartProps) {
    const navigate = useNavigate()
    const { pathname } = useLocation()
    const { items, totales, cargando, error, activarConsulta } = useCarrito()

    const [openPath, setOpenPath] = useState<string | null>(null)
    const closeTimer = useRef<number | undefined>(undefined)

    const enabled = CAN_HOVER && !HIDDEN_ON.includes(pathname)
    const visible = enabled && openPath === pathname

    const show = useCallback(() => {
        window.clearTimeout(closeTimer.current)
        activarConsulta()
        setOpenPath(pathname)
    }, [activarConsulta, pathname])

    const hideWithDelay = useCallback(() => {
        window.clearTimeout(closeTimer.current)
        closeTimer.current = window.setTimeout(() => setOpenPath(null), CLOSE_DELAY_MS)
    }, [])

    const handleBlur = (e: FocusEvent<HTMLDivElement>) => {
        // Solo se cierra si el foco sale del contenedor por completo
        if (!e.currentTarget.contains(e.relatedTarget)) hideWithDelay()
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Escape') {
            window.clearTimeout(closeTimer.current)
            setOpenPath(null)
        }
    }

    const visibleItems = items.slice(0, MAX_VISIBLE_ITEMS)
    const hiddenCount = items.length - visibleItems.length
    const pricesPending = cargando || error !== null

    return (
        <div
            className={styles.wrapper}
            onMouseEnter={enabled ? show : undefined}
            onMouseLeave={enabled ? hideWithDelay : undefined}
            onFocus={enabled ? show : undefined}
            onBlur={enabled ? handleBlur : undefined}
            onKeyDown={handleKeyDown}
        >
            {children}

            {visible && (
                <div className={styles.popover}>
                    <div className={styles.panel} role="region" aria-label="Vista previa del carrito">
                        {items.length === 0 ? (
                            <p className={styles.empty}>Su carrito está vacío</p>
                        ) : (
                            <>
                                <ul className={styles.list}>
                                    {visibleItems.map((item) => (
                                        <MiniCartRow
                                            key={item.objectID}
                                            item={item}
                                            loading={cargando}
                                            failed={error !== null}
                                        />
                                    ))}
                                </ul>

                                {hiddenCount > 0 && (
                                    <p className={styles.more}>
                                        y {hiddenCount} {hiddenCount === 1 ? 'producto más' : 'productos más'}
                                    </p>
                                )}

                                <div className={styles.summary}>
                                    <span>
                                        Subtotal ({totales.articulos}{' '}
                                        {totales.articulos === 1 ? 'artículo' : 'artículos'})
                                    </span>
                                    <strong>{pricesPending ? '...' : formatPrice(totales.subtotal)}</strong>
                                </div>

                                <Button
                                    label="Ver carrito"
                                    variant="primary"
                                    size="sm"
                                    fullWidth
                                    onClick={() => navigate('/carrito')}
                                />
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}