import { useEffect, useState } from 'react'

/**
 * Hook personalizado para manejar el tema visual de la aplicacion (light/dark).
 *
 * Al inicializar, lee la preferencia guardada en localStorage.
 * Si no hay preferencia guardada, arranca en 'light' por defecto.
 *
 * Cuando el tema cambia, aplica o remueve la clase 'dark' en html, 
 * lo que activa los estilos de dark y los definidos con :global(.dark) en los CSS Modules.
 * Tambien persiste la seleccion en localStorage para que se mantenga
 * entre sesiones del navegador.
 */
export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') ?? 'light'
  })

  useEffect(() => {
    const root = document.documentElement

    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    localStorage.setItem('theme', theme)
  }, [theme])

  /** Alterna entre tema claro y oscuro */
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  return { theme, toggleTheme }
}