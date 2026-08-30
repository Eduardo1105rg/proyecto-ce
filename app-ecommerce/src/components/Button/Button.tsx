import styles from './Button.module.css'

type ButtonVariant =
  // Sólidas
  | 'primaryDark'
  | 'primary'
  | 'accent'
  | 'secondary'
  | 'dangerSolid'
  // Suaves
  | 'soft'
  | 'secondarySoft'
  | 'danger'
  | 'success'
  | 'warning'
  // Outline
  | 'outline'
  | 'outlineSecondary'
  | 'outlineDanger'
  // Ghost
  | 'ghost'

type ButtonSize = 'sm' | 'md' | 'lg'

type ButtonProps = {
  label: string
  onClick?: () => void
  variant?: ButtonVariant
  size?: ButtonSize
  pill?: boolean
  fullWidth?: boolean
  disabled?: boolean
}

export function Button({
  label,
  onClick,
  variant = 'primary',
  size = 'md',
  pill = false,
  fullWidth = false,
  disabled = false,
}: ButtonProps) {
  return (
    <button
      className={[
        styles.btn,
        styles[variant],
        styles[size],
        pill ? styles.pill : '',
        fullWidth ? styles.fullWidth : '',
      ].join(' ')}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  )
}