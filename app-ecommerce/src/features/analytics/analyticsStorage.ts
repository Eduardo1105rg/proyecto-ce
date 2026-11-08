import type { EventoAnalytics, TipoEvento } from '../../types/analytics'
import { esRolValido } from '../../types/usuario'
import type { Rol } from '../../types/usuario'

export const CLAVE_ACTIVIDAD = 'analytics:v1'
export const VERSION_ACTIVIDAD = 1
export const MAX_EVENTOS = 1000

type ActividadGuardada = {
  version: number
  eventos: EventoAnalytics[]
}

type ContextoUsuario = {
  usuarioNombre?: string
  rol?: Rol
}

const TIPOS_EVENTO: readonly TipoEvento[] = [
  'login',
  'busqueda',
  'vista_producto',
  'agregar_carrito',
  'inicio_checkout',
  'compra',
]

function esTipoEventoValido(valor: unknown): valor is TipoEvento {
  return typeof valor === 'string' && (TIPOS_EVENTO as readonly string[]).includes(valor)
}

function esDetalleValido(valor: unknown): valor is Record<string, string | number> {
  if (typeof valor !== 'object' || valor === null || Array.isArray(valor)) return false

  return Object.values(valor).every(
    (dato) => typeof dato === 'string' || typeof dato === 'number',
  )
}

function esEventoValido(valor: unknown): valor is EventoAnalytics {
  if (typeof valor !== 'object' || valor === null) return false

  const evento = valor as Record<string, unknown>

  return (
    typeof evento.id === 'string' &&
    evento.id.trim() !== '' &&
    esTipoEventoValido(evento.tipo) &&
    typeof evento.fecha === 'string' &&
    !Number.isNaN(Date.parse(evento.fecha)) &&
    typeof evento.usuarioId === 'string' &&
    evento.usuarioId.trim() !== '' &&
    esDetalleValido(evento.detalle) &&
    (evento.usuarioNombre === undefined || typeof evento.usuarioNombre === 'string') &&
    (evento.rol === undefined || esRolValido(evento.rol))
  )
}

function sanearEventos(valor: unknown, contexto: string): EventoAnalytics[] {
  if (!Array.isArray(valor)) return []

  const validos = valor.filter(esEventoValido)

  if (validos.length !== valor.length) {
    console.warn(
      `[analytics] ${contexto}: se descartaron ${valor.length - validos.length} evento(s) inválido(s).`,
    )
  }

  return validos
}

export function leerEventos(): EventoAnalytics[] {
  let crudo: string | null

  try {
    crudo = localStorage.getItem(CLAVE_ACTIVIDAD)
  } catch {
    console.warn('[analytics] localStorage no está disponible. La actividad no se podrá recuperar.')
    return []
  }

  if (crudo === null) return []

  let datos: unknown

  try {
    datos = JSON.parse(crudo)
  } catch {
    console.warn(
      `[analytics] ${CLAVE_ACTIVIDAD} no contiene JSON válido. Se descarta el contenido guardado.`,
    )
    return []
  }

  if (typeof datos !== 'object' || datos === null) return []

  const guardado = datos as Record<string, unknown>

  if (guardado.version !== VERSION_ACTIVIDAD) return []

  return sanearEventos(guardado.eventos, 'actividad guardada')
}

export function guardarEventos(eventos: EventoAnalytics[]): void {
  const guardado: ActividadGuardada = {
    version: VERSION_ACTIVIDAD,
    eventos: sanearEventos(eventos, 'actividad a guardar').slice(-MAX_EVENTOS),
  }

  try {
    localStorage.setItem(CLAVE_ACTIVIDAD, JSON.stringify(guardado))
  } catch {
    console.warn(
      '[analytics] no se pudo guardar la actividad. Los cambios no sobrevivirán a una recarga.',
    )
  }
}

export function registrarEvento(
  usuarioId: string,
  tipo: TipoEvento,
  detalle: EventoAnalytics['detalle'],
  contexto: ContextoUsuario = {},
): void {
  if (usuarioId.trim() === '') return

  const evento: EventoAnalytics = {
    id: crypto.randomUUID(),
    tipo,
    fecha: new Date().toISOString(),
    usuarioId,
    detalle,
    ...(contexto.usuarioNombre ? { usuarioNombre: contexto.usuarioNombre } : {}),
    ...(contexto.rol ? { rol: contexto.rol } : {}),
  }

  guardarEventos([...leerEventos(), evento])
}
