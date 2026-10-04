import type { ItemCarrito } from '../types/carrito'


export const CLAVE_CARRITO = 'carrito:v1'


export const VERSION_CARRITO = 1


type CarritoGuardado = {
  version: number
  items: ItemCarrito[]
}


function esItemValido(valor: unknown): valor is ItemCarrito {
  if (typeof valor !== 'object' || valor === null) return false

  const item = valor as Record<string, unknown>

  return (
    typeof item.objectID === 'string' &&
    item.objectID.trim() !== '' &&
    Number.isInteger(item.cantidad) &&
    (item.cantidad as number) >= 1
  )
}


function sanearItems(valor: unknown, contexto: string): ItemCarrito[] {
  if (!Array.isArray(valor)) return []

  const validos = valor.filter(esItemValido)

  if (validos.length !== valor.length) {
    console.warn(
      `[carrito] ${contexto}: se descartaron ${valor.length - validos.length} línea(s) con datos inválidos.`,
    )
  }

  return validos
}


function consolidarDuplicados(items: ItemCarrito[]): ItemCarrito[] {
  const porId = new Map<string, ItemCarrito>()

  for (const item of items) {
    const existente = porId.get(item.objectID)

    porId.set(
      item.objectID,
      existente ? { ...existente, cantidad: existente.cantidad + item.cantidad } : item,
    )
  }

  return [...porId.values()]
}


export function leerCarrito(): ItemCarrito[] {
  let crudo: string | null

  try {
    crudo = localStorage.getItem(CLAVE_CARRITO)
  } catch {
    console.warn('[carrito] localStorage no está disponible. El carrito no se podrá recuperar.')
    return []
  }

  if (crudo === null) return []

  let datos: unknown

  try {
    datos = JSON.parse(crudo)
  } catch {
    console.warn(`[carrito] ${CLAVE_CARRITO} no contiene JSON válido. Se descarta el contenido guardado.`)
    return []
  }

  if (typeof datos !== 'object' || datos === null) return []

  const guardado = datos as Record<string, unknown>

  if (guardado.version !== VERSION_CARRITO) return []

  return consolidarDuplicados(sanearItems(guardado.items, 'carrito guardado'))
}


export function guardarCarrito(items: ItemCarrito[]): void {
  const guardado: CarritoGuardado = {
    version: VERSION_CARRITO,
    items: sanearItems(items, 'carrito a guardar'),
  }

  try {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(guardado))
  } catch {
    console.warn('[carrito] no se pudo guardar el carrito. Los cambios no sobrevivirán a una recarga.')
  }
}