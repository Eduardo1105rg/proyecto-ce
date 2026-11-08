Proyecto III: Entorno B2B, Roles, Precios e Inventario 
Objetivo 
Extender incrementalmente la aplicación de comercio electrónico desarrollada durante los 
Proyectos I y II y los laboratorios realizados durante el curso, incorporando características 
propias de un entorno de comercio electrónico B2B (Business-to-Business). 
El proyecto busca que el estudiante adapte la plataforma existente para atender diferentes 
tipos de usuarios, manejar precios y condiciones comerciales diferenciadas, administrar 
inventario distribuido entre diferentes sucursales y consultar las órdenes generadas durante 
el proceso de compra. 
La solución deberá mantener las funcionalidades desarrolladas previamente y agregar una 
nueva capa de operación empresarial sobre la aplicación existente. 
Al finalizar el proyecto, la aplicación deberá permitir representar, como mínimo, los 
siguientes escenarios: 
1. Un cliente B2C realiza una compra utilizando las condiciones comerciales 
correspondientes a este tipo de cliente. 
2. Un cliente B2B realiza una compra utilizando condiciones comerciales diferenciadas. 
3. La aplicación adapta su comportamiento dependiendo del rol del usuario. 
4. El usuario puede consultar la disponibilidad de productos según una sucursal. 
5. La orden conserva la información correspondiente al usuario, condiciones 
comerciales, precios, sucursal e inventario seleccionado. 
6. Un administrador puede consultar las órdenes generadas. 
7. El administrador puede consultar información relacionada con productos e inventario. 
8. El administrador puede realizar modificaciones simuladas sobre información 
administrativa. 
9. La información de usuarios y órdenes puede ser consultada mediante índices 
especializados de Algolia. 
El proyecto deberá desarrollarse como una continuación directa de los proyectos anteriores. 
Índices de Algolia 
Durante el Proyecto I se implementó la integración con Algolia para consultar el catálogo de 
productos. Para el proyecto se deberá extender el uso de Algolia mediante índices 
especializados. Como mínimo deberán existir conceptualmente: 
• products 
• users 
• orders 
Índice de usuarios 
Contendrá los datos iniciales necesarios para representar los usuarios de la aplicación. 
Índice de órdenes 
Contendrá las órdenes generadas durante el proceso de compra. 
La estructura de los registros queda a criterio del grupo, siempre que permita cumplir los 
requerimientos del proyecto. 
Usuarios y roles 
• La aplicación deberá incorporar un mecanismo de autenticación simulada. 
• No se requiere implementar un sistema real de autenticación. 
• Los usuarios iniciales deberán estar definidos en el índice de usuarios de Algolia. 
Como mínimo deberán existir los siguientes roles: 
a. Cliente B2C 
Representa un consumidor tradicional. 
Deberá utilizar: 
• Precios B2C; 
• Condiciones de compra B2C; 
• Disponibilidad de productos; 
• Proceso de compra existente. 
b. Cliente B2B 
Representa una empresa que compra productos al comercio. 
Deberá utilizar: 
• Precios B2B; 
• Condiciones comerciales diferenciadas; 
• Cantidades de compra acordes con las reglas definidas; 
• Información de empresa; 
• Disponibilidad de inventario. 
c. Administrador 
Representa al usuario encargado de administrar y consultar información de la 
plataforma. Deberá tener acceso a funcionalidades administrativas que no estén 
disponibles para los clientes. 
Usuarios iniciales 
El grupo deberá proporcionar como mínimo: 
• Un usuario B2C; 
• Un usuario B2B; 
• Un usuario Administrador. 
Estos usuarios deberán estar disponibles desde el inicio para efectos de evaluación. El 
proyecto no requiere implementar un proceso de registro de nuevas cuentas. El objetivo es 
evaluar el comportamiento de la aplicación cuando diferentes usuarios ingresan con 
diferentes roles. El grupo podrá incorporar usuarios adicionales si lo considera conveniente. 
Simulación de inicio de sesión 
La aplicación deberá proporcionar un mecanismo mediante el cual el usuario pueda 
seleccionar o iniciar sesión como alguno de los usuarios definidos. 
La interfaz deberá permitir identificar claramente: 
• Usuario actual; 
• Tipo de usuario; 
• Rol. 
Una vez iniciado el flujo de sesión, la aplicación deberá adaptar su comportamiento de 
acuerdo con el rol. 
Control de acceso basado en roles 
La aplicación deberá implementar el concepto de Role-Based Access Control (RBAC) a nivel 
de la interfaz. Cada rol deberá disponer de funcionalidades acordes con sus 
responsabilidades. 
Como mínimo: 
Funcionalidad 
B2C 
B2B 
Consultar catálogo 
ADMIN 
✓ 
✓ 
Buscar productos 
✓ 
✓ 
✓ 
Agregar productos al carrito 
✓ 
✓ 
✓ 
Checkout 
✓ 
— 
✓ 
Consultar órdenes propias 
✓ 
— 
✓ 
Consultar todas las órdenes 
— 
— 
— 
✓ 
Consultar información administrativa 
— 
— 
✓ 
Administración simulada 
— 
— 
✓ 
El grupo deberá documentar cómo implementó el control de acceso. Lo presentado es una 
sugerencia de cómo debería de manejarse. 
Precios diferenciados 
Los productos deberán incorporar información que permita representar diferentes 
condiciones comerciales. Como mínimo deberá existir: 
• Precio B2C. 
• Precio B2B. 
Por ejemplo: Precio B2C: ₡100.000 y Precio B2B: ₡90.000 
La aplicación deberá seleccionar automáticamente el precio correspondiente al usuario 
autenticado. 
El precio utilizado deberá reflejarse correctamente en: 
• Catálogo. 
• Detalle del product. 
• Carrito. 
• Checkout. 
• Resumen de compra. 
• Orden generada. 
No deberá existir inconsistencia entre el precio mostrado al usuario y el precio almacenado 
en la orden. 
Condiciones comerciales B2B 
Además de manejar un precio diferenciado, la aplicación deberá implementar al menos una 
condición comercial específica para clientes B2B. 
El grupo podrá seleccionar una o varias alternativas, tales como: 
• Cantidad mínima de compra. 
• Descuento por volume. 
• Precio especial según cantidad. 
• Condiciones especiales de compra. 
Por ejemplo: 
B2C 
• Cantidad mínima: 1 
B2B 
• Cantidad mínima: 5 
• La aplicación deberá validar la condición antes de permitir completar la 
compra. 
• La condición seleccionada deberá documentarse y justificarse. 
12. Multi-inventario 
En el Proyecto III esta funcionalidad deberá reutilizarse la información de inventario del 
catálogo definida desde el proyecto I y extenderse para representar inventario distribuido por 
sucursal de ser necesario. Los grupos que ya implementaron una estructura equivalente 
deberán reutilizarla. Los grupos que no cuenten con esta funcionalidad deberán incorporarla 
como parte del presente proyecto. 
Como mínimo deberán existir tres ubicaciones. 
Por ejemplo: 
Producto 
San José 
Alajuela 
Laptop 
Cartago 
8 
4 
Monitor 
0 
2 
0 
Mouse 
5 
15 
8 
10 
La estructura exacta queda a criterio del grupo y según el contexto de su catálogo de 
productos. 
Selección de sucursal 
Durante el proceso de compra el usuario deberá poder seleccionar la sucursal correspondiente 
al retiro o envío. 
Una vez seleccionada: 
1. La aplicación deberá consultar la disponibilidad. 
2. Deberá mostrar la disponibilidad correspondiente. 
3. No deberá permitir seleccionar una cantidad superior al inventario disponible. 
4. La sucursal deberá quedar asociada a la orden. 
Por ejemplo: 
Sucursal seleccionada: San José 
Laptop 
Disponible: 8 unidades 
Cantidad: 5  
Si el usuario intenta adquirir 10 unidades, la aplicación deberá impedir la operación e 
informar claramente la razón. 
Integración con las órdenes 
La información desarrollada en este proyecto deberá integrarse con las órdenes generadas en 
el Proyecto II. La orden deberá conservar como mínimo: 
• número de orden. 
• fecha. 
• usuario. 
• rol. 
• información del cliente. 
• información de empresa cuando corresponda. 
• productos. 
• cantidades. 
• precio aplicado. 
• sucursal seleccionada. 
• subtotal. 
• impuestos. 
• costo de envío. 
• total. 
• estado de la orden. 
• estado del pago. 
La orden deberá permitir identificar claramente en qué condiciones comerciales fue 
realizada. 
Persistencia de las órdenes 
Las órdenes generadas deberán almacenarse utilizando el mecanismo definido por el grupo 
para el índice de órdenes. La información deberá poder ser recuperada posteriormente por la 
aplicación para permitir su consulta. Como mínimo deberán conservarse: 
• Identificación de la orden. 
• Usuario. 
• Fecha. 
• Productos. 
• Cantidades. 
• Precios. 
• Sucursal. 
• Total. 
• Estado de la orden. 
• Estado del pago. 
Panel administrativo 
La aplicación deberá incorporar un panel administrativo disponible únicamente para el 
usuario con rol ADMIN. 
El panel deberá permitir como mínimo: 
a) Consulta de órdenes 
Mostrar las órdenes generadas. 
Como mínimo deberá permitir visualizar: 
• Número de orden. 
• Fecha. 
• Cliente. 
• Tipo de cliente. 
• Empresa. 
• Total. 
• Succursal. 
• Estado de la orden. 
• Estado del pago. 
b) Consulta de productos 
El administrador deberá poder consultar información relevante del catálogo. 
c) Consulta de inventario 
Deberá poder consultar la disponibilidad por sucursal. 
Administración simulada 
El administrador deberá poder realizar al menos una operación administrativa de manera 
simulada. 
Por ejemplo: 
• Modificar un precio. 
• Modificar inventario. 
• Cambiar disponibilidad. 
• Modificar una condición comercial. 
La implementación deberá dejar claro qué información está siendo modificada y cuál es el 
resultado. No es obligatorio modificar directamente el índice de productos de Algolia desde 
la aplicación frontend. Las modificaciones podrán mantenerse mediante mecanismos de 
persistencia local o mediante la estrategia de simulación definida por el grupo. 
Manejo de errores y validaciones 
La aplicación deberá contemplar, como mínimo, los siguientes escenarios: 
Situación 
Comportamiento esperado 
Usuario inválido 
No permitir iniciar sesión 
Usuario sin rol válido 
Informar o impedir acceso 
Cliente intenta acceder al panel administrativo 
Denegar acceso 
Producto sin inventario 
Informar que no está disponible 
Impedir continuar 
Cantidad superior al inventario 
Sucursal sin disponibilidad 
Informar al usuario 
Cantidad inferior al mínimo B2B 
Impedir continuar 
Precio o información comercial inválida 
Manejar el error adecuadamente 
Orden inexistente 
Mostrar mensaje comprensible 
Los mensajes deberán estar orientados al usuario final y no limitarse a mostrar errores 
técnicos. 
Interfaz y experiencia de usuario 
La aplicación deberá mantener coherencia visual con los proyectos anteriores. 
Deberá: 
• Ser responsive; 
• Mantener una navegación clara. 
• Indicar el usuario activo. 
• Indicar el rol activo. 
• Diferenciar las funcionalidades administrativas. 
• Mostrar claramente el precio correspondiente. 
• Mostrar disponibilidad. 
• Indicar la sucursal seleccionada. 
• Informar las restricciones B2B. 
• Presentar mensajes claros ante errores. 
La experiencia deberá permitir identificar fácilmente qué comportamiento corresponde a 
cada tipo de usuario. 



