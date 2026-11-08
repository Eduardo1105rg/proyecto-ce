import type { Rol } from './usuario';

export type TipoEvento =
  | 'login'
  | 'busqueda'
  | 'vista_producto'
  | 'agregar_carrito'
  | 'inicio_checkout'
  | 'compra';

export interface EventoAnalytics {
  id: string;
  tipo: TipoEvento;
  fecha: string;
  usuarioId: string;
  usuarioNombre?: string;
  rol?: Rol;
  detalle: Record<string, string | number>;
}

export interface MetricasUsuario {
  productosVistos: number;
  busquedas: number;
  agregadosCarrito: number;
  compras: number;
}