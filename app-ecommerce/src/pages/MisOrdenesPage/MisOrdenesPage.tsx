import { Link } from 'react-router-dom'
import { UilReceipt } from '@iconscout/react-unicons'
import { useAuth } from '../../features/auth/useAuth'
import { listarOrdenesDeUsuario } from '../../services/orders'
import { formatPrice } from '../../utils/formatPrice'
import {
    ETIQUETA_ESTADO_ORDEN,
    ETIQUETA_ESTADO_PAGO,
    formatearFechaOrden,
} from '../../features/orders/orderLabels'
import styles from './MisOrdenesPage.module.css'

export function MisOrdenesPage() {
    const { usuario } = useAuth()
    const ordenes = usuario ? listarOrdenesDeUsuario(usuario.id) : []

    return (
        <main className={styles.page}>
            <header className={styles.header}>
                <h1 className={styles.title}>Mis órdenes</h1>
                <p className={styles.subtitle}>
                    Consulte las compras registradas en este navegador con su usuario.
                </p>
            </header>

            {ordenes.length === 0 ? (
                <section className={styles.empty} aria-labelledby="ordenes-vacias">
                    <UilReceipt size="42" className={styles.emptyIcon} />
                    <h2 id="ordenes-vacias" className={styles.emptyTitle}>
                        Aún no tiene órdenes registradas
                    </h2>
                    <p className={styles.emptyText}>
                        Cuando complete una compra, podrá consultar aquí su número de orden,
                        sucursal, estado y total.
                    </p>
                    <Link to="/catalogo" className={styles.emptyLink}>
                        Explorar el catálogo
                    </Link>
                </section>
            ) : (
                <ul className={styles.list}>
                    {ordenes.map((orden) => {
                        const articulos = orden.items.reduce(
                            (total, item) => total + item.quantity,
                            0,
                        )

                        return (
                            <li key={orden.orderNumber}>
                                <article className={styles.card}>
                                    <header className={styles.cardHeader}>
                                        <div>
                                            <p className={styles.eyebrow}>Orden</p>
                                            <h2 className={styles.orderNumber}>{orden.orderNumber}</h2>
                                            <p className={styles.date}>{formatearFechaOrden(orden.createdAt)}</p>
                                        </div>
                                        <div className={styles.badges}>
                                            <span className={`${styles.badge} ${styles[`order${orden.status}`]}`}>
                                                {ETIQUETA_ESTADO_ORDEN[orden.status]}
                                            </span>
                                            <span className={`${styles.badge} ${styles[`payment${orden.paymentStatus}`]}`}>
                                                {ETIQUETA_ESTADO_PAGO[orden.paymentStatus]}
                                            </span>
                                        </div>
                                    </header>

                                    <dl className={styles.meta}>
                                        <div>
                                            <dt>Total</dt>
                                            <dd>{formatPrice(orden.total)}</dd>
                                        </div>
                                        <div>
                                            <dt>Artículos</dt>
                                            <dd>{articulos}</dd>
                                        </div>
                                        <div>
                                            <dt>Sucursal</dt>
                                            <dd>
                                                {orden.sucursales.length > 0
                                                    ? orden.sucursales.map((sucursal) => sucursal.nombre).join(', ')
                                                    : 'No registrada'}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt>{orden.rol === 'B2B' ? 'Empresa' : 'Cliente'}</dt>
                                            <dd>{orden.empresa?.nombre ?? orden.buyer.fullName}</dd>
                                        </div>
                                    </dl>

                                    <ul className={styles.items}>
                                        {orden.items.map((item) => (
                                            <li key={`${item.objectID}::${item.branchId}`}>
                                                <div className={styles.itemInfo}>
                                                    <span className={styles.itemName}>{item.name}</span>
                                                    <span className={styles.itemMeta}>
                                                        {item.quantity} × {formatPrice(item.unitPrice)} · {item.branchName}
                                                        {item.pricingType === 'B2B' ? ' · Precio B2B' : ''}
                                                    </span>
                                                </div>
                                                <span className={styles.itemTotal}>{formatPrice(item.subtotal)}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <footer className={styles.cardFooter}>
                                        <span className={styles.condition}>
                                            {orden.condicionComercial.tipo === 'CANTIDAD_MINIMA'
                                                ? `Condición B2B: mínimo ${orden.condicionComercial.minimo} unidades por producto`
                                                : 'Condición comercial estándar'}
                                        </span>
                                        {orden.paymentStatus !== 'PENDING' && (
                                            <Link
                                                to={`/checkout?orden=${encodeURIComponent(orden.orderNumber)}`}
                                                className={styles.receiptLink}
                                            >
                                                Ver comprobante
                                            </Link>
                                        )}
                                    </footer>
                                </article>
                            </li>
                        )
                    })}
                </ul>
            )}
        </main>
    )
}
