import { UilAngleLeft, UilAngleRight } from '@iconscout/react-unicons'
import styles from './Pagination.module.css'

/**
 * Props del componente Pagination.
 *
 * @prop currentPage  - Pagina actualmente activa (base 1).
 * @prop totalPages   - Total de paginas disponibles.
 * @prop onPageChange - Callback que recibe el numero de pagina seleccionada.
 */
type PaginationProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

/**
 * Componente de paginacion para el catalogo.
 *
 * No se renderiza si totalPages es 1 o menos.
 *
 * La funcion getPages genera un arreglo inteligente de numeros de pagina:
 * - Si hay 7 paginas o menos, muestra todas.
 * - Si hay mas, muestra siempre la primera y la ultima, las paginas
 *   adyacentes a la actual, y reemplaza los saltos con '...'.
 *
 * Los botones anterior/siguiente se deshabilitan en los extremos. *
 *
 * @example
 * <Pagination
 *   currentPage={currentPage + 1}
 *   totalPages={totalPages}
 *   onPageChange={(page) => { refinePage(page - 1); window.scrollTo({ top: 0 }) }}
 * />
 */
export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  /**
   * Calcula que numeros de pagina mostrar.
   * Retorna un arreglo que puede incluir numeros o el string '...' como separador visual.
   */
  function getPages(): (number | '...')[] {
    const pages: (number | '...')[] = []

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
      return pages
    }

    pages.push(1)

    if (currentPage > 3) pages.push('...')

    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)

    for (let i = start; i <= end; i++) pages.push(i)

    if (currentPage < totalPages - 2) pages.push('...')

    pages.push(totalPages)

    return pages
  }

  const pages = getPages()

  return (
    <nav className={styles.pagination} aria-label="Paginacion">

      {/* Boton anterior - deshabilitado en la primera pagina */}
      <button
        className={`${styles.btn} ${styles.btnNav}`}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Pagina anterior"
      >
        <UilAngleLeft size="18" />
      </button>

      {/* Numeros de pagina y separadores */}
      <div className={styles.pages}>
        {pages.map((page, i) =>
          page === '...' ? (
            <span key={`dots-${i}`} className={styles.dots}>...</span>
          ) : (
            <button
              key={page}
              className={`${styles.btn} ${page === currentPage ? styles.btnActive : ''}`}
              onClick={() => onPageChange(page)}
              aria-label={`Pagina ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          )
        )}
      </div>

      {/* Boton siguiente - deshabilitado en la ultima pagina */}
      <button
        className={`${styles.btn} ${styles.btnNav}`}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Pagina siguiente"
      >
        <UilAngleRight size="18" />
      </button>

    </nav>
  )
}