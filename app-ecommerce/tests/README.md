# Casos de prueba del Sandbox — Proyecto II

Esta sección cubre la validación de pagos asignada a Compañero B: contrato del Sandbox, resultados, errores y su integración con checkout, carrito y órdenes. Corresponde a los requisitos 4–9 de Proyecto II. No cambia el código de producción.

## Ejecución

Desde `app-ecommerce/`:

```bash
pnpm install --frozen-lockfile
pnpm run test:sandbox
```

Para ejecutar cada nivel por separado:

```bash
pnpm run test:sandbox:unit
pnpm run test:sandbox:integration
```

La ejecución se validó con Node 26.11.1 y pnpm 12.13.0. Los requisitos de versión de Vitest y jsdom se encuentran en sus paquetes instalados.

- `paymentSandbox.test.ts`: 20 casos de servicio, con los retardos reales de 2 segundos y el timeout predeterminado de 5 segundos.
- `checkoutSandbox.test.tsx`: componentes reales de React, `CarritoProvider`, servicio de pagos y persistencia de órdenes en localStorage. Vitest, React Testing Library y jsdom ejecutan las interacciones sobre el DOM renderizado.
- Algolia usa una respuesta fija en las pruebas automatizadas. No requieren credenciales, conexión al índice ni tarjetas. Las pruebas de timeout inyectan un proveedor que no responde.
- El reloj simulado de las pruebas de checkout avanza de forma controlada; no cambia los retardos de la aplicación. Cada caso elimina su almacenamiento, componentes, temporizadores y sustituciones al terminar.

## Datos de prueba automatizados

Comprador ficticio: Persona Prueba, `sandbox@example.com`, teléfono `88888888`. Entrega: San José, Central, Dirección ficticia de prueba.

| Producto | Precio unitario | Cantidad | Subtotal |
| --- | ---: | ---: | ---: |
| Producto de prueba A | ₡1 000 | 2 | ₡2 000 |
| Producto de prueba B | ₡500 | 1 | ₡500 |

El carrito calcula subtotal ₡2 500, IVA del 13% ₡325, envío ₡3 000 y total ₡5 825. Se comprueba que el Sandbox recibe el mismo total en CRC y el número de orden generado.

## Casos de aceptación

Salvo que se indique otra cosa, cada caso comienza con un carrito nuevo, se abre `/checkout`, se completan los datos válidos y se pulsa Continuar.

El selector «Seleccione una tarjeta» utiliza marcas de tarjeta para elegir el resultado simulado del Sandbox: Tarjeta Visa aprueba, Tarjeta American Express rechaza y Tarjeta Mastercard simula un error del servicio. No se solicitan datos de tarjeta ni se realizan cobros reales.

| Caso | Acción | Resultado esperado | Evidencia y estado |
| --- | --- | --- | --- |
| SBX-01 | Seleccionar Tarjeta Visa y confirmar. | Carga durante 2 segundos, solicitud con ID/total/CRC correctos, orden CONFIRMED / APPROVED, confirmación visible y carrito vacío. | Automatizado aprobado; [Chromium](evidence/approved.png). |
| SBX-02 | Seleccionar Tarjeta American Express y confirmar. | Orden PENDING / DECLINED, mensaje de rechazo, carrito intacto y reintento habilitado. | Automatizado aprobado; [Chromium](evidence/declined.png). |
| SBX-03 | Seleccionar Tarjeta Mastercard y confirmar. | Orden PENDING / ERROR, mensaje comprensible, carga finalizada y carrito intacto. | Automatizado aprobado; [Chromium](evidence/error.png). |
| SBX-04 | Pulsar dos veces Confirmar y pagar antes del resultado. | Una sola solicitud al Sandbox y una sola orden. | Automatizado aprobado. |
| SBX-05 | Tras un rechazo, pulsar Intentar de nuevo y elegir Tarjeta Visa. | Mismo número de orden, datos visibles, estado CONFIRMED / APPROVED y carrito vacío. | Automatizado y Chromium aprobados. |
| SBX-06 | Tras un error, pulsar Intentar de nuevo y elegir Tarjeta Visa. | Mismo número de orden, carga reiniciada correctamente y confirmación sin duplicar órdenes. | Automatizado y Chromium aprobados. |
| SBX-07 | Inyectar un proveedor sin respuesta y confirmar. | Sigue cargando a los 4 999 ms; a los 5 000 ms muestra timeout, orden PENDING / ERROR, carrito intacto y reintento habilitado. | Automatizado aprobado. |
| SBX-08 | Resolver una aprobación después del timeout; luego reintentar explícitamente. | La respuesta tardía no confirma ni vacía el carrito. El reintento explícito puede aprobar la misma orden. | Automatizado aprobado. |
| SBX-09 | Aprobar, desmontar la página y volver con `?orden=<número>`. | Recupera la confirmación persistida aunque el carrito esté vacío. | Automatizado aprobado; simula recarga de componentes. |
| SBX-10 | Rechazar, recargar la URL de resultado y pulsar Intentar de nuevo. | La revisión debe mostrar los datos del comprador guardados en la orden. | Fallo conocido: faltan en la revisión. [Chromium](evidence/retry-after-reload.png). |

