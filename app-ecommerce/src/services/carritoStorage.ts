import type { ItemCarrito } from '../types/carrito'

/**
 * Clave del carrito en localStorage.
 *
 * El sufijo de versión permite migrar el esquema más adelante sin romper los
 * carritos que ya están guardados en los navegadores de los usuarios.
 */
export const CLAVE_CARRITO = 'carrito:v1'

/**
 * Versión del esquema guardado.
 *
 * Sigue en 1 porque el esquema solo perdió un campo opcional: las líneas
 * guardadas por versiones anteriores se siguen validando y se vuelven a
 * escribir en el formato nuevo sin necesidad de migrarlas.
 *
 * Incrementarla se reserva para cambios que sí rompen la lectura, porque leer
 * una versión distinta descarta el carrito guardado y el usuario perdería su
 * contenido sin haber hecho nada.
 */
export const VERSION_CARRITO = 1

/**
 * Estructura persistida.
 *
 * El envoltorio con version es lo que hace posible una migración futura: sin
 * él no habría forma de distinguir un carrito viejo de uno corrupto.
 */
type CarritoGuardado = {
  version: number
  items: ItemCarrito[]
}

/**
 * Valida la forma de una línea del carrito.
 *
 * Es deliberadamente estricta: descarta las líneas con cantidad fraccionaria,
 * con cantidad menor a 1, o con objectID vacío. Una línea con cantidad 0
 * rompería los cálculos de totales, así que se prefiere perder esa línea antes
 * que arrastrar el dato inválido por toda la aplicación.
 *
 * La validación mira solo los campos que el carrito necesita. No rechaza
 * líneas que traigan campos extra, porque una versión anterior del esquema
 * guardaba también el nombre del producto y esos carritos deben seguir
 * funcionando sin necesidad de migrarlos.
 */
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

/**
 * Filtra las líneas válidas de un arreglo desconocido y avisa si descartó
 * alguna, para que un problema de datos no pase inadvertido.
 */
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

/**
 * Une las líneas que comparten objectID sumando sus cantidades.
 *
 * El reducer garantiza que nunca haya dos líneas del mismo producto, pero
 * localStorage se puede editar a mano. Sin esta consolidación, un carrito
 * manipulado a mano mostraría el mismo producto dos veces y el subtotal lo
 * contaría dos veces.
 */
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

/**
 * Recupera las líneas del carrito desde localStorage.
 *
 * Devuelve un arreglo vacío ante cualquier problema y nunca lanza. El
 * requisito 2.9 pide que el carrito sobreviva a una recarga, pero un dato
 * corrupto no puede tener más peso que la disponibilidad de la aplicación:
 * si algo falla, se pierde el carrito guardado, no la tienda.
 *
 * Se validan tres capas, porque cada una falla de una forma distinta:
 *
 * 1. localStorage puede lanzar al acceder. Ocurre con cookies deshabilitadas,
 *    dentro de un iframe sin permisos o en ciertos modos privados. Un simple
 *    acceso a la propiedad puede ser lo que lanza, por eso la lectura va
 *    dentro del try.
 * 2. El JSON puede no ser parseable, por ejemplo si alguien editó el valor a
 *    mano o si quedó una escritura a medias.
 * 3. El JSON puede ser válido pero tener otra forma. Cada línea se valida
 *    por separado para no perder el carrito entero por una sola línea mala.
 */
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

  // Una versión distinta significa que este código no sabe leer ese formato.
  // Se descarta en lugar de intentar adivinarlo.
  if (guardado.version !== VERSION_CARRITO) return []

  return consolidarDuplicados(sanearItems(guardado.items, 'carrito guardado'))
}

/**
 * Persiste las líneas del carrito.
 *
 * Nunca lanza. Si la escritura falla, por cuota agotada o por localStorage no
 * disponible, el carrito sigue funcionando en memoria: solo se pierde la
 * persistencia de esa sesión.
 *
 * Las líneas se sanean antes de escribir para mantener el invariante de que
 * lo que se escribe se puede volver a leer.
 */
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