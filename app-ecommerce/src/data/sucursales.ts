import type { Sucursal } from '../types/sucursal'

export const SUCURSALES: readonly Sucursal[] = [
  { id: 'lm-guapiles', nombre: 'Limón, Guápiles', provincia: 'Limón' },
  { id: 'sj-escazu', nombre: 'San José, Escazú', provincia: 'San José' },
  { id: 'ct-central', nombre: 'Cartago, Central', provincia: 'Cartago' },
  { id: 'hr-sarapiqui', nombre: 'Heredia, Sarapiquí', provincia: 'Heredia' },
]

const SUCURSALES_POR_ID = new Map(SUCURSALES.map((sucursal) => [sucursal.id, sucursal]))

export function obtenerSucursal(branchId: string): Sucursal | null {
  return SUCURSALES_POR_ID.get(branchId) ?? null
}

export function nombreSucursal(branchId: string): string {
  const sucursal = obtenerSucursal(branchId)

  if (sucursal) return sucursal.nombre

  return branchId
    .split('-')
    .filter(Boolean)
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
    .join(' ')
}
