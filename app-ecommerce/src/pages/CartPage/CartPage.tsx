import { useCarrito } from '../../context/carritoContext'
import { CartEmpty } from '../../features/cart/components/CartEmpty/CartEmpty'
import styles from './CartPage.module.css'
import { UilShoppingCart } from '@iconscout/react-unicons'


/**
 * Pagina del carrito.
 */
export function CartPage() {
  const { items } = useCarrito()

  return (
    <main className={styles.page}>
      <h1 className={styles.heading}>
        <UilShoppingCart className={styles.icon} size="1.25em" />
        Carrito de compras
      </h1>

      {items.length === 0 ? (
        <CartEmpty />
      ) : (
        <p>Productos en el carrito: {items.length}</p>
      )}
    </main>
  )
}