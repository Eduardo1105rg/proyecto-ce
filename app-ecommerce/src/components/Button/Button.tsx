import styles from './Button.module.css'

/**
 * Variantes visuales disponibles para el botón.
 *
 * Sólidas: primaryDark, primary, accent, secondary, dangerSolid
 * Suaves:  soft, secondarySoft, danger, success, warning
 * Outline: outline, outlineSecondary, outlineDanger
 * Ghost:   ghost
 */
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

/** Tamaños disponibles: sm, md, lg */
type ButtonSize = 'sm' | 'md' | 'lg'

/**
 * Props del componente Button.
 *
 * @prop label     - Texto que se muestra dentro del botón.
 * @prop onClick   - Función que se ejecuta al hacer clic.
 * @prop variant   - Estilo visual del botón. Por defecto: 'primary'.
 * @prop size      - Tamaño del botón. Por defecto: 'md'.
 * @prop pill      - Si es true, aplica bordes completamente redondeados.
 * @prop fullWidth - Si es true, el botón ocupa el 100% del ancho disponible.
 * @prop disabled  - Si es true, el botón queda deshabilitado e ininteractuable.
 */
type ButtonProps = {
  label: string
  onClick?: () => void
  variant?: ButtonVariant
  size?: ButtonSize
  pill?: boolean
  fullWidth?: boolean
  disabled?: boolean
}

/**
 * Componente de botón reutilizable.
 *
 * Combina clases de CSS Modules según las props recibidas para generar
 * el estilo correspondiente. No maneja estado interno.
 *
 * @example
 * <Button label="Agregar al carrito" variant="primary" size="md" />
 * <Button label="Eliminar" variant="danger" disabled />
 * <Button label="Confirmar" variant="soft" fullWidth pill />
 */
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