# Servicio de pago Sandbox

MarketByte representa un proveedor externo de pagos mediante un servicio simulado. Permite demostrar pagos aprobados, rechazados y errores sin realizar cobros ni solicitar tarjetas, códigos de seguridad o información financiera real. Este documento describe el funcionamiento implementado; los casos y evidencias de validación están en la [guía de pruebas](../tests/README.md).

## Responsabilidades y archivos

| Módulo | Responsabilidad |
| --- | --- |
| [Contrato de pago](../src/types/payment.ts) | Define `PaymentRequest`, `PaymentResult` y los códigos de resultado. |
| [Servicio Sandbox](../src/services/paymentSandbox.ts) | Valida solicitudes, simula el proveedor y limita el tiempo de espera. |
| [Revisión de compra](../src/features/checkout/components/OrderReview/OrderReview.tsx) | Permite seleccionar el escenario antes de confirmar. |
| [Checkout](../src/pages/CheckoutPage/CheckoutPage.tsx) | Envía la solicitud, interpreta las excepciones y presenta el resultado. |
| [Servicio de órdenes](../src/services/orders.ts) | Crea, persiste y actualiza la orden según el resultado recibido. |

El Sandbox recibe y devuelve datos: no modifica órdenes, no vacía el carrito y no recalcula subtotal, IVA, envío ni total. La solicitud usa el total de la orden, creado a partir de los montos del carrito. La persistencia de órdenes corresponde al servicio de órdenes; la de carrito, a su módulo existente.

## Solicitud y resultado

La función pública tiene la forma `procesarPago(request, scenario, options?)` y devuelve `Promise<PaymentResult>`.

| Campo de `PaymentRequest` | Tipo | Validación |
| --- | --- | --- |
| `orderId` | `string` | Número de orden no vacío ni compuesto solo por espacios. |
| `amount` | `number` | Monto finito mayor o igual a cero; admite una compra gratuita. |
| `currency` | `'CRC'` | Solo colones costarricenses. |

Ejemplo de solicitud, usando el total de los datos ficticios de prueba:

```json
{
  "orderId": "MB-20261017-0001",
  "amount": 5825,
  "currency": "CRC"
}
```

| Campo de `PaymentResult` | Contenido |
| --- | --- |
| `code` | `PAYMENT_APPROVED`, `PAYMENT_DECLINED` o `PAYMENT_ERROR`. |
| `orderId` | Número de la orden asociada al resultado. |
| `message` | Mensaje comprensible para el usuario, tratado de usted. |
| `transactionId` | Opcional; el simulador lo incluye solo al aprobar. Usa el prefijo `SBX-` y la marca de tiempo del procesamiento. |

En aprobado y rechazado, la promesa se resuelve con un resultado. En error del servicio o timeout, la promesa se rechaza con `ErrorServicioPago`; checkout construye el resultado `PAYMENT_ERROR`. Por tanto, ese código no se obtiene como una respuesta resuelta del simulador.

Una solicitud, escenario o tiempo límite inválido también rechaza la promesa, antes de llamar al proveedor. Checkout mantiene un mensaje genérico para excepciones que no sean `ErrorServicioPago`.

## Selección y reproducción de escenarios

El usuario completa sus datos, avanza al resumen y utiliza el selector **Seleccione una tarjeta**. Cada marca representa un escenario fijo del Sandbox; su código se envía como segundo argumento de `procesarPago`. No se solicitan datos reales de tarjeta ni números especiales.

| Selector | Argumento `scenario` | Comportamiento del servicio |
| --- | --- | --- |
| Tarjeta Visa | `PAYMENT_APPROVED` | Resuelve con aprobación, mensaje y `transactionId`. |
| Tarjeta American Express | `PAYMENT_DECLINED` | Resuelve con rechazo y mensaje, sin `transactionId`. |
| Tarjeta Mastercard | `PAYMENT_ERROR` | El simulador lanza una excepción que el servicio convierte en un error apto para el usuario. |

Los tres escenarios predeterminados esperan **2 segundos**. El resultado es determinista según la selección; no se elige aleatoriamente. Un escenario desconocido se rechaza y no se interpreta como aprobación.

La interfaz muestra el estado de procesamiento y deshabilita la confirmación durante la espera. El control de envío duplicado está en checkout.

