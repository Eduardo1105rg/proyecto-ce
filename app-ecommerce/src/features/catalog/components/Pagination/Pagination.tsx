import { usePagination } from 'react-instantsearch'
import { UilAngleLeft, UilAngleRight } from '@iconscout/react-unicons'
import styles from './Pagination.module.css'

/**
 * Componente de paginacion para el catalogo.
 *
 * Se conecta al estado de paginacion de Algolia mediante usePagination.
 * InstantSearch trabaja con paginas base 0, pero la interfaz usa base 1,
 * por lo que se translatedn los indices en los limites de esta funcion.
 *
 * No se renderiza si hay una sola pagina o menos.
 *
 * La funcion getPages genera un arreglo inteligente de numeros de pagina:
 * - Si hay 7 paginas o menos, muestra todas.
 * - Si hay mas, muestra siempre la primera y la ultima, las paginas
 *   adyacentes a la actual, y reemplaza los saltos con '...'.
 *
 * Los botones anterior/siguiente se deshabilitan en los extremos.
 */
export function Pagination() {
  const { nbPages, currentRefinement, refine } = usePagination()

  if (nbPages <= 1) return null

  const currentPage = currentRefinement + 1

  /**
   * Cambia de pagina y vuelve al inicio del documento.
   * InstantSearch espera la pagina en base 0.
   */
  function handlePageChange(page: number) {
    refine(page - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /**
   * Calcula que numeros de pagina mostrar.
   * Retorna un arreglo que puede incluir numeros o el string '...' como separador visual.
   */
  function getPages(): (number | '...')[] {
    const pages: (number | '...')[] = []

    if (nbPages <= 7) {
      for (let i = 1; i <= nbPages; i++) pages.push(i)
      return pages
    }

    pages.push(1)

    if (currentPage > 3) pages.push('...')

    const start = Math.max(2, currentPage - 1)
    const end = Math.min(nbPages - 1, currentPage + 1)

    for (let i = start; i <= end; i++) pages.push(i)

    if (currentPage < nbPages - 2) pages.push('...')

    pages.push(nbPages)

    return pages
  }

  const pages = getPages()

  return (
    <nav className={styles.pagination} aria-label="Paginacion">

      {/* Boton anterior - deshabilitado en la primera pagina */}
      <button
        className={`${styles.btn} ${styles.btnNav}`}
        onClick={() => handlePageChange(currentPage - 1)}
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
              onClick={() => handlePageChange(page)}
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
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === nbPages}
        aria-label="Pagina siguiente"
      >
        <UilAngleRight size="18" />
      </button>

    </nav>
  )
}