## Incidencia encontrada: SBX-10

La orden conserva los datos del comprador en localStorage, pero checkout inicializa el formulario vacío al recuperar una orden. El reintento abre una revisión sin esos datos. La corrección corresponde a la recuperación de datos de la interfaz, en coordinación con Luis; no se modifica en esta tarea de pruebas del Sandbox.

El caso usa `it.fails`: declara explícitamente que existe una regresión pendiente. No equivale a una aceptación aprobada. Cuando se corrija, se debe quitar `.fails`; si el comportamiento empieza a funcionar antes de actualizar la prueba, Vitest lo señalará como un resultado inesperado.

## Evidencia de ejecución

Validación realizada el 17 de octubre de 2026 sobre `feature/sandbox-service`, partiendo de `ea94dd8` y con las adiciones de esta tarea:

- Servicio: 20 casos existentes ejecutados correctamente.
- Checkout: 9 casos de aceptación aprobados y 1 fallo conocido declarado como esperado.
- Build y lint: ejecutados correctamente.
- Chromium real: catálogo con 500 productos de Algolia; compra aprobada, rechazada y error del servicio verificados desde la interfaz. Los reintentos de rechazo/error aprobaron la misma orden; no se detectaron excepciones de página en esos recorridos.
- Recarga tras rechazo: se reprodujo SBX-10 y se comprobó que los datos siguen guardados en la orden.
- Las capturas usan datos ficticios. Los productos y montos del navegador provienen del catálogo real y pueden diferir de la respuesta fija de las pruebas automatizadas.

Las capturas corresponden al servidor local de esta rama, no a GitHub Pages. La ejecución de Chromium fue una comprobación adicional, no un comando de CI incluido en el proyecto. Una suite DOM no verifica por sí sola diseño responsive, accesibilidad completa ni todos los navegadores.

Las capturas se tomaron antes del cambio de etiquetas a marcas de tarjeta; muestran los nombres anteriores de los mismos escenarios del Sandbox.

## Repetición desde un navegador

1. Ejecutar `pnpm run dev` y abrir la URL local mostrada por Vite.
2. Agregar un producto desde el catálogo y abrir el carrito; continuar a checkout.
3. Completar los datos ficticios anteriores y revisar productos, cantidades y totales.
4. Ejecutar SBX-01, SBX-02 y SBX-03 con carritos nuevos. Revisar carga, mensaje final y almacenamiento de carrito/órdenes en las herramientas del navegador.
5. Ejecutar SBX-05 y SBX-06 sin recargar: seleccionar Tarjeta Visa después de pulsar Intentar de nuevo. Verificar que el número de orden se conserve.
6. Para SBX-10, recargar el resultado rechazado antes de reintentar y revisar si aparecen los datos del comprador.
7. Ejecutar SBX-07 y SBX-08 con `pnpm run test:sandbox:integration`: las tres marcas de tarjeta seleccionan los escenarios originales y no se agrega un selector especial de timeout.
