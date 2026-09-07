import { useState, useRef, useEffect } from 'react'
import { UilAngleDown, UilCheck } from '@iconscout/react-unicons'
import styles from './Dropdown.module.css'

export type DropdownOption = {
  label: string
  value: string
}

type DropdownProps = {
  options: DropdownOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function Dropdown({ options, value, onChange, placeholder = 'Seleccionar' }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = options.find(o => o.value === value)

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