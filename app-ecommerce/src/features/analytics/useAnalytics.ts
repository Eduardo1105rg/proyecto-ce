import { useCallback } from 'react'
import type { EventoAnalytics, TipoEvento } from '../../types/analytics'
import { useAuth } from '../auth/useAuth'
import { registrarEvento } from './analyticsStorage'

export const USUARIO_ANONIMO = 'anonimo'

export function useAnalytics() {
	const { usuario } = useAuth()
	const usuarioId = usuario?.id ?? USUARIO_ANONIMO

	const registrar = useCallback(
		(tipo: TipoEvento, detalle: EventoAnalytics['detalle']) => {
			registrarEvento(usuarioId, tipo, detalle, {
				usuarioNombre: usuario?.nombre,
				rol: usuario?.rol,
			})
		},
		[usuarioId, usuario],
	)

	return { registrar, usuarioId }
}
