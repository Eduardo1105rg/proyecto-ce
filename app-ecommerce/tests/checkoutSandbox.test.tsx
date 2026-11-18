import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { CarritoProvider } from '../src/context/CarritoProvider'
import { AuthProvider } from '../src/features/auth/AuthProvider'
import { RutaProtegida } from '../src/features/auth/components/RutaProtegida/RutaProtegida'
import { CartPage } from '../src/pages/CartPage/CartPage'
import { CheckoutPage } from '../src/pages/CheckoutPage/CheckoutPage'
import * as sandbox from '../src/services/paymentSandbox'
import { listarOrdenes } from '../src/services/orders'
import { CLAVE_CARRITO } from '../src/services/carritoStorage'
import type { PaymentResult } from '../src/types/payment'

const { search } = vi.hoisted(() => ({ search: vi.fn() }))

vi.mock('../src/services/Algolia', () => ({
    INDEX_MAIN: 'sandbox-tests',
    escapeFilterValue: (id: string) => id,
    searchClient: { search },
}))

const CLAVE_USUARIO = 'marketbyte_usuario'
const SUCURSAL = 'sj-escazu'
const CART = [
    { objectID: 'sandbox-a', branchId: SUCURSAL, cantidad: 2 },
    { objectID: 'sandbox-b', branchId: SUCURSAL, cantidad: 1 },
]
const PRODUCTS = [
    {
        objectID: 'sandbox-a', name: 'Producto de prueba A', price: 1000, image: '',
        facets: { free_shipping: false }, stock_by_branch: [{ branch_id: SUCURSAL, stock: 10 }],
    },
    {
        objectID: 'sandbox-b', name: 'Producto de prueba B', price: 500, image: '',
        facets: { free_shipping: false }, stock_by_branch: [{ branch_id: SUCURSAL, stock: 10 }],
    },
]
const BUYER = { fullName: 'Persona Prueba', email: 'sandbox@example.com', phone: '88888888' }

async function openCheckout(orderNumber?: string) {
    await act(async () => {
        render(
            <MemoryRouter initialEntries={[orderNumber ? `/checkout?orden=${orderNumber}` : '/checkout']}>
                <AuthProvider><CarritoProvider><CheckoutPage /></CarritoProvider></AuthProvider>
            </MemoryRouter>,
        )
    })
}

async function openCart() {
    await act(async () => {
        render(
            <MemoryRouter initialEntries={['/carrito']}>
                <AuthProvider><CarritoProvider><CartPage /></CarritoProvider></AuthProvider>
            </MemoryRouter>,
        )
    })
}

