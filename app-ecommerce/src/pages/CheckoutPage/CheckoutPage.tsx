import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
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

// TO DO E3b: mover `procesarPago` del stub C (`checkoutApi.mock.ts`) al Sandbox
// real (`services/paymentSandbox.ts`). Las órdenes ya usan su servicio real.
import { aplicarResultado, crearOrden, obtenerOrden } from '../../services/orders'
import { procesarPago } from '../../features/checkout/checkoutApi.mock'
import type { SandboxScenario } from '../../features/checkout/checkoutApi.mock'

/**
 * Reconstruye el resultado de pago de una orden persistida para poder mostrar
 * la pantalla de resultado tras una recarga. La orden no guarda el
 * `transactionId`, así que no se recupera. Devuelve `null` si el pago aún no
 * quedó resuelto.
 */
function resultadoDesdeOrden(order: Order): PaymentResult | null {
    if (order.paymentStatus === 'APPROVED') {
        return { code: 'PAYMENT_APPROVED', orderId: order.orderNumber, message: 'Su pago fue aprobado.' }
    }

    if (order.paymentStatus === 'DECLINED') {
        return {
            code: 'PAYMENT_DECLINED',
            orderId: order.orderNumber,
            message: 'El pago fue rechazado. Verifique su método de pago o intente con otro.',
        }
    }

    if (order.paymentStatus === 'ERROR') {
        return {
            code: 'PAYMENT_ERROR',
            orderId: order.orderNumber,
            message: 'El servicio de pago no está disponible en este momento. Intente de nuevo.',
        }
    }

    return null
}

export function CheckoutPage() {
    const { items, totales, cargando, error, vaciar, activarConsulta } = useCarrito()

    const [searchParams, setSearchParams] = useSearchParams()

    // Persistencia básica (E3a): el número de orden viaja en la URL y la orden ya
    // quedó guardada por el servicio de órdenes. Al montar se lee una sola vez
    // para reconstruir la pantalla de resultado cuando se recarga el paso; el
    // resto del flujo controla el estado por su cuenta.
    const [recovery] = useState(() => {
        const numero = searchParams.get('orden')
        const recuperada = numero ? obtenerOrden(numero) : null
        const pago = recuperada ? resultadoDesdeOrden(recuperada) : null
        return pago ? { order: recuperada, result: pago } : null
    })

    const [step, setStep] = useState<CheckoutStep>(recovery ? 'outcome' : 'data')
    const [values, setValues] = useState<CheckoutValues>(EMPTY_VALUES)
    const [scenario, setScenario] = useState<SandboxScenario>('PAYMENT_APPROVED')
    const [order, setOrder] = useState<Order | null>(recovery?.order ?? null)
    const [result, setResult] = useState<PaymentResult | null>(recovery?.result ?? null)
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
        setSearchParams({}, { replace: true })
        goTo('data')
    }

    const handleRetry = () => {
        setResult(null)
        setSearchParams({}, { replace: true })
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

            const actualizada = aplicarResultado(current, payment)

            setOrder(actualizada)
            setResult(payment)

            // El carrito solo se vacía cuando el pago fue aprobado.
            if (payment.code === 'PAYMENT_APPROVED') vaciar()

            // El número de orden en la URL permite recuperar el resultado tras
            // una recarga, sin agregar una entrada al historial.
            setSearchParams({ orden: actualizada.orderNumber }, { replace: true })

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