import { useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { esRolValido } from '../../types/usuario';
import type { Usuario } from '../../types/usuario';
import { registrarEvento } from '../analytics/analyticsStorage';
import { AuthContext } from './authContext';
import { obtenerUsuario, validarCredenciales } from './authApi';

const CLAVE_SESION = 'marketbyte_usuario';
const MENSAJE_ERROR_CONSULTA =
    'No se pudo consultar el índice de usuarios. Verifique su conexión e intente nuevamente.';

function leerUsuarioGuardado(): Usuario | null {
    try {
        const crudo = localStorage.getItem(CLAVE_SESION);
        if (!crudo) return null;

        const guardado = JSON.parse(crudo) as Usuario;

        if (!guardado || !esRolValido(guardado.rol)) {
            localStorage.removeItem(CLAVE_SESION);
            return null;
        }

        return guardado;
    } catch {
        return null;
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [usuario, setUsuario] = useState<Usuario | null>(leerUsuarioGuardado);

    const abrirSesion = useCallback((encontrado: Usuario): string | null => {
        if (!esRolValido(encontrado.rol)) {
            return 'Su usuario no tiene un rol válido. Contacte al administrador.';
        }
        localStorage.setItem(CLAVE_SESION, JSON.stringify(encontrado));
        setUsuario(encontrado);
        registrarEvento(
            encontrado.id,
            'login',
            { rol: encontrado.rol },
            { usuarioNombre: encontrado.nombre, rol: encontrado.rol },
        );
        return null;
    }, []);

    const iniciarSesion = useCallback(
        async (usuarioId: string) => {
            try {
                const encontrado = await obtenerUsuario(usuarioId);
                if (!encontrado) {
                    return 'El usuario seleccionado no existe.';
                }
                return abrirSesion(encontrado);
            } catch {
                return MENSAJE_ERROR_CONSULTA;
            }
        },
        [abrirSesion],
    );

    const iniciarSesionConCredenciales = useCallback(
        async (identificador: string, contrasena: string) => {
            try {
                const encontrado = await validarCredenciales(identificador, contrasena);
                if (!encontrado) {
                    return 'Usuario o contraseña incorrectos.';
                }
                return abrirSesion(encontrado);
            } catch {
                return MENSAJE_ERROR_CONSULTA;
            }
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