async function openReview() {
    await openCheckout()
    for (const [label, value] of [
        ['Nombre completo', BUYER.fullName], ['Correo electrónico', BUYER.email], ['Teléfono', BUYER.phone],
        ['Provincia', 'San José'], ['Cantón', 'Central'], ['Dirección exacta', 'Dirección ficticia de prueba'],
    ]) {
        fireEvent.change(screen.getByLabelText(label), { target: { value } })
    }
    fireEvent.click(screen.getByRole('checkbox', { name: /Acepto los términos/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(screen.getByRole('button', { name: 'Confirmar y pagar' })).toBeTruthy()
}

function confirm(label = 'Tarjeta Visa') {
    fireEvent.click(screen.getByRole('radio', { name: new RegExp(label) }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar y pagar' }))
}

async function advance(ms: number) {
    await act(async () => { await vi.advanceTimersByTimeAsync(ms) })
}

function persistedCart() {
    return JSON.parse(localStorage.getItem(CLAVE_CARRITO) ?? '{}').items
}

function expectOrder(status: string, paymentStatus: string) {
    const orders = listarOrdenes()
    expect(orders).toHaveLength(1)
    expect(orders[0]).toMatchObject({
        buyer: BUYER, status, paymentStatus, subtotal: 2500, tax: 325, shipping: 3000, total: 5825,
        items: [{ objectID: 'sandbox-a', quantity: 2 }, { objectID: 'sandbox-b', quantity: 1 }],
    })
    return orders[0]
}

beforeEach(() => {
    localStorage.clear()
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify({
        id: 'b2c-tests', nombre: 'Cliente Prueba', correo: 'b2c@example.com', rol: 'B2C',
    }))
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify({ version: 2, items: CART }))
    search.mockResolvedValue({ results: [{ hits: PRODUCTS }] })
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    vi.spyOn(console, 'log').mockImplementation(() => {})
})

afterEach(() => {
    cleanup()
    vi.clearAllTimers()
    vi.useRealTimers()
    vi.restoreAllMocks()
    localStorage.clear()
})

describe('Checkout y Sandbox con componentes reales', () => {
    for (const scenario of [
        { id: 'SBX-01', label: 'Tarjeta Visa', code: 'PAYMENT_APPROVED', title: '¡Gracias por su compra!', status: 'CONFIRMED', payment: 'APPROVED' },
        { id: 'SBX-02', label: 'Tarjeta American Express', code: 'PAYMENT_DECLINED', title: 'Su pago fue rechazado', status: 'FAILED', payment: 'DECLINED' },
        { id: 'SBX-03', label: 'Tarjeta Mastercard', code: 'PAYMENT_ERROR', title: 'No pudimos procesar su pago', status: 'FAILED', payment: 'ERROR' },
    ]) {
        it(`${scenario.id}: ${scenario.label}, montos y persistencia coherentes`, async () => {
            const payment = vi.spyOn(sandbox, 'procesarPago')
            await openReview()
            confirm(scenario.label)
            await advance(1999)
            expect(screen.getByRole('button', { name: 'Procesando pago…' })).toHaveProperty('disabled', true)
            expect(persistedCart()).toEqual(CART)
            expectOrder('PENDING', 'PENDING')
            await advance(1)
            expect(screen.getByRole('heading', { name: scenario.title })).toBeTruthy()
            const order = expectOrder(scenario.status, scenario.payment)
            expect(payment).toHaveBeenCalledExactlyOnceWith({ orderId: order.orderNumber, amount: 5825, currency: 'CRC' }, scenario.code)
            expect(persistedCart()).toEqual(scenario.payment === 'APPROVED' ? [] : CART)
            expect(screen.queryByRole('button', { name: 'Procesando pago…' })).toBeNull()
            if (scenario.payment !== 'APPROVED') {
                expect(screen.getByRole('button', { name: 'Intentar de nuevo' })).toHaveProperty('disabled', false)
            }
        })
    }

    it('SBX-04: los clics duplicados generan una sola solicitud y una sola orden', async () => {
        const payment = vi.spyOn(sandbox, 'procesarPago')
        await openReview()
        const button = screen.getByRole('button', { name: 'Confirmar y pagar' })
        fireEvent.click(button)
        fireEvent.click(button)
        await advance(2000)
        expect(payment).toHaveBeenCalledTimes(1)
        expectOrder('CONFIRMED', 'APPROVED')
    })

    for (const [id, label, status] of [
        ['SBX-05', 'Tarjeta American Express', 'DECLINED'], ['SBX-06', 'Tarjeta Mastercard', 'ERROR'],
    ]) {
        it(`${id}: permite aprobar la misma orden después de ${label}`, async () => {
            await openReview()
            confirm(label)
            await advance(2000)
            const original = expectOrder('FAILED', status)
            fireEvent.click(screen.getByRole('button', { name: 'Intentar de nuevo' }))
            expect(expectOrder('PENDING', 'PENDING').orderNumber).toBe(original.orderNumber)
            expect(screen.getByText(BUYER.email)).toBeTruthy()
            confirm()
            await advance(2000)
            expect(expectOrder('CONFIRMED', 'APPROVED').orderNumber).toBe(original.orderNumber)
            expect(persistedCart()).toEqual([])
        })
    }

    it('SBX-07: un proveedor sin respuesta termina a los 5 segundos y conserva el carrito', async () => {
        const original = sandbox.procesarPago
        vi.spyOn(sandbox, 'procesarPago').mockImplementation((request, scenario) => original(request, scenario, {
            proveedor: () => new Promise(() => {}),
        }))
        await openReview()
        confirm()
        await advance(4999)
        expect(screen.getByRole('button', { name: 'Procesando pago…' })).toHaveProperty('disabled', true)
        await advance(1)
        expect(screen.getByText(/tardó demasiado en responder/)).toBeTruthy()
        expectOrder('FAILED', 'ERROR')
        expect(persistedCart()).toEqual(CART)
        expect(screen.getByRole('button', { name: 'Intentar de nuevo' })).toHaveProperty('disabled', false)
    })

    it('SBX-08: una aprobación tardía no confirma la orden; un reintento explícito sí', async () => {
        let resolveLate: (result: PaymentResult) => void = () => { throw new Error('Proveedor no iniciado') }
        const late = new Promise<PaymentResult>((resolve) => { resolveLate = resolve })
        const original = sandbox.procesarPago
        const payment = vi.spyOn(sandbox, 'procesarPago').mockImplementation((request, scenario) => original(request, scenario, { proveedor: () => late }))
        await openReview()
        confirm()
        await advance(5000)
        const order = expectOrder('FAILED', 'ERROR')
        await act(async () => {
            resolveLate({ code: 'PAYMENT_APPROVED', orderId: order.orderNumber, message: 'Aprobado', transactionId: 'SBX-late' })
        })
        expect(screen.getByText(/tardó demasiado en responder/)).toBeTruthy()
        expectOrder('FAILED', 'ERROR')
        expect(persistedCart()).toEqual(CART)
        payment.mockRestore()
        fireEvent.click(screen.getByRole('button', { name: 'Intentar de nuevo' }))
        expect(expectOrder('PENDING', 'PENDING').orderNumber).toBe(order.orderNumber)
        confirm()
        await advance(2000)
        expect(expectOrder('CONFIRMED', 'APPROVED').orderNumber).toBe(order.orderNumber)
        expect(persistedCart()).toEqual([])
    })

    it('SBX-09: recupera la confirmación persistida al recargar con el carrito vacío', async () => {
        await openReview()
        confirm()
        await advance(2000)
        const order = expectOrder('CONFIRMED', 'APPROVED')
        cleanup()
        await openCheckout(order.orderNumber)
        expect(screen.getByRole('heading', { name: '¡Gracias por su compra!' })).toBeTruthy()
        expect(screen.getByText(order.orderNumber)).toBeTruthy()
        expect(persistedCart()).toEqual([])
    })

    it.fails('SBX-10: recupera los datos del comprador al reintentar después de recargar un pago rechazado', async () => {
        await openReview()
        confirm('Tarjeta American Express')
        await advance(2000)
        const order = expectOrder('FAILED', 'DECLINED')
        cleanup()
        await openCheckout(order.orderNumber)
        fireEvent.click(screen.getByRole('button', { name: 'Intentar de nuevo' }))
        expect(screen.getByText(BUYER.email)).toBeTruthy()
    })
})

describe('Compra sin sesión', () => {
    it('muestra el carrito con precios B2C y permite avanzar al pago', async () => {
        localStorage.removeItem(CLAVE_USUARIO)
        await openCart()

        expect(screen.getByText('Producto de prueba A')).toBeTruthy()
        expect(screen.getAllByText(/₡1\s*000/).length).toBeGreaterThan(0)
        expect(screen.queryByText(/Precio B2B/)).toBeNull()
        expect(screen.getByRole('button', { name: 'Proceder al pago' })).toHaveProperty('disabled', false)
    })

    it('guarda la orden como anónima con condición estándar', async () => {
        localStorage.removeItem(CLAVE_USUARIO)
        await openReview()
        confirm()
        await advance(2000)

        const order = expectOrder('CONFIRMED', 'APPROVED')
        expect(order).toMatchObject({
            usuarioId: 'anonimo',
            condicionComercial: { tipo: 'ESTANDAR', minimo: 0 },
        })
        expect(order.rol).toBeUndefined()
        expect(persistedCart()).toEqual([])
    })

    it('recupera la confirmación por URL sin iniciar sesión', async () => {
        localStorage.removeItem(CLAVE_USUARIO)
        await openReview()
        confirm()
        await advance(2000)
        const order = expectOrder('CONFIRMED', 'APPROVED')
        cleanup()

        await openCheckout(order.orderNumber)

        expect(screen.getByRole('heading', { name: '¡Gracias por su compra!' })).toBeTruthy()
        expect(screen.getByText(order.orderNumber)).toBeTruthy()
    })

    it('permite las rutas de compra a invitados pero no a ADMIN', () => {
        localStorage.removeItem(CLAVE_USUARIO)
        render(
            <MemoryRouter>
                <AuthProvider>
                    <RutaProtegida roles={['B2C', 'B2B']} permitirInvitado>
                        <p>Contenido de compra</p>
                    </RutaProtegida>
                </AuthProvider>
            </MemoryRouter>,
        )
        expect(screen.getByText('Contenido de compra')).toBeTruthy()
        cleanup()

        localStorage.setItem(CLAVE_USUARIO, JSON.stringify({
            id: 'admin-tests', nombre: 'Administrador', correo: 'admin@example.com', rol: 'ADMIN',
        }))
        render(
            <MemoryRouter>
                <AuthProvider>
                    <RutaProtegida roles={['B2C', 'B2B']} permitirInvitado>
                        <p>Contenido de compra</p>
                    </RutaProtegida>
                </AuthProvider>
            </MemoryRouter>,
        )
        expect(screen.getByText('Acceso denegado')).toBeTruthy()
    })

    it('sigue pidiendo sesión cuando la ruta no permite invitados', () => {
        localStorage.removeItem(CLAVE_USUARIO)
        render(
            <MemoryRouter>
                <AuthProvider>
                    <RutaProtegida roles={['B2C', 'B2B']}>
                        <p>Contenido privado</p>
                    </RutaProtegida>
                </AuthProvider>
            </MemoryRouter>,
        )

        expect(screen.getByText('Inicie sesión para continuar')).toBeTruthy()
        expect(screen.queryByText('Contenido privado')).toBeNull()
    })

    it('mantiene el bloqueo del mínimo B2B para usuarios autenticados', async () => {
        localStorage.removeItem(CLAVE_USUARIO)
        localStorage.setItem(CLAVE_USUARIO, JSON.stringify({
            id: 'b2b-tests',
            nombre: 'Cliente B2B',
            correo: 'b2b@example.com',
            rol: 'B2B',
            empresa: { nombre: 'Empresa Prueba', cedulaJuridica: '123456789' },
        }))
        localStorage.setItem(CLAVE_CARRITO, JSON.stringify({
            version: 2,
            items: [{ objectID: 'b2b-minimo', branchId: SUCURSAL, cantidad: 9 }],
        }))
        search.mockResolvedValue({
            results: [{
                hits: [{
                    objectID: 'b2b-minimo',
                    name: 'Producto B2B',
                    price: 1000,
                    image: '',
                    facets: { free_shipping: false },
                    tiered_b2b_pricing: [{ min_qty: 12, unit_price: 800 }],
                    stock_by_branch: [{ branch_id: SUCURSAL, stock: 50 }],
                }],
            }],
        })

        await act(async () => {
            render(
                <MemoryRouter initialEntries={['/checkout']}>
                    <AuthProvider>
                        <CarritoProvider>
                            <CheckoutPage />
                        </CarritoProvider>
                    </AuthProvider>
                </MemoryRouter>,
            )
        })

        expect(screen.getByText(/Complete el mínimo B2B de cada producto para continuar/)).toBeTruthy()
        expect(listarOrdenes()).toHaveLength(0)
    })
})
