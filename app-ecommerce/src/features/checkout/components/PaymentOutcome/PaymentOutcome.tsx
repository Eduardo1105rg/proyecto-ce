import { useState } from 'react'
import type { CSSProperties } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    UilCheck,
    UilCopy,
    UilEnvelope,
    UilInfoCircle,
    UilTruck,
} from '@iconscout/react-unicons'
import { Button } from '../../../../components/Button/Button'
import { formatPrice } from '../../../../utils/formatPrice'
import type { Order } from '../../../../types/order'
import type { PaymentResult } from '../../../../types/payment'
import styles from './PaymentOutcome.module.css'

type PaymentOutcomeProps = {
    order: Order | null
    result: PaymentResult
    onRetry: () => void
}

const CONTENT = {
    PAYMENT_APPROVED: {
        title: '¡Gracias por su compra!',
        tone: 'approved',
        tip: null,
    },
    PAYMENT_DECLINED: {
        title: 'Su pago fue rechazado',
        tone: 'declined',
        tip: 'Verifique los datos de su método de pago o pruebe con otro.',
    },
    PAYMENT_ERROR: {
        title: 'No pudimos procesar su pago',
        tone: 'error',
        tip: 'El problema es temporal. Intente de nuevo en unos minutos.',
    },
} as const

/** Partículas de la celebración: posición final (x, y) y color de cada una. */
const CONFETTI = [
    { x: -120, y: -70, c: 'var(--blue-500)' },
    { x: -80, y: -110, c: 'var(--orange-500)' },
    { x: -30, y: -130, c: 'var(--green-500)' },
    { x: 30, y: -125, c: 'var(--yellow-500)' },
    { x: 85, y: -105, c: 'var(--blue-400)' },
    { x: 125, y: -65, c: 'var(--orange-400)' },
    { x: -135, y: 10, c: 'var(--yellow-500)' },
    { x: 135, y: 15, c: 'var(--green-400)' },
    { x: -95, y: 70, c: 'var(--blue-300)' },
    { x: 95, y: 75, c: 'var(--orange-500)' },
]

/** Ícono animado de cada resultado; se dibuja trazo a trazo. */
function Glyph({ tone }: { tone: 'approved' | 'declined' | 'error' }) {
    return (
        <svg className={styles.glyph} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {tone === 'approved' && <path className={styles.stroke} d="M5.5 12.5l4.2 4.2L18.5 7.8" />}
            {tone === 'declined' && (
                <>
                    <path className={styles.stroke} d="M7 7l10 10" />
                    <path className={styles.stroke} d="M17 7L7 17" />
                </>
            )}
            {tone === 'error' && (
                <>
                    <path className={styles.stroke} d="M12 6.5v7" />
                    <circle className={styles.dot} cx="12" cy="17.5" r="1.1" />
                </>
            )}
        </svg>
    )
}

