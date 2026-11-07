import type { Usuario } from '../../types/usuario';

interface CredencialMock {
	usuario: Usuario;
	contrasena: string;
}

const CREDENCIALES_MOCK: CredencialMock[] = [
	{
		usuario: { id: 'u-b2c', nombre: 'Ana Mora', correo: 'ana@correo.com', rol: 'B2C' },
		contrasena: 'b2c12345',
	},
	{
		usuario: {
			id: 'u-b2b',
			nombre: 'Carlos Vega',
			correo: 'carlos@empresa.com',
			rol: 'B2B',
			empresa: { nombre: 'Tecnosur S.A.', cedulaJuridica: '3-101-123456' },
		},
		contrasena: 'b2b12345',
	},
	{
		usuario: { id: 'u-admin', nombre: 'Administrador', correo: 'admin@marketbyte.com', rol: 'ADMIN' },
		contrasena: 'admin12345',
	},
];

// TODO conectar con el índice users de Algolia
export async function listarUsuarios(): Promise<Usuario[]> {
	return CREDENCIALES_MOCK.map((c) => c.usuario);
}

// TODO conectar con el índice users de Algolia
export async function obtenerUsuario(id: string): Promise<Usuario | null> {
	return CREDENCIALES_MOCK.find((c) => c.usuario.id === id)?.usuario ?? null;
}

// TODO conectar con el índice users de Algolia
export async function validarCredenciales(
	correo: string,
	contrasena: string,
): Promise<Usuario | null> {
	const encontrada = CREDENCIALES_MOCK.find(
		(c) =>
			c.usuario.correo.toLowerCase() === correo.trim().toLowerCase() &&
			c.contrasena === contrasena,
	);
	return encontrada?.usuario ?? null;
}