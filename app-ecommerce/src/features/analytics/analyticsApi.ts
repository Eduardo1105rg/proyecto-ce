import type { EventoAnalytics, MetricasUsuario, TipoEvento } from '../../types/analytics'
import type { Rol } from '../../types/usuario'
import { leerEventos } from './analyticsStorage'

export type ResumenActividadUsuario = {
  usuarioId: string
  usuarioNombre?: string
  rol?: Rol
  eventos: number
  ultimaActividad: string | null
  metricas: MetricasUsuario
}

export type ResumenGlobal = MetricasUsuario & {
  usuariosActivos: number
  eventos: number
}

function contar(eventos: EventoAnalytics[], tipo: TipoEvento): number {
  return eventos.filter((evento) => evento.tipo === tipo).length
}

function calcularMetricas(eventos: EventoAnalytics[]): MetricasUsuario {
  return {
    productosVistos: contar(eventos, 'vista_producto'),
    busquedas: contar(eventos, 'busqueda'),
    agregadosCarrito: contar(eventos, 'agregar_carrito'),
    compras: contar(eventos, 'compra'),
  }
}

function recientes(eventos: EventoAnalytics[], tipo: TipoEvento, campo: string): string[] {
  const valores = eventos
    .filter((evento) => evento.tipo === tipo)
    .reverse()
    .map((evento) => String(evento.detalle[campo]))

  return [...new Set(valores)].slice(0, 10)
}

export function obtenerEventos(usuarioId: string): EventoAnalytics[] {
  return leerEventos().filter((evento) => evento.usuarioId === usuarioId)
}

export function obtenerMetricas(usuarioId: string): MetricasUsuario {
  return calcularMetricas(obtenerEventos(usuarioId))
}

/**
 * Indica si la compra de una orden ya quedó registrada para el usuario.
 *
 * Sirve para que la confirmación sea idempotente: un reintento que termina en
 * pago aprobado no debe duplicar el evento si la orden ya se había registrado.
 */
export function existeCompra(usuarioId: string, ordenId: string): boolean {
  return obtenerEventos(usuarioId).some(
    (evento) =>
      evento.tipo === 'compra' && String(evento.detalle.ordenId) === ordenId,
  )
}

export function obtenerVistosRecientes(usuarioId: string): string[] {
  return recientes(obtenerEventos(usuarioId), 'vista_producto', 'productoId')
}

export function obtenerBusquedasRecientes(usuarioId: string): string[] {
  return recientes(obtenerEventos(usuarioId), 'busqueda', 'termino')
}

export function listarActividadPorUsuario(): ResumenActividadUsuario[] {
  const porUsuario = new Map<string, EventoAnalytics[]>()

  for (const evento of leerEventos()) {
    const propios = porUsuario.get(evento.usuarioId) ?? []
    propios.push(evento)
    porUsuario.set(evento.usuarioId, propios)
  }

  return [...porUsuario.entries()]
    .map(([usuarioId, propios]) => {
      const ultimo = propios[propios.length - 1]
      const conNombre = [...propios].reverse().find((evento) => evento.usuarioNombre)
      const conRol = [...propios].reverse().find((evento) => evento.rol)

      return {
        usuarioId,
        usuarioNombre: conNombre?.usuarioNombre,
        rol: conRol?.rol,
        eventos: propios.length,
        ultimaActividad: ultimo?.fecha ?? null,
        metricas: calcularMetricas(propios),
      }
    })
    .sort((a, b) => (b.ultimaActividad ?? '').localeCompare(a.ultimaActividad ?? ''))
}

export function obtenerResumenGlobal(): ResumenGlobal {
  const eventos = leerEventos()
  const usuarios = new Set(eventos.map((evento) => evento.usuarioId))

  return {
    usuariosActivos: usuarios.size,
    eventos: eventos.length,
    ...calcularMetricas(eventos),
  }
}
