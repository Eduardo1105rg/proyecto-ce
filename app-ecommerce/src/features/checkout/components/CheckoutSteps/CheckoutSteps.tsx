import { UilCheck } from '@iconscout/react-unicons'
import styles from './CheckoutSteps.module.css'

export type CheckoutStep = 'data' | 'review' | 'outcome'

const STEPS: { id: CheckoutStep; label: string }[] = [
    { id: 'data', label: 'Datos' },
    { id: 'review', label: 'Resumen' },
    { id: 'outcome', label: 'Resultado' },
]

type CheckoutStepsProps = {
    current: CheckoutStep
}

/** Indicador de etapa del proceso de compra. */
export function CheckoutSteps({ current }: CheckoutStepsProps) {
    const currentIndex = STEPS.findIndex((step) => step.id === current)

    return (
        <ol className={styles.steps} aria-label="Etapas de la compra">
            {STEPS.map((step, index) => {
                const done = index < currentIndex
                const isCurrent = index === currentIndex

                return (
                    <li
                        key={step.id}
                        className={[styles.step, done ? styles.done : '', isCurrent ? styles.current : '']
                            .filter(Boolean)
                            .join(' ')}
                        aria-current={isCurrent ? 'step' : undefined}
                    >
                        <span className={styles.marker} aria-hidden="true">
                            {done ? <UilCheck size="16" /> : index + 1}
                        </span>
                        <span className={styles.label}>{step.label}</span>
                    </li>
                )
            })}
        </ol>
    )
}