## Tiempo límite y configuración del proveedor

El límite predeterminado es **5 segundos**, independiente del retardo simulado de 2 segundos. `procesarPago` compite la respuesta del proveedor contra un temporizador mediante `Promise.race` y elimina el temporizador de límite en `finally`, tanto al resolver como al rechazar.

El tercer argumento es opcional y se utiliza para configurar o probar la integración. Checkout lo omite y conserva los valores predeterminados.

| Opción | Valor predeterminado | Uso |
| --- | --- | --- |
| `tiempoLimiteMs` | `5000` | Número finito mayor que cero, expresado en milisegundos. |
| `proveedor` | Simulador interno | Función que recibe la solicitud y el escenario, y devuelve `Promise<PaymentResult>`. |

La solicitud se copia antes de ejecutar el proveedor para conservar sus datos aunque el objeto del llamador cambie durante la espera. Un proveedor que lanza una excepción síncrona también se maneja como una falla asíncrona.

Ejemplo para reproducir un proveedor sin respuesta en una prueba:

```ts
await procesarPago(
    { orderId: 'MB-20261017-0001', amount: 5825, currency: 'CRC' },
    'PAYMENT_APPROVED',
    { proveedor: () => new Promise(() => {}) },
)
```

Esta llamada rechaza la promesa tras el límite predeterminado; quien la ejecuta debe capturar el error. No hay un cuarto escenario de timeout en la interfaz: esta condición se reproduce con el proveedor controlado de las pruebas.

El timeout termina la espera del llamador, pero no cancela la ejecución del proveedor. Una respuesta tardía no cambia el resultado ya entregado ni actualiza órdenes, porque el proveedor no tiene esa responsabilidad. Tampoco se realiza un reintento automático.

## Conexión con checkout y actualización de la orden

1. Checkout crea una orden pendiente, o reutiliza la existente cuando el usuario reintenta.
2. Envía `{ orderId: current.orderNumber, amount: current.total, currency: 'CRC' }` y el escenario seleccionado al Sandbox.
3. Si el servicio falla, checkout construye `PAYMENT_ERROR` con el mismo número de orden. Un timeout muestra «El servicio de pago tardó demasiado en responder. Intente de nuevo.»; otras fallas del proveedor muestran un mensaje genérico de indisponibilidad.
4. Checkout entrega el resultado a `aplicarResultado`, del servicio de órdenes, para actualizar y persistir sus estados.
5. Se presenta la pantalla de resultado y se restablecen los controles de procesamiento. El carrito se vacía únicamente si el pago fue aprobado.

| Resultado | Estado de orden | Estado de pago | Carrito y continuación |
| --- | --- | --- | --- |
| `PAYMENT_APPROVED` | `CONFIRMED` | `APPROVED` | Se vacía; se muestra la confirmación y el número de orden. |
| `PAYMENT_DECLINED` | `PENDING` | `DECLINED` | Se conserva; el usuario puede reintentar. |
| `PAYMENT_ERROR` | `PENDING` | `ERROR` | Se conserva; el usuario puede reintentar. |

El estado de orden y el de pago son conceptos separados. Aunque el modelo admite `FAILED`, las fallas recuperables de pago se mantienen como `PENDING` para permitir el reintento. El servicio de órdenes no modifica una orden que ya está confirmada.

## Validación y límites actuales

Desde `app-ecommerce/`, ejecutar:

```bash
pnpm run test:sandbox
```

La [guía de pruebas y evidencias](../tests/README.md) documenta los comandos por nivel, los tres resultados, timeout, respuestas tardías, prevención de duplicados y reintentos. Distingue la suite de servicio, los componentes renderizados en jsdom y las comprobaciones adicionales en Chromium.

Existe una incidencia de interfaz registrada como **SBX-10**: tras recargar el resultado de un pago rechazado y pulsar Intentar de nuevo, la revisión muestra datos del comprador vacíos, aunque permanecen en la orden guardada. Se documenta y conserva como fallo esperado; no es un caso de aceptación aprobado.

La guía describe el código de esta rama. No acredita que esa versión esté desplegada en GitHub Pages ni reemplaza la documentación externa completa del proyecto.
