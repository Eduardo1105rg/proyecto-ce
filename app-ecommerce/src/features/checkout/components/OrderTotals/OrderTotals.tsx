import type { TotalesCarrito } from '../../../../types/carrito'
import { IVA_TASA } from '../../../../services/carritoCalculos'
import { formatPrice } from '../../../../utils/formatPrice'
import styles from './OrderTotals.module.css'

type OrderTotalsProps = {
    totales: TotalesCarrito
}

/** Desglose de montos. Todos vienen ya calculados del carrito: aquí solo se muestran. */
export function OrderTotals({ totales }: OrderTotalsProps) {
    return (
        <dl className={styles.totals}>
            <div className={styles.row}>
                <dt>Subtotal ({totales.articulos} {totales.articulos === 1 ? 'artículo' : 'artículos'})</dt>
                <dd>{formatPrice(totales.subtotal)}</dd>
            </div>
            <div className={styles.row}>
                <dt>IVA ({Math.round(IVA_TASA * 100)}%)</dt>
                <dd>{formatPrice(totales.iva)}</dd>
            </div>
            <div className={styles.row}>
                <dt>Envío</dt>
                <dd>{totales.envioGratis ? 'Gratis' : formatPrice(totales.envio)}</dd>
            </div>
            <div className={`${styles.row} ${styles.final}`}>
                <dt>Total</dt>
                <dd>{formatPrice(totales.total)}</dd>
            </div>
        </dl>
    )
}