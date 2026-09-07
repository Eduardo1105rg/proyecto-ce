import { useSearchBox } from 'react-instantsearch'
import { UilSearch, UilTimes } from '@iconscout/react-unicons'
import styles from './SearchBar.module.css'

export function SearchBar() {
  const { query, refine } = useSearchBox()

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
        onChange={(e) => refine(e.target.value)}
        autoComplete="off"
      />

      {query && (
        <button
          className={styles.clearBtn}
          onClick={() => refine('')}
          aria-label="Limpiar búsqueda"
        >
          <UilTimes size="16" />
        </button>
      )}
    </div>
  )
}