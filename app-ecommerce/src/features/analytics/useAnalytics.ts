import { useCallback } from 'react'
import type { EventoAnalytics, TipoEvento } from '../../types/analytics'
import { useAuth } from '../auth/useAuth'
import { registrarEvento } from './analyticsApi.mock'

export const USUARIO_ANONIMO = 'anonimo'

export function useAnalytics() {
	const { usuario } = useAuth()
	const usuarioId = usuario?.id ?? USUARIO_ANONIMO

	const registrar = useCallback(
		(tipo: TipoEvento, detalle: EventoAnalytics['detalle']) => {
			registrarEvento(usuarioId, tipo, detalle)
		},
		[usuarioId],
	)

	return { registrar, usuarioId }
}