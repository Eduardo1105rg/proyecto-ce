import { useNavigate } from 'react-router-dom'
import { Button } from '../../../../components/Button/Button'
import styles from './CartEmpty.module.css'

/**
 * Estado vacio del carrito.
 *
 * No muestra resumen de compra y ofrece volver al catalogo.
 */
export function CartEmpty() {
    const navigate = useNavigate()

    return (
        <div className={styles.empty}>
            <p className={styles.title}>Su carrito esta vacio</p>
            <p className={styles.text}>Aun no se han agregado productos al carrito.</p>
            <div className={styles.action}>
                <Button
                    label="Volver al catalogo"
                    variant="primary"
                    size="lg"
                    onClick={() => navigate('/')}
                />
            </div>
        </div>
    )
}