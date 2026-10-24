import { useEffect, useState } from 'react'
import { UilListUl, UilTimes } from '@iconscout/react-unicons'
import { PolicyIndexList } from '../PolicyIndexList/PolicyIndexList'
import styles from './PolicyMobileMenu.module.css'

type PolicyMobileMenuProps = {
    activeId: string
    activeSlug: string
    onSelect: (id: string) => void
}

/** Índice para móvil: botón flotante que abre un panel con las políticas y sus apartados. */
export function PolicyMobileMenu({ activeId, activeSlug, onSelect }: PolicyMobileMenuProps) {
    const [open, setOpen] = useState(false)

    useEffect(() => {
        if (!open) return
        const handleKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpen(false)
        }
        document.addEventListener('keydown', handleKey)
        return () => document.removeEventListener('keydown', handleKey)
    }, [open])

    const handleSelect = (id: string) => {
        setOpen(false)
        onSelect(id)
    }

    return (
        <div className={styles.wrapper}>
            {open && <div className={styles.backdrop} onClick={() => setOpen(false)} aria-hidden="true" />}

            {open && (
                <nav id="policy-mobile-menu" className={styles.panel} aria-label="Información comercial">
                    <p className={styles.title}>Información</p>
                    <PolicyIndexList activeId={activeId} activeSlug={activeSlug} onSelect={handleSelect} />
                </nav>
            )}

            <button
                type="button"
                className={styles.fab}
                aria-expanded={open}
                aria-controls="policy-mobile-menu"
                aria-label={open ? 'Cerrar índice' : 'Abrir índice de información comercial'}
                onClick={() => setOpen((current) => !current)}
            >
                {open ? <UilTimes size={26} /> : <UilListUl size={26} />}
            </button>
        </div>
    )
}