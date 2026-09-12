import { UilSearch, UilTimes } from '@iconscout/react-unicons'
import styles from './SearchBar.module.css'

type SearchBarProps = {
  query: string
  onQueryChange: (query: string) => void
}

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

      {query && (
        <button
          className={styles.clearBtn}
          onClick={() => onQueryChange('')}
          aria-label="Limpiar búsqueda"
        >
          <UilTimes size="16" />
        </button>
      )}
    </div>
  )
}