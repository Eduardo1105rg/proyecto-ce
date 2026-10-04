import type { TotalesCarrito } from '../../../../types/carrito'
import { IVA_TASA, UMBRAL_ENVIO_GRATIS } from '../../../../services/carritoCalculos'
import { formatPrice } from '../../../../utils/formatPrice'
import styles from './CartSummary.module.css'

type CartSummaryProps = {
  totals: TotalesCarrito
  loading: boolean
  /** Si no se recibe, el boton de pagar no se muestra (hasta que exista el checkout) */
  onCheckout?: () => void
}

/**
 * Resumen de compra.
 *
 * Todos los montos vienen calculados del contexto; este componente solo los
 * presenta. Mientras los precios cargan se muestran guiones para no mostrar
 * un total parcial que despues cambie.
 */
export function CartSummary({ totals, loading, onCheckout }: CartSummaryProps) {
  const missing = Math.max(UMBRAL_ENVIO_GRATIS - totals.subtotal, 0)
  const money = (value: number) => (loading ? '—' : formatPrice(value))

  return (
    <aside className={styles.summary} aria-label="Resumen de compra">
      <h2 className={styles.heading}>Resumen de compra</h2>

      <dl className={styles.rows}>
        <div className={styles.row}>
          <dt>Subtotal ({totals.articulos} {totals.articulos === 1 ? 'articulo' : 'articulos'})</dt>
          <dd>{money(totals.subtotal)}</dd>
        </div>
        <div className={styles.row}>
          <dt>IVA ({Math.round(IVA_TASA * 100)}%)</dt>
          <dd>{money(totals.iva)}</dd>
        </div>
        <div className={styles.row}>
          <dt>Envio</dt>
          <dd>{loading ? '—' : totals.envioGratis ? 'Gratis' : formatPrice(totals.envio)}</dd>
        </div>
        <div className={`${styles.row} ${styles.total}`}>
          <dt>Total</dt>
          <dd>{money(totals.total)}</dd>
        </div>
      </dl>

      {!loading && !totals.envioGratis && missing > 0 && totals.subtotal > 0 && (
        <p className={styles.hint}>
          Te faltan {formatPrice(missing)} para obtener envio gratis.
        </p>
      )}

      {onCheckout && (
        <button
          type="button"
          className={styles.checkout}
          onClick={onCheckout}
          disabled={loading || totals.subtotal <= 0}
        >
          Proceder al pago
        </button>
      )}
    </aside>
  )
}