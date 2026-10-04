import { UilMinus, UilPlus } from '@iconscout/react-unicons'
import styles from './QuantityStepper.module.css'

/**
 * Props del componente QuantityStepper.
 *
 * @prop label      - Nombre del producto, se usa en los aria-label de los botones.
 * @prop quantity   - Cantidad actual en el carrito.
 * @prop onDecrease - Callback al presionar el botón de menos.
 * @prop onIncrease - Callback al presionar el botón de más.
 * @prop max        - Cantidad máxima. Al alcanzarla se deshabilita el botón de más.
 * @prop size       - Tamaño visual: 'sm' (grilla), 'md' (lista) o 'lg' (detalle). Por defecto: 'sm'.
 * @prop fullWidth  - Si es true, ocupa todo el ancho y la cantidad se centra.
 */
type QuantityStepperProps = {
    label: string
    quantity: number
    onDecrease: () => void
    onIncrease: () => void
    max?: number
    size?: 'sm' | 'md' | 'lg'
    fullWidth?: boolean
}

/**
 * Control de cantidad: botón de menos a la izquierda, cantidad al centro y
 * botón de más a la derecha.
 *
 * - Los botones llevan solo ícono, así que el aria-label es lo que lee un
 *   lector de pantalla.
 * - Detiene la propagación del clic para que, usado dentro de una tarjeta
 *   clickeable, no active la navegación al detalle.
 */
export function QuantityStepper({
    label,
    quantity,
    onDecrease,
    onIncrease,
    max,
    size = 'sm',
    fullWidth = false,
}: QuantityStepperProps) {
    const iconSize = size === 'sm' ? '16' : size === 'md' ? '20' : '22'
    const reachedMax = max !== undefined && quantity >= max

    return (
        <div
            className={`${styles.stepper} ${styles[size]} ${fullWidth ? styles.fullWidth : ''}`}
            role="group"
            aria-label={`Cantidad de ${label}`}
            onClick={(e) => e.stopPropagation()}
        >
            <button
                type="button"
                className={styles.btn}
                onClick={onDecrease}
                aria-label={quantity === 1 ? `Quitar ${label} del carrito` : `Disminuir cantidad de ${label}`}
            >
                <UilMinus size={iconSize} />
            </button>

            <span className={styles.value} aria-live="polite">
                {quantity}
            </span>

            <button
                type="button"
                className={styles.btn}
                onClick={onIncrease}
                disabled={reachedMax}
                aria-label={`Aumentar cantidad de ${label}`}
                title={reachedMax ? 'Alcanzaste el stock disponible' : undefined}
            >
                <UilPlus size={iconSize} />
            </button>
        </div>
    )
}