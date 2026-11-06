import { INDEX_USERS, escapeFilterValue, searchClient } from '../../services/Algolia'
import { esRolValido } from '../../types/usuario'
import type { Usuario } from '../../types/usuario'

const USUARIOS_POR_CONSULTA = 100
const ATRIBUTOS_USUARIO = ['objectID', 'username', 'rol', 'nombre', 'correo', 'empresa']

type HitUsuario = {
  objectID?: unknown
  username?: unknown
  password?: unknown
  rol?: unknown
  nombre?: unknown
  correo?: unknown
  empresa?: unknown
}

function texto(valor: unknown): string | undefined {
  return typeof valor === 'string' && valor.trim() !== '' ? valor.trim() : undefined
}

function normalizarEmpresa(valor: unknown): Usuario['empresa'] {
  if (typeof valor !== 'object' || valor === null) return undefined

  const empresa = valor as Record<string, unknown>
  const nombre = texto(empresa.nombre)
  const cedulaJuridica = texto(empresa.cedulaJuridica)

  if (!nombre || !cedulaJuridica) return undefined

  return { nombre, cedulaJuridica }
}

function mapearUsuario(hit: HitUsuario): Usuario | null {
  const id = texto(hit.objectID)
  const username = texto(hit.username)

  if (!id || !username || !esRolValido(hit.rol)) return null

  const empresa = normalizarEmpresa(hit.empresa)

  return {
    id,
    nombre: texto(hit.nombre) ?? username,
    correo: texto(hit.correo) ?? username,
    rol: hit.rol,
    ...(empresa ? { empresa } : {}),
  }
}

type ConsultaUsuarios = {
  query: string
  filters?: string
  hitsPerPage: number
  attributesToRetrieve: string[]
}

async function consultarUsuarios({
  query,
  filters,
  hitsPerPage,
  attributesToRetrieve,
}: ConsultaUsuarios): Promise<HitUsuario[]> {
  const { results } = await searchClient.search<HitUsuario>({
    requests: [
      {
        indexName: INDEX_USERS,
        query,
        ...(filters ? { filters } : {}),
        hitsPerPage,
        attributesToRetrieve,
      },
    ],
  })

  const respuesta = results[0]

  if (!respuesta || !('hits' in respuesta)) {
    throw new Error('Algolia no devolvió usuarios.')
  }

  return respuesta.hits
}

export async function listarUsuarios(): Promise<Usuario[]> {
  const hits = await consultarUsuarios({
    query: '',
    hitsPerPage: USUARIOS_POR_CONSULTA,
    attributesToRetrieve: ATRIBUTOS_USUARIO,
  })

  return hits
    .map(mapearUsuario)
    .filter((usuario): usuario is Usuario => usuario !== null)
}

export async function obtenerUsuario(id: string): Promise<Usuario | null> {
  if (id.trim() === '') return null

  const hits = await consultarUsuarios({
    query: '',
    filters: `objectID:"${escapeFilterValue(id)}"`,
    hitsPerPage: 1,
    attributesToRetrieve: ATRIBUTOS_USUARIO,
  })

  return hits.map(mapearUsuario).find((usuario) => usuario !== null) ?? null
}

export async function validarCredenciales(
  identificador: string,
  contrasena: string,
): Promise<Usuario | null> {
  const objetivo = identificador.trim().toLowerCase()

  if (!objetivo || contrasena === '') return null

  const hits = await consultarUsuarios({
    query: objetivo,
    hitsPerPage: USUARIOS_POR_CONSULTA,
    attributesToRetrieve: [...ATRIBUTOS_USUARIO, 'password'],
  })

  const encontrado = hits.find((hit) => {
    const username = texto(hit.username)?.toLowerCase()
    const correo = texto(hit.correo)?.toLowerCase()
    const coincideIdentificador = username === objetivo || correo === objetivo

    return (
      coincideIdentificador &&
      typeof hit.password === 'string' &&
      hit.password === contrasena
    )
  })

  return encontrado ? mapearUsuario(encontrado) : null
}
