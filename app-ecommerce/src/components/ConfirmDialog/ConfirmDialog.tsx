import { useEffect, useId, useRef } from 'react'
import { Button } from '../Button/Button'
import styles from './ConfirmDialog.module.css'

/**
 * Props del diálogo de confirmación.
 *
 * @prop open         - Si el diálogo está visible.
 * @prop title        - Título del diálogo.
 * @prop message      - Texto que explica qué se va a confirmar.
 * @prop confirmLabel - Texto del botón de confirmar. Por defecto: "Confirmar".
 * @prop cancelLabel  - Texto del botón de cancelar. Por defecto: "Cancelar".
 * @prop onConfirm    - Se llama al confirmar.
 * @prop onCancel     - Se llama al cancelar, al presionar Esc o al hacer clic fuera.
 */
type ConfirmDialogProps = {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Diálogo modal de confirmación reutilizable.
 *
 * Usa el elemento nativo <dialog>, que ya resuelve el bloqueo del fondo, el
 * foco y la tecla Esc. El estado lo controla el componente padre mediante `open`.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      onCancel={(e) => {
        // - Esc: se deja que el padre controle el cierre mediante `open`
        e.preventDefault()
        onCancel()
      }}
      onClick={(e) => {
        // - Un clic sobre el fondo oscuro tiene como destino el propio <dialog>
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div className={styles.content}>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <Button label={cancelLabel} variant="soft" size="sm" onClick={onCancel} />
          <Button label={confirmLabel} variant="primary" size="sm" onClick={onConfirm} />
        </div>
      </div>
    </dialog>
  )
}