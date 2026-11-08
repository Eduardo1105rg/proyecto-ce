import { createContext } from 'react';
import type { Usuario } from '../../types/usuario';

export interface AuthContextValue {
    usuario: Usuario | null;
    iniciarSesion: (usuarioId: string) => Promise<string | null>;
    iniciarSesionConCredenciales: (correo: string, contrasena: string) => Promise<string | null>;
    cerrarSesion: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);