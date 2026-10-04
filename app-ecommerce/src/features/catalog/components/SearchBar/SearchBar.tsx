import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchBox } from 'react-instantsearch'
import { UilSearch, UilTimes } from '@iconscout/react-unicons'
import styles from './SearchBar.module.css'
import { SEARCH_DEBOUNCE_MS } from '../../../../services/Algolia'

/**
 * Barra de busqueda del catalogo.
 *
 * Se conecta al estado de busqueda de Algolia mediante useSearchBox, usando su
 * parametro queryHook para aplicar un debounce: refine() actualiza el estado de
 * inmediato, pero la peticion a Algolia sale SEARCH_DEBOUNCE_MS despues de la
 * ultima tecla.
 *
 * El valor del input se mantiene en estado local para que la escritura sea
 * inmediata, sin esperar al debounce ni a la red.
 *
 * El input se resincroniza con el estado de Algolia solo cuando ambos divergen,
 * de modo que un "Limpiar todo" externo vacie el campo sin pisar lo que el
 * usuario esta escribiendo.
 */
export function SearchBar() {
  /** Temporizador del debounce; se conserva entre renders para reiniciarlo */
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  /** Aplica el debounce al refined del query antes de disparar la busqueda */
  const queryHook = useCallback((query: string, search: (value: string) => void) => {
    clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => search(query), SEARCH_DEBOUNCE_MS)
  }, [])

  const { query, refine } = useSearchBox({ queryHook })
  const [value, setValue] = useState(query)

  /** Ultimo valor enviado a Algolia, para distinguir tipeo propio de cambios externos */
  const lastRefined = useRef(query)

  useEffect(() => {
    if (query !== lastRefined.current) {
      lastRefined.current = query
      setValue(query)
    }
  }, [query])

  function handleChange(next: string) {
    setValue(next)
    lastRefined.current = next
    refine(next)
  }

  return (
    <div className={styles.wrapper}>
      <span className={styles.icon}>
        <UilSearch size="18" />
      </span>

      <input
        className={styles.input}
        type="text"
        placeholder="Buscar productos..."
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        autoComplete="off"
      />

      {/* Boton limpiar - visible solo cuando hay texto */}
      {value && (
        <button
          className={styles.clearBtn}
          onClick={() => handleChange('')}
          aria-label="Limpiar busqueda"
        >
          <UilTimes size="16" />
        </button>
      )}
    </div>
  )
}
