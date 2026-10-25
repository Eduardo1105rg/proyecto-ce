import { POLICIES } from '../../policiesContent'
import { policyAnchorId, sectionAnchorId, sectionLetter } from '../../policyAnchor'
import styles from './PolicyIndexList.module.css'

type PolicyIndexListProps = {
    /** Identificador del elemento que se está leyendo (política o apartado). */
    activeId: string
    /** Política a la que pertenece el elemento activo. */
    activeSlug: string
    onSelect: (id: string) => void
}

/** Lista del índice: políticas y sus apartados. */
export function PolicyIndexList({ activeId, activeSlug, onSelect }: PolicyIndexListProps) {
    return (
        <ul className={styles.list}>
            {POLICIES.map((policy) => {
                const isCurrent = policy.slug === activeSlug
                return (
                    <li key={policy.slug}>
                        <button
                            type="button"
                            className={`${styles.link} ${isCurrent ? styles.active : ''}`}
                            aria-current={isCurrent ? 'true' : undefined}
                            onClick={() => onSelect(policyAnchorId(policy.slug))}
                        >
                            {policy.title}
                        </button>

                        {isCurrent && policy.sections.length > 0 && (
                            <ul className={styles.sublist}>
                                {policy.sections.map((section, index) => {
                                    const id = sectionAnchorId(policy.slug, index)
                                    const isActive = id === activeId
                                    return (
                                        <li key={id}>
                                            <button
                                                type="button"
                                                className={`${styles.sublink} ${isActive ? styles.subActive : ''}`}
                                                aria-current={isActive ? 'location' : undefined}
                                                onClick={() => onSelect(id)}
                                            >
                                                <span className={styles.subLetter}>{sectionLetter(index)}.</span>
                                                {section.title}
                                            </button>
                                        </li>
                                    )
                                })}
                            </ul>
                        )}
                    </li>
                )
            })}
        </ul>
    )
}