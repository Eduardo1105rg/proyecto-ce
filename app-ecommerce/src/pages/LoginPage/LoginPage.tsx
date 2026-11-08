import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button/Button'
import { useAuth } from '../../features/auth/useAuth'
import { listarUsuarios } from '../../features/auth/authApi'
import { ETIQUETA_ROL } from '../../features/auth/rolLabels'
import type { Usuario } from '../../types/usuario'
import styles from './LoginPage.module.css'

type ErroresForm = { correo?: string; contrasena?: string }

function validarFormulario(identificador: string, contrasena: string): ErroresForm {
	const errores: ErroresForm = {}
	if (!identificador.trim()) {
		errores.correo = 'Ingrese su usuario o correo electrónico.'
	}
	if (!contrasena) {
		errores.contrasena = 'Ingrese su contraseña.'
	}
	return errores
}

export function LoginPage() {
	const { usuario, iniciarSesion, iniciarSesionConCredenciales, cerrarSesion } = useAuth()
	const navigate = useNavigate()
	const [usuarios, setUsuarios] = useState<Usuario[]>([])
	const [correo, setCorreo] = useState('')
	const [contrasena, setContrasena] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [errores, setErrores] = useState<ErroresForm>({})
	const [enviando, setEnviando] = useState(false)

	useEffect(() => {
		let activo = true
		listarUsuarios()
			.then((lista) => {
				if (activo) setUsuarios(lista)
			})
			.catch(() => {
				if (activo) {
					setError('No se pudieron cargar los usuarios disponibles. Intente recargar la página.')
				}
			})
		return () => {
			activo = false
		}
	}, [])

	const terminar = (mensaje: string | null) => {
		setEnviando(false)
		if (mensaje) {
			setError(mensaje)
			return
		}
		setError(null)
		navigate('/catalogo')
	}

	const handleIngresar = async () => {
		const encontrados = validarFormulario(correo, contrasena)
		setErrores(encontrados)
		if (Object.keys(encontrados).length > 0) {
			setError(null)
			return
		}
		setEnviando(true)
		terminar(await iniciarSesionConCredenciales(correo, contrasena))
	}

	const handleInicioRapido = async (id: string) => {
		setErrores({})
		setEnviando(true)
		terminar(await iniciarSesion(id))
	}

	return (
		<main className={styles.page}>
			<header className={styles.header}>
				<h1 className={styles.title}>{usuario ? 'Su cuenta' : 'Iniciar sesión'}</h1>
				<p className={styles.subtitle}>
					Ingrese con su usuario o correo y contraseña. La tienda se adapta al rol del usuario.
				</p>
			</header>

			{usuario && (
				<section className={styles.session} aria-label="Sesión activa">
					<div>
						<p className={styles.sessionLabel}>Sesión activa</p>
						<p className={styles.sessionName}>{usuario.nombre}</p>
						<p className={styles.sessionMeta}>
							{ETIQUETA_ROL[usuario.rol]}
							{usuario.empresa ? ` · ${usuario.empresa.nombre}` : ''}
						</p>
					</div>
					<div className={styles.sessionActions}>
						<Button label="Ver mi actividad" variant="soft" onClick={() => navigate('/analytics')} />
						<Button label="Cerrar sesión" onClick={cerrarSesion} />
					</div>
				</section>
			)}

			<div className={styles.layout}>
				<section className={styles.formCard} aria-labelledby="titulo-form">
					<h2 id="titulo-form" className={styles.cardTitle}>
						Acceso con credenciales
					</h2>

					{error && (
						<p role="alert" className={styles.error}>
							{error}
						</p>
					)}

					<form className={styles.form} onSubmit={(e) => e.preventDefault()} noValidate>
						<div className={styles.field}>
							<label htmlFor="login-correo" className={styles.label}>
								Usuario o correo
							</label>
							<input
								id="login-correo"
								type="text"
								className={`${styles.input} ${errores.correo ? styles.inputInvalid : ''}`}
								value={correo}
								onChange={(e) => setCorreo(e.target.value)}
								autoComplete="username"
								placeholder="usuario o usuario@correo.com"
								aria-invalid={errores.correo ? true : undefined}
								aria-describedby={errores.correo ? 'login-correo-error' : undefined}
							/>
							{errores.correo && (
								<p id="login-correo-error" role="alert" className={styles.fieldError}>
									{errores.correo}
								</p>
							)}
						</div>

						<div className={styles.field}>
							<label htmlFor="login-contrasena" className={styles.label}>
								Contraseña
							</label>
							<input
								id="login-contrasena"
								type="password"
								className={`${styles.input} ${errores.contrasena ? styles.inputInvalid : ''}`}
								value={contrasena}
								onChange={(e) => setContrasena(e.target.value)}
								autoComplete="current-password"
								placeholder="Su contraseña"
								aria-invalid={errores.contrasena ? true : undefined}
								aria-describedby={errores.contrasena ? 'login-contrasena-error' : undefined}
							/>
							{errores.contrasena && (
								<p id="login-contrasena-error" role="alert" className={styles.fieldError}>
									{errores.contrasena}
								</p>
							)}
						</div>

						<Button
							label={enviando ? 'Ingresando...' : 'Ingresar'}
							onClick={handleIngresar}
							disabled={enviando}
							fullWidth
						/>
					</form>
				</section>

				<aside className={styles.quick} aria-labelledby="titulo-rapido">
					<h2 id="titulo-rapido" className={styles.cardTitle}>
						Inicio rápido
					</h2>
					<p className={styles.quickHint}>Usuarios de prueba, sin escribir contraseña.</p>

					<ul className={styles.quickList}>
						{usuarios.map((u) => {
							const activo = usuario?.id === u.id
							return (
								<li key={u.id}>
									<button
										type="button"
										className={`${styles.quickCard} ${activo ? styles.quickCardActive : ''}`}
										onClick={() => handleInicioRapido(u.id)}
										disabled={enviando || activo}
									>
										<span className={`${styles.pill} ${styles[`pill${u.rol}`]}`}>
											{ETIQUETA_ROL[u.rol]}
										</span>
										<span className={styles.quickName}>{u.nombre}</span>
										<span className={styles.quickInfo}>
											{u.empresa ? u.empresa.nombre : u.correo}
										</span>
									</button>
								</li>
							)
						})}
					</ul>
				</aside>
			</div>
		</main>
	)
}