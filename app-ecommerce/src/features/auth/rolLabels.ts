import type { Rol } from '../../types/usuario';

export const ETIQUETA_ROL: Record<Rol, string> = {
    B2C: 'Cliente B2C',
    B2B: 'Cliente B2B',
    ADMIN: 'Administrador',
};

export const ETIQUETA_ROL_CORTA: Record<Rol, string> = {
    B2C: 'B2C',
    B2B: 'B2B',
    ADMIN: 'Admin',
};

export const DESCRIPCION_ROL: Record<Rol, string> = {
    B2C: 'Precios y condiciones de consumidor. Puede comprar y consultar sus órdenes.',
    B2B: 'Precios y condiciones de empresa. Puede comprar y consultar sus órdenes.',
    ADMIN: 'Panel administrativo: órdenes, productos e inventario. No realiza compras.',
};