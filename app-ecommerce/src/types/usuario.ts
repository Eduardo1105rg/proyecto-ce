export type Rol = 'B2C' | 'B2B' | 'ADMIN';

export const ROLES_VALIDOS: readonly Rol[] = ['B2C', 'B2B', 'ADMIN'];

export function esRolValido(valor: unknown): valor is Rol {
  return typeof valor === 'string' && (ROLES_VALIDOS as readonly string[]).includes(valor);
}

export interface Empresa {
  nombre: string;
  cedulaJuridica: string;
}

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: Rol;
  empresa?: Empresa;
}