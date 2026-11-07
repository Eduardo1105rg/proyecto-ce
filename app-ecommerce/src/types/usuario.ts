export type Rol = 'B2C' | 'B2B' | 'ADMIN';

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