------------------------------------

Laboratorio 5: Simulación de Analytics 
1. Descripción 
En este laboratorio se incorporarán funcionalidades básicas de analítica y personalización al 
comercio electrónico desarrollado durante los proyectos anteriores. 
El objetivo es registrar algunas acciones realizadas por los usuarios y utilizar esa información 
para mejorar la experiencia de navegación mediante recomendaciones e información 
personalizada. 
2. Objetivo 
Implementar mecanismos básicos para: 
• Registrar eventos relevantes de interacción del usuario. 
• Mantener información de navegación localmente. 
• Mostrar contenido personalizado a partir de las acciones realizadas. 
• Presentar métricas básicas de uso de la aplicación. 
3. Requerimientos 
La aplicación deberá incorporar, como mínimo, las siguientes funcionalidades: 
A. Registro de eventos 
Registrar localmente eventos como: 
• Inicio de sesión. 
• Búsqueda de productos. 
• Visualización de un producto. 
• Agregar un producto al carrito. 
• Inicio del checkout. 
• Compra completada. 
Cada evento debe almacenar, como mínimo, el tipo de evento, fecha/hora e información 
relevante de la acción. 
B. Historial del usuario 
La aplicación deberá conservar localmente: 
• Productos vistos recientemente. 
• Búsquedas recientes. 
Esta información deberá estar asociada al usuario o sesión activa. 
C. Personalización 
Utilizando la información recopilada, la aplicación deberá mostrar al menos dos elementos 
personalizados, por ejemplo: 
• Productos vistos recientemente. 
• Búsquedas recientes. 
• Productos relacionados con los productos consultados. 
• Recomendaciones basadas en categorías o búsquedas anteriores. 
La personalización debe depender de datos reales generados durante la interacción con la 
aplicación. 
D. Métricas 
Incorporar una sección sencilla de Analytics que muestre al menos: 
• Cantidad de productos visualizados. 
• Cantidad de búsquedas realizadas. 
• Cantidad de productos agregados al carrito. 
• Cantidad de compras realizadas. 
Las métricas pueden presentarse mediante tarjetas, tablas o gráficos sencillos. 
4. Restricciones 
• Se permite utilizar localStorage para almacenar eventos e información de navegación. 
• No se requiere utilizar servicios externos de Analytics. 
• Las funcionalidades deben integrarse con el flujo existente de la aplicación.