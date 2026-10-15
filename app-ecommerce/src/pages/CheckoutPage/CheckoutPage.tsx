import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCarrito } from '../../context/carritoContext'
import { CartEmpty } from '../../features/cart/components/CartEmpty/CartEmpty'
import { CheckoutForm } from '../../features/checkout/components/CheckoutForm/CheckoutForm'
import { CheckoutSteps } from '../../features/checkout/components/CheckoutSteps/CheckoutSteps'
import type { CheckoutStep } from '../../features/checkout/components/CheckoutSteps/CheckoutSteps'
import { OrderReview } from '../../features/checkout/components/OrderReview/OrderReview'
import { PaymentOutcome } from '../../features/checkout/components/PaymentOutcome/PaymentOutcome'
import { EMPTY_VALUES, toBuyer, toDelivery } from '../../services/validation'
import type { CheckoutValues } from '../../services/validation'
import type { Order } from '../../types/order'
import type { PaymentResult } from '../../types/payment'
import styles from './CheckoutPage.module.css'

// TO DO conectar: reemplazar este import por los módulos reales
//   crearOrden y aplicarResultado -> módulo de órdenes 
//   procesarPago                  -> servicio Sandbox 
import {
    aplicarResultado,
    crearOrden,
    procesarPago,
} from '../../features/checkout/checkoutApi.mock'
import type { SandboxScenario } from '../../features/checkout/checkoutApi.mock'

export function CheckoutPage() {
    const { items, totales, cargando, error, vaciar, activarConsulta } = useCarrito()

    const [step, setStep] = useState<CheckoutStep>('data')
    const [values, setValues] = useState<CheckoutValues>(EMPTY_VALUES)
    const [scenario, setScenario] = useState<SandboxScenario>('PAYMENT_APPROVED')
    const [order, setOrder] = useState<Order | null>(null)
    const [result, setResult] = useState<PaymentResult | null>(null)
    const [processing, setProcessing] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const submittingRef = useRef(false)

    useEffect(() => {
        activarConsulta()
    }, [activarConsulta])

    const goTo = (next: CheckoutStep) => {
        setStep(next)
        window.scrollTo({ top: 0 })
    }

    const handleEdit = () => {
        // Si cambian los datos, la orden ya creada dejaría de ser válida.
        setOrder(null)
        setSubmitError(null)
        goTo('data')
    }

    const handleRetry = () => {
        setResult(null)
        goTo('review')
    }

    const handleConfirm = async () => {
        if (submittingRef.current) return
        submittingRef.current = true
        setProcessing(true)
        setSubmitError(null)

        try {
            // En un reintento la orden ya existe y se reutiliza.
            let current = order

            if (!current) {
                current = await crearOrden({
                    buyer: toBuyer(values),
                    delivery: toDelivery(values),
                    items: items
                        .filter((item) => !item.noDisponible)
                        .map((item) => ({
                            objectID: item.objectID,
                            name: item.titulo,
                            unitPrice: item.precio,
                            quantity: item.cantidad,
                            subtotal: item.precio * item.cantidad,
                        })),
                    // Los montos salen del carrito: no se recalculan aquí.
                    subtotal: totales.subtotal,
                    tax: totales.iva,
                    shipping: totales.envio,
                    total: totales.total,
                })
            }

            let payment: PaymentResult

            try {
                payment = await procesarPago(
                    { orderId: current.orderNumber, amount: current.total, currency: 'CRC' },
                    scenario,
                )
            } catch {
                // Si el servicio falla o no responde, se trata como un resultado más.
                payment = {
                    code: 'PAYMENT_ERROR',
                    orderId: current.orderNumber,
                    message: 'El servicio de pago no está disponible en este momento. Intente de nuevo.',
                }
            }

            setOrder(aplicarResultado(current, payment))
            setResult(payment)

            // El carrito solo se vacía cuando el pago fue aprobado.
            if (payment.code === 'PAYMENT_APPROVED') vaciar()

            goTo('outcome')
        } catch {
            setSubmitError('No se pudo crear la orden. Intente de nuevo.')
        } finally {
            submittingRef.current = false
            setProcessing(false)
        }
    }

    const renderGuard = () => {
        if (items.length === 0) return <CartEmpty />

        const message = error
            ? `No se pudieron cargar los precios: ${error}`
            : cargando
                ? 'Cargando los productos de su carrito…'
                : items.some((item) => item.noDisponible)
                    ? 'Algunos productos ya no están disponibles. Revise su carrito antes de continuar.'
                    : null

        if (!message) return null

        return (
            <div className={styles.notice} role={error ? 'alert' : 'status'}>
                <p>{message}</p>
                <Link className={styles.noticeLink} to="/carrito">
                    Volver al carrito
                </Link>
            </div>
        )
    }

    // Tras un pago aprobado el carrito queda vacío; la pantalla de resultado
    // no debe reemplazarse por el aviso de carrito vacío.
    const guard = step === 'outcome' ? null : renderGuard()

    return (
        <main className={styles.page}>
            <h1 className={styles.heading}>Finalizar compra</h1>
            <CheckoutSteps current={step} />

            {guard ??
                (step === 'data' ? (
                    <CheckoutForm values={values} onChange={setValues} onContinue={() => goTo('review')} />
                ) : step === 'review' ? (
                    <OrderReview
                        items={items}
                        totales={totales}
                        values={values}
                        scenario={scenario}
                        processing={processing}
                        submitError={submitError}
                        onScenarioChange={setScenario}
                        onEdit={handleEdit}
                        onConfirm={handleConfirm}
                    />
                ) : (
                    result && <PaymentOutcome order={order} result={result} onRetry={handleRetry} />
                ))}
        </main>
    )
}