/** Pantalla final: confirmación, pago rechazado o error del servicio. */
export function PaymentOutcome({ order, result, onRetry }: PaymentOutcomeProps) {
    const { title, tone, tip } = CONTENT[result.code]
    const approved = result.code === 'PAYMENT_APPROVED'
    const navigate = useNavigate()
    const [copied, setCopied] = useState(false)

    /** Retraso escalonado: cada bloque aparece un poco después del anterior. */
    const delay = (i: number) => ({ '--i': i }) as CSSProperties

    const handleCopy = async () => {
        if (!order) return
        try {
            await navigator.clipboard.writeText(order.orderNumber)
            setCopied(true)
            window.setTimeout(() => setCopied(false), 2000)
        } catch {
            // Sin permiso para el portapapeles: no pasa nada, el número sigue visible.
        }
    }

    return (
        <section className={`${styles.outcome} ${styles[tone]}`} aria-live="polite">
            <header className={styles.hero}>
                <div className={styles.iconWrap}>
                    {approved && (
                        <span className={styles.confetti} aria-hidden="true">
                            {CONFETTI.map((piece, index) => (
                                <i
                                    key={index}
                                    style={
                                        {
                                            '--x': `${piece.x}px`,
                                            '--y': `${piece.y}px`,
                                            '--c': piece.c,
                                            '--d': `${index * 25}ms`,
                                        } as CSSProperties
                                    }
                                />
                            ))}
                        </span>
                    )}
                    <span className={styles.icon}>
                        <Glyph tone={tone} />
                    </span>
                </div>

                <h2 className={`${styles.title} ${styles.reveal}`} style={delay(3)}>
                    {title}
                </h2>
                <p className={`${styles.message} ${styles.reveal}`} style={delay(4)}>
                    {result.message}
                </p>
            </header>

            {!approved && (
                <div className={`${styles.callout} ${styles.reveal}`} style={delay(5)} role="note">
                    <UilInfoCircle size="20" className={styles.calloutIcon} />
                    <div>
                        <p className={styles.calloutTitle}>No se realizó ningún cobro</p>
                        <p className={styles.calloutText}>Sus productos siguen en el carrito. {tip}</p>
                    </div>
                </div>
            )}

            {order && (
                <div className={`${styles.receipt} ${styles.reveal}`} style={delay(6)}>
                    <div className={styles.orderRow}>
                        <div>
                            <p className={styles.label}>Número de orden</p>
                            <p className={styles.orderNumber}>{order.orderNumber}</p>
                        </div>
                        <button type="button" className={styles.copy} onClick={handleCopy}>
                            {copied ? <UilCheck size="16" /> : <UilCopy size="16" />}
                            <span aria-live="polite">{copied ? 'Copiado' : 'Copiar'}</span>
                        </button>
                    </div>

                    <dl className={styles.facts}>
                        <div>
                            <dt>Fecha</dt>
                            <dd>
                                {new Date(order.createdAt).toLocaleString('es-CR', {
                                    dateStyle: 'long',
                                    timeStyle: 'short',
                                })}
                            </dd>
                        </div>
                        {approved && result.transactionId && (
                            <div>
                                <dt>Transacción</dt>
                                <dd>{result.transactionId}</dd>
                            </div>
                        )}
                    </dl>

                    <div className={styles.tear} aria-hidden="true" />

                    <dl className={styles.totals}>
                        <div>
                            <dt>Subtotal</dt>
                            <dd>{formatPrice(order.subtotal)}</dd>
                        </div>
                        <div>
                            <dt>IVA</dt>
                            <dd>{formatPrice(order.tax)}</dd>
                        </div>
                        <div>
                            <dt>Envío</dt>
                            <dd>{order.shipping === 0 ? 'Gratis' : formatPrice(order.shipping)}</dd>
                        </div>
                        <div className={styles.grand}>
                            <dt>{approved ? 'Total pagado' : 'Total de la orden'}</dt>
                            <dd>{formatPrice(order.total)}</dd>
                        </div>
                    </dl>
                </div>
            )}

            {approved && order && (
                <ol className={`${styles.next} ${styles.reveal}`} style={delay(7)} aria-label="Qué sigue">
                    <li>
                        <span className={styles.nextIcon}>
                            <UilEnvelope size="18" />
                        </span>
                        <span>
                            Enviaremos la confirmación a <strong>{order.buyer.email}</strong>
                        </span>
                    </li>
                    <li>
                        <span className={styles.nextIcon}>
                            <UilTruck size="18" />
                        </span>
                        <span>
                            Su pedido será enviado a{' '}
                            <strong>
                                {order.delivery.canton}, {order.delivery.province}
                            </strong>
                        </span>
                    </li>
                </ol>
            )}

            <div className={`${styles.actions} ${styles.reveal}`} style={delay(8)}>
                {approved ? (
                    <Button
                        label="Seguir comprando"
                        variant="primary"
                        size="lg"
                        onClick={() => navigate('/catalogo')}
                    />
                ) : (
                    <>
                        <Button label="Intentar de nuevo" variant="primary" size="lg" onClick={onRetry} />
                        <Link className={styles.link} to="/carrito">
                            Volver al carrito
                        </Link>
                    </>
                )}
            </div>
        </section>
    )
}