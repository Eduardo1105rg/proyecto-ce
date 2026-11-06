import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { UilLock } from '@iconscout/react-unicons'
import type { Rol } from '../../../../types/usuario'
import { useAuth } from '../../useAuth'
import { ETIQUETA_ROL } from '../../rolLabels'
import styles from './RutaProtegida.module.css'

type RutaProtegidaProps = {
    roles: Rol[]
    children: ReactNode
}

export function RutaProtegida({ roles, children }: RutaProtegidaProps) {
    const { usuario } = useAuth()

    if (!usuario) {
        return (
            <main className={styles.page}>
                <section className={styles.card} role="alert">
                    <UilLock size="40" />
                    <h1 className={styles.title}>Inicie sesión para continuar</h1>
                    <p className={styles.text}>Esta sección requiere una sesión activa.</p>
                    <Link to="/login" className={styles.action}>
                        Ir a iniciar sesión
                    </Link>
                </section>
            </main>
        )
    }

    if (!roles.includes(usuario.rol)) {
        return (
            <main className={styles.page}>
                <section className={styles.card} role="alert">
                    <UilLock size="40" />
                    <h1 className={styles.title}>Acceso denegado</h1>
                    <p className={styles.text}>
                        Esta sección no está disponible para su rol ({ETIQUETA_ROL[usuario.rol]}).
                    </p>
                    <Link to="/catalogo" className={styles.action}>
                        Volver al catálogo
                    </Link>
                </section>
            </main>
        )
    }

    return <>{children}</>
}