import { useEffect } from 'react'
import { UilShoppingCart } from '@iconscout/react-unicons'
import { useCarrito } from '../../context/carritoContext'
import { CartEmpty } from '../../features/cart/components/CartEmpty/CartEmpty'
import { CartItem } from '../../features/cart/components/CartItem/CartItem'
import { CartSummary } from '../../features/cart/components/CartSummary/CartSummary'
import styles from './CartPage.module.css'

export function CartPage() {
  const { items, totales, cargando, error, cambiarCantidad, eliminar, activarConsulta } =
    useCarrito()

  useEffect(() => {
    activarConsulta()
  }, [activarConsulta])

  return (
    <main className={styles.page}>
      <h1 className={styles.heading}>
        <UilShoppingCart className={styles.icon} size="1.25em" /> Carrito de compras
      </h1>

      {error && (
        <p className={styles.error} role="alert">
          No se pudieron cargar los precios: {error}
        </p>
      )}

      {items.length === 0 ? (
        <CartEmpty />
      ) : (
        /* Dos columnas: lista de items y resumen de compra */
        <div className={styles.content}>
          <ul className={styles.list}>
            {items.map((item) => (
              <CartItem
                key={item.objectID}
                item={item}
                loading={cargando}
                failed={error !== null}
                onQuantityChange={cambiarCantidad}
                onRemove={eliminar}
              />
            ))}
          </ul>

          <div className={styles.summaryWrapper}>
            {/* Sin onCheckout hasta que exista la pagina de checkout */}
            <CartSummary totals={totales} loading={cargando || error !== null} />
          </div>
        </div>
      )}
    </main>
  )
}