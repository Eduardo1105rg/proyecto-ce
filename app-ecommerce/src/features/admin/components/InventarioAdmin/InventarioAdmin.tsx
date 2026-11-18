import { useEffect, useState } from 'react'
import {
    Configure,
    InstantSearch,
    useHits,
    useInstantSearch,
    useSearchBox,
    useStats,
} from 'react-instantsearch'
import { SUCURSALES } from '../../../../data/sucursales'
import { INDEX_MAIN, searchClient } from '../../../../services/Algolia'
import {
    claveInventario,
    crearMapaStockProducto,
    leerInventarioOverrides,
    obtenerStockTotal,
    type InventarioOverrides,
} from '../../../../services/inventario'
import type { Product } from '../../../../types/product'
import { Pagination } from '../../../catalog/components/Pagination/Pagination'
import { guardarCambiosStock, restablecerStockProducto } from '../../inventarioAdmin.mock'
import styles from './InventarioAdmin.module.css'

const PRODUCTOS_POR_PAGINA = 10

type Mensaje = { tipo: 'ok' | 'error'; texto: string }

type FilaInventarioProps = {
    producto: Product
    overrides: InventarioOverrides
    onCambio: () => void
}

function FilaInventario({ producto, overrides, onCambio }: FilaInventarioProps) {
    const [borrador, setBorrador] = useState<Record<string, string>>({})
    const [mensaje, setMensaje] = useState<Mensaje | null>(null)

    const stock = crearMapaStockProducto(producto, overrides)
    const total = obtenerStockTotal(producto, overrides)
    const modificado = SUCURSALES.some(
        (s) => overrides[claveInventario(producto.objectID, s.id)] !== undefined,
    )
    const hayBorrador = Object.keys(borrador).length > 0

    const guardar = () => {
        const cambios: Record<string, number> = {}

        for (const [branchId, texto] of Object.entries(borrador)) {
            const valor = Number(texto)
            if (texto.trim() === '' || !Number.isInteger(valor) || valor < 0) {
                setMensaje({ tipo: 'error', texto: 'Ingrese enteros mayores o iguales a 0.' })
                return
            }
            if (valor !== stock[branchId]) cambios[branchId] = valor
        }

        if (Object.keys(cambios).length === 0) {
            setBorrador({})
            setMensaje({ tipo: 'ok', texto: 'No hay cambios que guardar.' })
            return
        }

        if (guardarCambiosStock(producto.objectID, cambios)) {
            setBorrador({})
            setMensaje({ tipo: 'ok', texto: 'Stock actualizado.' })
            onCambio()
        } else {
            setMensaje({ tipo: 'error', texto: 'No se pudo guardar en este navegador.' })
        }
    }

    const restablecer = () => {
        if (restablecerStockProducto(producto.objectID)) {
            setBorrador({})
            setMensaje({ tipo: 'ok', texto: 'Stock restablecido al valor original.' })
            onCambio()
        } else {
            setMensaje({ tipo: 'error', texto: 'No se pudo restablecer en este navegador.' })
        }
    }

    return (
        <tr>
            <td>
                <span className={styles.name}>{producto.name}</span>
                <span className={styles.sku}>
                    SKU {producto.sku}
                    {modificado && <span className={styles.tag}>Modificado</span>}
                </span>
            </td>
            {SUCURSALES.map((s) => (
                <td key={s.id} data-label={s.nombre}>
                    <input
                        type="number"
                        min={0}
                        step={1}
                        inputMode="numeric"
                        className={styles.stockInput}
                        aria-label={`Stock de ${producto.name} en ${s.nombre}`}
                        value={borrador[s.id] ?? String(stock[s.id] ?? 0)}
                        onChange={(e) => {
                            setMensaje(null)
                            setBorrador({ ...borrador, [s.id]: e.target.value })
                        }}
                    />
                </td>
            ))}
            <td
                data-label="Total"
                className={`${styles.right} ${total === 0 ? styles.sinStock : ''}`}
            >
                {total === 0 ? 'Sin stock' : total}
            </td>
            <td>
                <div className={styles.acciones}>
                    <button
                        type="button"
                        className={styles.btnPrimario}
                        onClick={guardar}
                        disabled={!hayBorrador}
                    >
                        Guardar
                    </button>
                    {modificado && (
                        <button type="button" className={styles.btnSecundario} onClick={restablecer}>
                            Restablecer
                        </button>
                    )}
                </div>
                <p
                    className={`${styles.mensaje} ${mensaje?.tipo === 'error' ? styles.mensajeError : ''}`}
                    role="status"
                    aria-live="polite"
                >
                    {mensaje?.texto}
                </p>
            </td>
        </tr>
    )
}

function InventarioContenido() {
    const { query, refine } = useSearchBox()
    const { items } = useHits<Product>()
    const { nbHits } = useStats()
    const { status } = useInstantSearch()
    const [texto, setTexto] = useState(query)
    const [overrides, setOverrides] = useState<InventarioOverrides>(leerInventarioOverrides)

    useEffect(() => {
        if (texto === query) return
        const espera = setTimeout(() => refine(texto), 300)
        return () => clearTimeout(espera)
    }, [texto, query, refine])

    const cargando = items.length === 0 && status === 'loading'

    return (
        <div>
            <div className={styles.toolbar}>
                <div className={styles.search}>
                    <label htmlFor="admin-buscar-inventario" className={styles.label}>
                        Buscar producto
                    </label>
                    <input
                        id="admin-buscar-inventario"
                        type="search"
                        className={styles.input}
                        value={texto}
                        onChange={(e) => setTexto(e.target.value)}
                        placeholder="Nombre, marca o categoría"
                    />
                </div>
                <p className={styles.count}>{nbHits} productos</p>
            </div>

            <p className={styles.nota}>
                Los cambios de stock son simulados: se guardan solo en este navegador y no modifican
                Algolia.
            </p>

            {cargando ? (
                <p className={styles.empty}>Cargando inventario...</p>
            ) : items.length === 0 ? (
                <p className={styles.empty}>No se encontraron productos con esa búsqueda.</p>
            ) : (
                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <caption className={styles.caption}>Inventario por sucursal</caption>
                        <thead>
                            <tr>
                                <th scope="col">Producto</th>
                                {SUCURSALES.map((s) => (
                                    <th key={s.id} scope="col">
                                        {s.nombre}
                                    </th>
                                ))}
                                <th scope="col" className={styles.right}>
                                    Total
                                </th>
                                <th scope="col">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((p) => (
                                <FilaInventario
                                    key={p.objectID}
                                    producto={p}
                                    overrides={overrides}
                                    onCambio={() => setOverrides(leerInventarioOverrides())}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className={styles.pagination}>
                <Pagination />
            </div>
        </div>
    )
}

export function InventarioAdmin() {
    return (
        <InstantSearch searchClient={searchClient} indexName={INDEX_MAIN} routing={false}>
            <Configure hitsPerPage={PRODUCTOS_POR_PAGINA} />
            <InventarioContenido />
        </InstantSearch>
    )
}