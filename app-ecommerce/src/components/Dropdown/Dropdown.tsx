import { useState, useRef, useEffect } from 'react'
import { UilAngleDown, UilCheck } from '@iconscout/react-unicons'
import styles from './Dropdown.module.css'

/**
 * Representa una opción dentro del Dropdown.
 *
 * @prop label - Texto visible para el usuario.
 * @prop value - Valor interno que se maneja en la lógica (ej. nombre del índice de Algolia).
 */
export type DropdownOption = {
  label: string
  value: string
}

/**
 * Props del componente Dropdown.
 *
 * @prop options     - Lista de opciones a mostrar.
 * @prop value       - Valor actualmente seleccionado.
 * @prop onChange    - Callback que recibe el value de la opción elegida.
 * @prop placeholder - Texto que se muestra cuando no hay nada seleccionado. Por defecto: 'Seleccionar'.
 */
type DropdownProps = {
  options: DropdownOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

/**
 * Componente de selección personalizado (reemplaza el <select> nativo).
 *
 * Muestra un botón trigger que abre una lista de opciones flotante.
 * La opción activa se marca con un ícono de check.
 * Se cierra automáticamente al hacer clic fuera del componente
 * mediante un listener en `mousedown` sobre el documento.
 *
 * Usado principalmente en el FilterPanel para el selector de ordenamiento.
 *
 * @example
 * <Dropdown
 *   options={SORT_OPTIONS}
 *   value={currentSort}
 *   onChange={(val) => refineSort(val)}
 * />
 */
export function Dropdown({ options, value, onChange, placeholder = 'Seleccionar' }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = options.find(o => o.value === value)

  /** Cierra el dropdown al hacer clic fuera del componente */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={styles.wrapper} ref={ref}>
      <button
        className={`${styles.trigger} ${open ? styles.triggerOpen : ''}`}
        onClick={() => setOpen(prev => !prev)}
      >
        <span>{selected?.label ?? placeholder}</span>
        <UilAngleDown
          size="16"
          className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
        />
      </button>

      {open && (
        <div className={styles.dropdown}>
          {options.map(opt => (
            <button
              key={opt.value}
              className={`${styles.option} ${opt.value === value ? styles.optionActive : ''}`}
              onClick={() => { onChange(opt.value); setOpen(false) }}
            >
              <span>{opt.label}</span>
              {opt.value === value && <UilCheck size="16" className={styles.check} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}