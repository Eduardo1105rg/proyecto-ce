import { Link } from 'react-router-dom'
import { UilUser, UilSignout } from '@iconscout/react-unicons'
import { useAuth } from '../../useAuth'
import { ETIQUETA_ROL, ETIQUETA_ROL_CORTA } from '../../rolLabels'
import styles from './UserChip.module.css'

export function UserChip() {
    const { usuario, cerrarSesion } = useAuth()

    if (!usuario) {
        return (
            <Link to="/login" className={styles.login}>
                <UilUser size="18" />
                <span>Ingresar</span>
            </Link>
        )
    }

    return (
        <div className={styles.chip}>
            <Link
                to="/login"
                className={styles.info}
                aria-label={`Sesión de ${usuario.nombre}, rol ${ETIQUETA_ROL[usuario.rol]}`}
            >
                <UilUser size="18" />
                <span className={styles.name}>{usuario.nombre}</span>
                <span className={`${styles.role} ${styles[`role${usuario.rol}`]}`}>
                    {ETIQUETA_ROL_CORTA[usuario.rol]}
                </span>
            </Link>
            <button
                type="button"
                className={styles.logout}
                onClick={cerrarSesion}
                aria-label="Cerrar sesión"
            >
                <UilSignout size="18" />
            </button>
        </div>
    )
}