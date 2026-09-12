import { UilSearch, UilTimes } from '@iconscout/react-unicons'
import styles from './SearchBar.module.css'

/**
 * Props del componente SearchBar.
 *
 * @prop query         - Texto actual del campo de busqueda.
 * @prop onQueryChange - Callback que se ejecuta en cada cambio del input,
 *                       recibe el nuevo string como argumento.
 */
type SearchBarProps = {
  query: string
  onQueryChange: (query: string) => void
}

/**
 * Barra de busqueda del catalogo.
 *
 * Componente controlado: su valor siempre refleja la prop query.
 * El padre es responsable de conectar query y onQueryChange con
 * el estado de busqueda de Algolia (useSearchBox).
 */
export function SearchBar({ query, onQueryChange }: SearchBarProps) {
  return (
    <div className={styles.wrapper}>
      <span className={styles.icon}>
        <UilSearch size="18" />
      </span>

      <input
        className={styles.input}
        type="text"
        placeholder="Buscar productos..."
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        autoComplete="off"
      />

      {/* Boton limpiar - visible solo cuando hay texto */}
      {query && (
        <button
          className={styles.clearBtn}
          onClick={() => onQueryChange('')}
          aria-label="Limpiar busqueda"
        >
          <UilTimes size="16" />
        </button>
      )}
    </div>
  )
}