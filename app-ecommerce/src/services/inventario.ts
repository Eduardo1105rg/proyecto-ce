import { SUCURSALES } from '../data/sucursales'
import type { Product, StockBranch } from '../types/product'

export const CLAVE_INVENTARIO_OVERRIDES = 'marketbyte_inventario_overrides:v1'

export type InventarioOverrides = Record<string, number>

export type SucursalConStock = {
  branchId: string
  stock: number
}

export type SucursalConDisponible = SucursalConStock & {
  disponible: number
}

export function claveInventario(objectID: string, branchId: string): string {
  return `${objectID}:${branchId}`
}

function stockValido(valor: unknown): valor is number {
  return typeof valor === 'number' && Number.isFinite(valor) && valor >= 0
}

export function leerInventarioOverrides(): InventarioOverrides {
  if (typeof localStorage === 'undefined') return {}

  let crudo: string | null

  try {
    crudo = localStorage.getItem(CLAVE_INVENTARIO_OVERRIDES)
  } catch {
    return {}
  }

  if (!crudo) return {}

  let datos: unknown

  try {
    datos = JSON.parse(crudo)
  } catch {
    console.warn(
      `[inventario] ${CLAVE_INVENTARIO_OVERRIDES} no contiene JSON válido. Se descarta el contenido guardado.`,
    )
    return {}
  }

  if (typeof datos !== 'object' || datos === null) return {}

  const overrides: InventarioOverrides = {}

  for (const [clave, valor] of Object.entries(datos as Record<string, unknown>)) {
    if (!stockValido(valor)) continue
    overrides[clave] = Math.floor(valor)
  }

  return overrides
}

export function crearMapaStock(
  objectID: string,
  stockPorSucursal: StockBranch[] | null | undefined,
  overrides: InventarioOverrides = leerInventarioOverrides(),
): Record<string, number> {
  const mapa: Record<string, number> = {}

  for (const sucursal of SUCURSALES) {
    mapa[sucursal.id] = 0
  }

  for (const branch of stockPorSucursal ?? []) {
    if (!branch || typeof branch.branch_id !== 'string' || branch.branch_id === '') continue

    const base = stockValido(branch.stock) ? Math.floor(branch.stock) : 0
    const override = overrides[claveInventario(objectID, branch.branch_id)]

    mapa[branch.branch_id] = override ?? base
  }

  return mapa
}

export function crearMapaStockProducto(
  producto: Pick<Product, 'objectID' | 'stock_by_branch'>,
  overrides: InventarioOverrides = leerInventarioOverrides(),
): Record<string, number> {
  return crearMapaStock(producto.objectID, producto.stock_by_branch, overrides)
}

export function obtenerStockSucursal(
  producto: Pick<Product, 'objectID' | 'stock_by_branch'>,
  branchId: string,
  overrides: InventarioOverrides = leerInventarioOverrides(),
): number {
  return crearMapaStockProducto(producto, overrides)[branchId] ?? 0
}

export function obtenerStockTotal(
  producto: Pick<Product, 'objectID' | 'stock_by_branch'>,
  overrides: InventarioOverrides = leerInventarioOverrides(),
): number {
  return Object.values(crearMapaStockProducto(producto, overrides)).reduce(
    (total, stock) => total + stock,
    0,
  )
}

export function obtenerSucursalConMayorStock(
  producto: Pick<Product, 'objectID' | 'stock_by_branch'>,
  overrides: InventarioOverrides = leerInventarioOverrides(),
): SucursalConStock {
  const stock = crearMapaStockProducto(producto, overrides)
  const branchIds = [
    ...SUCURSALES.map((sucursal) => sucursal.id),
    ...Object.keys(stock),
  ]

  let mejor: SucursalConStock = {
    branchId: branchIds[0] ?? '',
    stock: 0,
  }

  for (const branchId of new Set(branchIds)) {
    const disponible = stock[branchId] ?? 0

    if (disponible > mejor.stock) {
      mejor = { branchId, stock: disponible }
    }
  }

  return mejor
}

export function obtenerSucursalConMayorDisponible(
  producto: Pick<Product, 'objectID' | 'stock_by_branch'>,
  cantidadesPorSucursal: Record<string, number> = {},
  overrides: InventarioOverrides = leerInventarioOverrides(),
): SucursalConDisponible {
  const stock = crearMapaStockProducto(producto, overrides)
  const branchIds = [
    ...SUCURSALES.map((sucursal) => sucursal.id),
    ...Object.keys(stock),
  ]

  let mejor: SucursalConDisponible = {
    branchId: branchIds[0] ?? '',
    stock: 0,
    disponible: 0,
  }

  for (const branchId of new Set(branchIds)) {
    const stockSucursal = stock[branchId] ?? 0
    const ocupadas = cantidadesPorSucursal[branchId] ?? 0
    const disponible = Math.max(stockSucursal - ocupadas, 0)

    if (disponible > mejor.disponible) {
      mejor = { branchId, stock: stockSucursal, disponible }
    }
  }

  return mejor
}
