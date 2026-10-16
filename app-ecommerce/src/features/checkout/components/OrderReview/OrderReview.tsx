import type { ItemCarritoEnriquecido, TotalesCarrito } from '../../../../types/carrito'
import { Button } from '../../../../components/Button/Button'
import type { SandboxScenario } from '../../checkoutApi.mock'
import type { CheckoutValues } from '../../../../services/validation'
import { OrderItemsList } from '../OrderItemsList/OrderItemsList'
import { OrderTotals } from '../OrderTotals/OrderTotals'
import styles from './OrderReview.module.css'

type OrderReviewProps = {
    items: ItemCarritoEnriquecido[]
    totales: TotalesCarrito
    values: CheckoutValues
    scenario: SandboxScenario
    processing: boolean
    submitError: string | null
    onScenarioChange: (scenario: SandboxScenario) => void
    onEdit: () => void
    onConfirm: () => void
}

const SCENARIOS: { value: SandboxScenario; label: string; hint: string }[] = [
    { value: 'PAYMENT_APPROVED', label: 'Pago aprobado', hint: 'El pago se completa con éxito.' },
    { value: 'PAYMENT_DECLINED', label: 'Pago rechazado', hint: 'El proveedor rechaza el pago.' },
    { value: 'PAYMENT_ERROR', label: 'Error del servicio', hint: 'El servicio de pago no responde.' },
]

/** Resumen previo al pago: productos, datos, montos y selector del escenario Sandbox. */
export function OrderReview({
    items,
    totales,
    values,
    scenario,
    processing,
    submitError,
    onScenarioChange,
    onEdit,
    onConfirm,
}: OrderReviewProps) {
    return (
        <div className={styles.layout}>
            <div className={styles.main}>
                <section className={styles.card} aria-labelledby="review-items-title">
                    <h2 className={styles.cardTitle} id="review-items-title">
                        Productos
                    </h2>
                    <OrderItemsList items={items} />
                </section>

                <section className={styles.card} aria-labelledby="review-data-title">
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle} id="review-data-title">
                            Datos de la compra
                        </h2>
                        {!processing && <Button label="Editar" variant="outline" size="sm" onClick={onEdit} />}
                    </div>

                    <div className={styles.infoGrid}>
                        <div>
                            <h3 className={styles.infoTitle}>Comprador</h3>
                            <p className={styles.infoText}>{values.fullName.trim()}</p>
                            <p className={styles.infoText}>{values.email.trim()}</p>
                            <p className={styles.infoText}>{values.phone.trim()}</p>
                        </div>
                        <div>
                            <h3 className={styles.infoTitle}>Entrega</h3>
                            <p className={styles.infoText}>
                                {values.province}, {values.canton.trim()}
                            </p>
                            <p className={styles.infoText}>{values.address.trim()}</p>
                            {values.notes.trim() && <p className={styles.infoText}>{values.notes.trim()}</p>}
                        </div>
                    </div>
                </section>
            </div>

            <aside className={styles.side} aria-label="Pago">
                <section className={styles.card} aria-labelledby="review-total-title">
                    <h2 className={styles.cardTitle} id="review-total-title">
                        Resumen de compra
                    </h2>
                    <OrderTotals totales={totales} />
                </section>

                <section className={styles.card}>
                    <fieldset className={styles.scenarios} disabled={processing}>
                        <legend className={styles.cardTitle}>Simulación de pago (Sandbox)</legend>
                        <p className={styles.note}>
                            Elija el resultado que desea simular. No se realiza ningún cobro real.
                        </p>

                        {SCENARIOS.map((option) => (
                            <label
                                key={option.value}
                                className={`${styles.option} ${scenario === option.value ? styles.optionActive : ''}`}
                            >
                                <input
                                    type="radio"
                                    name="sandbox-scenario"
                                    value={option.value}
                                    checked={scenario === option.value}
                                    onChange={() => onScenarioChange(option.value)}
                                />
                                <span>
                                    <span className={styles.optionLabel}>{option.label}</span>
                                    <span className={styles.optionHint}>{option.hint}</span>
                                </span>
                            </label>
                        ))}
                    </fieldset>

                    {submitError && (
                        <p className={styles.error} role="alert">
                            {submitError}
                        </p>
                    )}

                    <div className={styles.confirm}>
                        <Button
                            label={processing ? 'Procesando pago…' : 'Confirmar y pagar'}
                            variant="primary"
                            size="lg"
                            fullWidth
                            disabled={processing}
                            onClick={onConfirm}
                        />
                    </div>
                    {processing && (
                        <p className={styles.processing} role="status">
                            Estamos procesando su pago, por favor no cierre esta página.
                        </p>
                    )}
                </section>
            </aside>
        </div>
    )
}