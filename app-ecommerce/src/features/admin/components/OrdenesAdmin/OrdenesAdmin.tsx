import { useEffect, useState } from 'react'
import { UilReceipt } from '@iconscout/react-unicons'
import { obtenerOrdenesParaMostrar } from '../../../../services/ordenesConsulta'
import type { OrdenConsulta, ResultadoConsultaOrdenes } from '../../../../types/order'
import { formatPrice } from '../../../../utils/formatPrice'
import {
    ETIQUETA_ESTADO_ORDEN,
    ETIQUETA_ESTADO_PAGO,
    formatearFechaOrden,
} from '../../../orders/orderLabels'
import styles from './OrdenesAdmin.module.css'

const POR_PAGINA = 10

function textoSucursal(orden: OrdenConsulta): string {
    if (orden.sucursales.length === 0) return 'No registrada'
    if (orden.sucursales.length > 1) return 'Varias'
    return orden.sucursales[0].nombre
}

/**
 * Tabla de órdenes del panel administrativo. Combina las órdenes locales con las
 * demo de Algolia mediante `obtenerOrdenesParaMostrar` y avisa si las demo fallan.
 * En pantallas menores a 900 px cada fila se muestra como una tarjeta.
 */
export function OrdenesAdmin() {
    const [resultado, setResultado] = useState<ResultadoConsultaOrdenes | null>(null)
    const [pagina, setPagina] = useState(1)

    useEffect(() => {
        let activo = true
        obtenerOrdenesParaMostrar()
            .then((r) => {
                if (activo) setResultado(r)
            })
            .catch(() => {
                if (activo) {
                    setResultado({
                        ordenes: [],
                        errorDemo: 'No se pudieron cargar las órdenes.',
                    })
                }
            })
        return () => {
            activo = false
        }
    }, [])

    if (resultado === null) {
        return (
            <p className={styles.estado} role="status">
                Cargando órdenes…
            </p>
        )
    }

    const { ordenes, errorDemo } = resultado
    const locales = ordenes.filter((o) => o.origen === 'local').length
    const totalPaginas = Math.max(1, Math.ceil(ordenes.length / POR_PAGINA))
    const paginaActual = Math.min(pagina, totalPaginas)
    const visibles = ordenes.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA)

    return (
        <section className={styles.seccion} aria-label="Órdenes">
            {errorDemo && (
                <div className={styles.aviso} role="alert">
                    <strong>Aviso:</strong> {errorDemo} Se muestran solo las órdenes locales de este
                    navegador.
                </div>
            )}

            {ordenes.length === 0 ? (
                <div className={styles.vacio}>
                    <UilReceipt size="42" className={styles.vacioIcono} />
                    <h2 className={styles.vacioTitulo}>No hay órdenes registradas</h2>
                    <p className={styles.vacioTexto}>
                        Las compras realizadas en este navegador y las órdenes demo aparecerán aquí.
                    </p>
                </div>
            ) : (
                <>
                    <p className={styles.resumen}>
                        {ordenes.length} {ordenes.length === 1 ? 'orden' : 'órdenes'} · {locales}{' '}
                        {locales === 1 ? 'local' : 'locales'} · {ordenes.length - locales} demo
                    </p>

                    <div className={styles.tablaWrap}>
                        <table className={styles.tabla}>
                            <thead>
                                <tr>
                                    <th scope="col">Orden</th>
                                    <th scope="col">Fecha</th>
                                    <th scope="col">Cliente</th>
                                    <th scope="col">Tipo</th>
                                    <th scope="col">Empresa</th>
                                    <th scope="col">Sucursal</th>
                                    <th scope="col" className={styles.derecha}>Total</th>
                                    <th scope="col">Estado</th>
                                    <th scope="col">Pago</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibles.map((orden) => (
                                    <tr key={orden.orderNumber}>
                                        <td>
                                            <span className={styles.numero}>{orden.orderNumber}</span>
                                            {orden.origen === 'demo' && <span className={styles.demo}>Demo</span>}
                                        </td>
                                        <td data-label="Fecha">{formatearFechaOrden(orden.createdAt)}</td>
                                        <td data-label="Cliente">{orden.buyer.fullName}</td>
                                        <td data-label="Tipo">{orden.rol === 'B2B' ? 'B2B' : 'B2C'}</td>
                                        <td data-label="Empresa">{orden.empresa?.nombre ?? '-'}</td>
                                        <td data-label="Sucursal">{textoSucursal(orden)}</td>
                                        <td data-label="Total" className={styles.derecha}>
                                            {formatPrice(orden.total)}
                                        </td>
                                        <td data-label="Estado">
                                            <span className={`${styles.badge} ${styles[`orden${orden.status}`]}`}>
                                                {ETIQUETA_ESTADO_ORDEN[orden.status]}
                                            </span>
                                        </td>
                                        <td data-label="Pago">
                                            <span className={`${styles.badge} ${styles[`pago${orden.paymentStatus}`]}`}>
                                                {ETIQUETA_ESTADO_PAGO[orden.paymentStatus]}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPaginas > 1 && (
                        <nav className={styles.paginacion} aria-label="Paginación de órdenes">
                            <button
                                type="button"
                                className={styles.paginaBtn}
                                onClick={() => setPagina(paginaActual - 1)}
                                disabled={paginaActual === 1}
                            >
                                Anterior
                            </button>
                            <span className={styles.paginaInfo}>
                                Página {paginaActual} de {totalPaginas}
                            </span>
                            <button
                                type="button"
                                className={styles.paginaBtn}
                                onClick={() => setPagina(paginaActual + 1)}
                                disabled={paginaActual === totalPaginas}
                            >
                                Siguiente
                            </button>
                        </nav>
                    )}
                </>
            )}
        </section>
    )
}