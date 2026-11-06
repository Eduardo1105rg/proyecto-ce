import { useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Rol, Usuario } from '../../types/usuario';
import { registrarEvento } from '../analytics/analyticsApi.mock';
import { AuthContext } from './authContext';
import { obtenerUsuario, validarCredenciales } from './authApi.mock';

const CLAVE_SESION = 'marketbyte_usuario';
const ROLES_VALIDOS: Rol[] = ['B2C', 'B2B', 'ADMIN'];

function leerUsuarioGuardado(): Usuario | null {
    try {
        const crudo = localStorage.getItem(CLAVE_SESION);
        return crudo ? (JSON.parse(crudo) as Usuario) : null;
    } catch {
        return null;
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [usuario, setUsuario] = useState<Usuario | null>(leerUsuarioGuardado);

    const abrirSesion = useCallback((encontrado: Usuario): string | null => {
        if (!ROLES_VALIDOS.includes(encontrado.rol)) {
            return 'Su usuario no tiene un rol válido. Contacte al administrador.';
        }
        localStorage.setItem(CLAVE_SESION, JSON.stringify(encontrado));
        setUsuario(encontrado);
        registrarEvento(encontrado.id, 'login', { rol: encontrado.rol });
        return null;
    }, []);

    const iniciarSesion = useCallback(
        async (usuarioId: string) => {
            const encontrado = await obtenerUsuario(usuarioId);
            if (!encontrado) {
                return 'El usuario seleccionado no existe.';
            }
            return abrirSesion(encontrado);
        },
        [abrirSesion],
    );

    const iniciarSesionConCredenciales = useCallback(
        async (correo: string, contrasena: string) => {
            const encontrado = await validarCredenciales(correo, contrasena);
            if (!encontrado) {
                return 'Correo o contraseña incorrectos.';
            }
            return abrirSesion(encontrado);
        },
        [abrirSesion],
    );

    const cerrarSesion = useCallback(() => {
        localStorage.removeItem(CLAVE_SESION);
        setUsuario(null);
    }, []);

    const value = useMemo(
        () => ({ usuario, iniciarSesion, iniciarSesionConCredenciales, cerrarSesion }),
        [usuario, iniciarSesion, iniciarSesionConCredenciales, cerrarSesion],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}