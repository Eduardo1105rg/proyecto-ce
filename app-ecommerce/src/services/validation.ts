import type { BuyerInfo, DeliveryInfo } from '../../types/order'

export type CheckoutValues = {
    fullName: string
    email: string
    phone: string
    province: string
    canton: string
    address: string
    notes: string
}

export type CheckoutErrors = Partial<Record<keyof CheckoutValues, string>>

export const PROVINCES = [
    'San José',
    'Alajuela',
    'Cartago',
    'Heredia',
    'Guanacaste',
    'Puntarenas',
    'Limón',
]

export const EMPTY_VALUES: CheckoutValues = {
    fullName: '',
    email: '',
    phone: '',
    province: '',
    canton: '',
    address: '',
    notes: '',
}

const NAME_REGEX = /^[\p{L}][\p{L}' -]*$/u
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Deja solo los dígitos y quita el código de país 506 si viene incluido. */
export function normalizePhone(value: string): string {
    const digits = value.replace(/\D/g, '')
    return digits.length === 11 && digits.startsWith('506') ? digits.slice(3) : digits
}

export function validateCheckout(values: CheckoutValues): CheckoutErrors {
    const errors: CheckoutErrors = {}
    const name = values.fullName.trim()

    if (!name) {
        errors.fullName = 'Ingrese su nombre completo.'
    } else if (!NAME_REGEX.test(name) || name.split(/\s+/).length < 2) {
        errors.fullName = 'Ingrese su nombre y al menos un apellido, solo con letras.'
    }

    if (!values.email.trim()) {
        errors.email = 'Ingrese su correo electrónico.'
    } else if (!EMAIL_REGEX.test(values.email.trim())) {
        errors.email = 'Ingrese un correo válido, por ejemplo nombre@correo.com.'
    }

    if (!values.phone.trim()) {
        errors.phone = 'Ingrese su número de teléfono.'
    } else if (normalizePhone(values.phone).length !== 8) {
        errors.phone = 'Ingrese un teléfono de 8 dígitos.'
    }

    if (!values.province) errors.province = 'Seleccione una provincia.'

    if (!values.canton.trim()) {
        errors.canton = 'Ingrese su cantón.'
    } else if (values.canton.trim().length < 3) {
        errors.canton = 'El cantón debe tener al menos 3 caracteres.'
    }

    if (!values.address.trim()) {
        errors.address = 'Ingrese su dirección de entrega.'
    } else if (values.address.trim().length < 10) {
        errors.address = 'Indique una dirección más detallada (mínimo 10 caracteres).'
    }

    if (values.notes.length > 200) {
        errors.notes = 'La información adicional no puede superar los 200 caracteres.'
    }

    return errors
}

export function toBuyer(values: CheckoutValues): BuyerInfo {
    return {
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        phone: normalizePhone(values.phone),
    }
}

export function toDelivery(values: CheckoutValues): DeliveryInfo {
    const notes = values.notes.trim()

    return {
        province: values.province,
        canton: values.canton.trim(),
        address: values.address.trim(),
        ...(notes ? { notes } : {}),
    }
}