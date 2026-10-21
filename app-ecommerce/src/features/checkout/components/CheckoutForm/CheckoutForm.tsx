import { useState } from 'react'
import type { ChangeEvent, FormEvent, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../../../components/Button/Button'
import { PROVINCES, validateCheckout } from '../../../../services/validation'
import type { CheckoutValues } from '../../../../services/validation'
import styles from './CheckoutForm.module.css'

type CheckoutFormProps = {
	values: CheckoutValues
	onChange: (values: CheckoutValues) => void
	/** Se llama solo cuando todos los campos son válidos. */
	onContinue: () => void
}

type FieldProps = {
	name: keyof CheckoutValues
	label: string
	error?: string
	optional?: boolean
	full?: boolean
	children: ReactNode
}

function Field({ name, label, error, optional, full, children }: FieldProps) {
	return (
		<div className={`${styles.field} ${full ? styles.full : ''}`}>
			<label className={styles.label} htmlFor={`checkout-${name}`}>
				{label}
				{optional && <span className={styles.optional}> (opcional)</span>}
			</label>
			{children}
			{error && (
				<p className={styles.error} id={`checkout-${name}-error`} role="alert">
					{error}
				</p>
			)}
		</div>
	)
}

const FIELD_ORDER: (keyof CheckoutValues)[] = [
	'fullName',
	'email',
	'phone',
	'province',
	'canton',
	'address',
	'notes',
]

/** Formulario de comprador y entrega, con validación al salir del campo y al continuar. */
export function CheckoutForm({ values, onChange, onContinue }: CheckoutFormProps) {
	const [touched, setTouched] = useState<Partial<Record<keyof CheckoutValues, boolean>>>({})
	const [submitted, setSubmitted] = useState(false)

	const errors = validateCheckout(values)

	const visibleError = (name: keyof CheckoutValues) =>
		touched[name] || submitted ? errors[name] : undefined

	const handleChange =
		(name: keyof CheckoutValues) =>
			(e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
				onChange({ ...values, [name]: e.target.value })
			}

	const handleBlur = (name: keyof CheckoutValues) => () => {
		setTouched((prev) => ({ ...prev, [name]: true }))
	}

	const inputProps = (name: keyof CheckoutValues) => {
		const error = visibleError(name)

		return {
			id: `checkout-${name}`,
			value: values[name],
			onChange: handleChange(name),
			onBlur: handleBlur(name),
			className: `${styles.input} ${error ? styles.inputError : ''}`,
			'aria-invalid': error ? true : undefined,
			'aria-describedby': error ? `checkout-${name}-error` : undefined,
		}
	}

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setSubmitted(true)

		const firstInvalid = FIELD_ORDER.find((name) => errors[name])

		if (firstInvalid) {
			document.getElementById(`checkout-${firstInvalid}`)?.focus()
			return
		}

		onContinue()
	}

	return (
		<form className={styles.form} onSubmit={handleSubmit} noValidate>
			<section className={styles.card} aria-labelledby="checkout-buyer-title">
				<h2 className={styles.cardTitle} id="checkout-buyer-title">
					Datos del comprador
				</h2>

				<div className={styles.fields}>
					<Field name="fullName" label="Nombre completo" error={visibleError('fullName')} full>
						<input {...inputProps('fullName')} type="text" autoComplete="name" maxLength={80} />
					</Field>

					<Field name="email" label="Correo electrónico" error={visibleError('email')}>
						<input {...inputProps('email')} type="email" autoComplete="email" maxLength={100} />
					</Field>

					<Field name="phone" label="Teléfono" error={visibleError('phone')}>
						<input
							{...inputProps('phone')}
							type="tel"
							inputMode="tel"
							autoComplete="tel"
							placeholder="8888 8888"
							maxLength={16}
						/>
					</Field>
				</div>
			</section>

			<section className={styles.card} aria-labelledby="checkout-delivery-title">
				<h2 className={styles.cardTitle} id="checkout-delivery-title">
					Dirección de entrega
				</h2>

				<div className={styles.fields}>
					<Field name="province" label="Provincia" error={visibleError('province')}>
						<select {...inputProps('province')} autoComplete="address-level1">
							<option value="">Seleccione una provincia</option>
							{PROVINCES.map((province) => (
								<option key={province} value={province}>
									{province}
								</option>
							))}
						</select>
					</Field>

					<Field name="canton" label="Cantón" error={visibleError('canton')}>
						<input {...inputProps('canton')} type="text" autoComplete="address-level2" maxLength={60} />
					</Field>

					<Field name="address" label="Dirección exacta" error={visibleError('address')} full>
						<input
							{...inputProps('address')}
							type="text"
							autoComplete="street-address"
							maxLength={160}
						/>
					</Field>

					<Field
						name="notes"
						label="Información adicional"
						error={visibleError('notes')}
						optional
						full
					>
						<textarea
							{...inputProps('notes')}
							rows={3}
							placeholder="Indicaciones para la entrega, color de la casa, referencias…"
						/>
					</Field>
				</div>
			</section>

			<div className={styles.actions}>
				<Link className={styles.backLink} to="/carrito">
					Volver al carrito
				</Link>
				<Button label="Continuar" variant="primary" size="lg" />
			</div>
		</form>
	)
}