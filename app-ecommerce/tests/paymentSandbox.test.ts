import assert from 'node:assert/strict'
import { performance } from 'node:perf_hooks'
import test from 'node:test'
import { ErrorServicioPago, procesarPago } from '../src/services/paymentSandbox.ts'
import type { SandboxScenario } from '../src/services/paymentSandbox.ts'
import type { PaymentRequest, PaymentResult } from '../src/types/payment.ts'

const request: PaymentRequest = Object.freeze({
    orderId: 'MB-20261016-0001',
    amount: 5260,
    currency: 'CRC',
})

test('los tres escenarios esperan antes de devolver el resultado, sin modificar la solicitud', async () => {
    const started = performance.now()
    let settled = 0
    const scenarios: SandboxScenario[] = ['PAYMENT_APPROVED', 'PAYMENT_DECLINED', 'PAYMENT_ERROR']
    const attempts = scenarios.map((scenario) => procesarPago(request, scenario).finally(() => { settled++ }))
    const pending = Promise.allSettled(attempts)

    await Promise.resolve()
    assert.equal(settled, 0, 'El servicio debe permitir mostrar el estado de carga')

    const [approved, declined, failed] = await pending
    assert.ok(performance.now() - started >= 1900, 'Debe simular una espera de 2 segundos')

    assert.equal(approved.status, 'fulfilled')
    if (approved.status === 'fulfilled') {
        assert.equal(approved.value.code, 'PAYMENT_APPROVED')
        assert.equal(approved.value.orderId, request.orderId)
        assert.match(approved.value.transactionId ?? '', /^SBX-\d+$/)
        assert.ok(approved.value.message.length > 0)
    }

    assert.equal(declined.status, 'fulfilled')
    if (declined.status === 'fulfilled') {
        assert.equal(declined.value.code, 'PAYMENT_DECLINED')
        assert.equal(declined.value.orderId, request.orderId)
        assert.equal('transactionId' in declined.value, false)
    }

    assert.equal(failed.status, 'rejected')
    if (failed.status === 'rejected') {
        assert.ok(failed.reason instanceof ErrorServicioPago)
        assert.match(failed.reason.message, /no está disponible/)
    }
    assert.deepEqual(request, { orderId: 'MB-20261016-0001', amount: 5260, currency: 'CRC' })
})

const invalidRequests: [string, unknown][] = [
    ['solicitud ausente', null],
    ['orden vacía', { ...request, orderId: '   ' }],
    ['orden de tipo incorrecto', { ...request, orderId: 123 }],
    ['monto negativo', { ...request, amount: -1 }],
    ['monto no numérico', { ...request, amount: '5260' }],
    ['monto NaN', { ...request, amount: Number.NaN }],
    ['monto infinito', { ...request, amount: Number.POSITIVE_INFINITY }],
    ['moneda no soportada', { ...request, currency: 'USD' }],
]

for (const [label, invalid] of invalidRequests) {
    test(`rechaza ${label} sin aprobar el pago`, async () => {
        await assert.rejects(procesarPago(invalid as PaymentRequest, 'PAYMENT_APPROVED'), Error)
    })
}

test('un escenario desconocido no se convierte en un pago aprobado', async () => {
    await assert.rejects(procesarPago(request, 'UNKNOWN' as SandboxScenario), /escenario de pago válido/)
})

test('admite un monto cero y conserva la orden original durante la espera', async () => {
    const mutable: PaymentRequest = { ...request, amount: 0 }
    const pending = procesarPago(mutable, 'PAYMENT_APPROVED')
    mutable.orderId = 'OTRA-ORDEN'

    const result = await pending
    assert.equal(result.code, 'PAYMENT_APPROVED')
    assert.equal(result.orderId, request.orderId)
})

test('un proveedor que nunca responde supera el límite predeterminado de 5 segundos', async () => {
    const started = performance.now()

    await assert.rejects(
        procesarPago(request, 'PAYMENT_APPROVED', { proveedor: () => new Promise(() => {}) }),
        (error: unknown) => error instanceof ErrorServicioPago && /tardó demasiado/.test(error.message),
    )

    assert.ok(performance.now() - started >= 4900)
})

for (const asynchronous of [false, true]) {
    test(`normaliza una falla ${asynchronous ? 'asíncrona' : 'síncrona'} sin exponer detalles técnicos`, async () => {
        const technical = new Error('Internal provider stack / private diagnostic')
        const proveedor = () => {
            if (asynchronous) return Promise.reject(technical)
            throw technical
        }

        await assert.rejects(
            procesarPago(request, 'PAYMENT_ERROR', { proveedor }),
            (error: unknown) => {
                assert.ok(error instanceof ErrorServicioPago)
                assert.match(error.message, /no está disponible.*Intente de nuevo/)
                assert.equal(error.message.includes(technical.message), false)
                return true
            },
        )
    })
}

for (const tiempoLimiteMs of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
    test(`rechaza un tiempo límite inválido: ${tiempoLimiteMs}`, async () => {
        let called = false
        await assert.rejects(
            procesarPago(request, 'PAYMENT_APPROVED', {
                tiempoLimiteMs,
                proveedor: async () => {
                    called = true
                    return { code: 'PAYMENT_APPROVED', orderId: request.orderId, message: 'Aprobado' }
                },
            }),
            /tiempo límite/,
        )
        assert.equal(called, false)
    })
}

test('ignora una aprobación tardía después del timeout y permite reintentar la misma orden', async () => {
    let complete: (result: PaymentResult) => void = () => { throw new Error('Proveedor no iniciado') }
    const late = new Promise<PaymentResult>((resolve) => { complete = resolve })
    const approved: PaymentResult = {
        code: 'PAYMENT_APPROVED', orderId: request.orderId, message: 'Aprobado', transactionId: 'SBX-test',
    }
    let successes = 0
    let failures = 0
    const pending = procesarPago(request, 'PAYMENT_APPROVED', {
        tiempoLimiteMs: 10,
        proveedor: () => late,
    }).then(() => { successes++ }, () => { failures++ })

    await pending
    complete(approved)
    await Promise.resolve()
    assert.equal(successes, 0)
    assert.equal(failures, 1)

    const retried = await procesarPago(request, 'PAYMENT_APPROVED', {
        tiempoLimiteMs: 1000,
        proveedor: async () => approved,
    })
    assert.deepEqual(retried, approved)
})

test('una respuesta tardía rechazada no provoca un rechazo de promesa sin manejar', async () => {
    let fail: (error: Error) => void = () => { throw new Error('Proveedor no iniciado') }
    const late = new Promise<PaymentResult>((_, reject) => { fail = reject })

    await assert.rejects(
        procesarPago(request, 'PAYMENT_ERROR', { tiempoLimiteMs: 10, proveedor: () => late }),
        ErrorServicioPago,
    )
    fail(new Error('Late provider failure'))
    await new Promise<void>((resolve) => setTimeout(resolve, 0))
})
