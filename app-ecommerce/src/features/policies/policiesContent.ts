import {
	ENVIO_MINIMO,
	ENVIO_PORCENTAJE,
	IVA_TASA,
	UMBRAL_ENVIO_GRATIS,
} from '../../services/carritoCalculos'
import { formatPrice } from '../../utils/formatPrice'
import type { Policy } from '../../types/policy'

const UMBRAL = formatPrice(UMBRAL_ENVIO_GRATIS)
const IVA_PORCENTAJE = Math.round(IVA_TASA * 100)

// Misma regla que calcularEnvio en services/carritoCalculos.
const REGLA_ENVIO = `El costo de envío es el ${Math.round(ENVIO_PORCENTAJE * 100)} % del importe de los productos que pagan envío, con un mínimo de ${formatPrice(ENVIO_MINIMO)}. Si el subtotal de la compra es igual o superior a ${UMBRAL}, el envío es gratuito. Los productos que incluyen envío gratuito no se suman a ese cálculo.`

/**
 * Textos de la sección de información comercial.
 *
 * Para modificar o agregar contenido basta con editar este archivo; las
 * páginas se arman solas a partir de esta lista. Todos los textos van en
 * "usted". Cada subsección se numera automáticamente (a., b., c.).
 *
 * Tipos de bloque disponibles:
 *   { type: 'paragraph', text }            un párrafo
 *   { type: 'list', items }                una lista con viñetas
 *   { type: 'numbered', items }            pasos numerados con la letra del apartado (a.1, a.2...)
 *   { type: 'groups', groups }             títulos pequeños, cada uno con su lista
 *   { type: 'faq', items }                 preguntas y respuestas desplegables
 */
export const POLICIES: Policy[] = [
	{
		slug: 'terminos',
		title: 'Términos y condiciones',
		sections: [
			{
				title: 'Alcance de la plataforma',
				blocks: [
					{
						type: 'paragraph',
						text: 'Estos términos y condiciones regulan el uso de la tienda en línea MarketByte y las compras realizadas a través de la plataforma. En ellos se establecen las condiciones de compra y las responsabilidades del cliente y de la tienda.',
					},
					{
						type: 'paragraph',
						text: 'La oficina de la tienda simulada se ubica en Costa Rica, provincia de Limón, cantón de Limón, distrito de Limón, barrio Roosevelt, frente al TEC de Limón. Puede contactar al equipo de atención al cliente mediante soporte@marketbyte.com o por teléfono y WhatsApp al +506 8888-8888.',
					},
				],
			},
			{
				title: 'Compra como invitado',
				blocks: [
					{
						type: 'paragraph',
						text: 'Puede realizar sus compras como invitado, sin crear una cuenta ni registrarse en la plataforma.',
					},
				],
			},
			{
				title: 'Uso del sitio y responsabilidades del cliente',
				blocks: [
					{
						type: 'paragraph',
						text: 'Utilice la plataforma para consultar el catálogo, realizar compras y gestionar consultas relacionadas con sus pedidos. No debe interferir con su funcionamiento ni intentar acceder a información de otros usuarios.',
					},
					{ type: 'paragraph', text: 'Al realizar una compra, le corresponde:' },
					{
						type: 'list',
						items: [
							'Proporcionar información de contacto y entrega clara, completa y correcta.',
							'Revisar los productos, cantidades, datos del pedido y total antes de confirmar la compra.',
							'Consultar las condiciones de compra, envío y devolución aplicables.',
							'Cumplir las condiciones de conservación y retorno del producto cuando solicite una devolución voluntaria.',
						],
					},
				],
			},
			{
				title: 'Responsabilidades de MarketByte',
				blocks: [
					{ type: 'paragraph', text: 'MarketByte se compromete a:' },
					{
						type: 'list',
						items: [
							'Presentar información clara sobre los productos, precios y costos de envío.',
							'Gestionar las órdenes confirmadas conforme a las condiciones informadas y a la Política de Envíos.',
							'Atender consultas y solicitudes de devolución por sus canales oficiales, dentro de los plazos establecidos para cada gestión.',
							'Tratar la información personal conforme a la Política de Privacidad.',
						],
					},
					{
						type: 'paragraph',
						text: 'Las condiciones de entrega y el tratamiento de datos se desarrollan en sus respectivas políticas, que complementan estos términos.',
					},
				],
			},
			{
				title: 'Precios e impuestos',
				blocks: [
					{
						// Ajustado al sistema: el catálogo muestra precios sin IVA y el resumen lo suma aparte.
						type: 'paragraph',
						text: `Los precios mostrados en el catálogo no incluyen impuestos. En el resumen de su compra se suman el IVA (${IVA_PORCENTAJE} %) y el costo de envío que corresponda.`,
					},
					{
						type: 'paragraph',
						text: 'Desde el carrito de compras puede consultar el desglose de los importes y el total de la operación.',
					},
					{
						type: 'paragraph',
						text: `${REGLA_ENVIO} El costo de envío no se incluye al determinar si se alcanza el subtotal para envío gratuito. La tarifa no cambia según la ubicación de entrega.`,
					},
				],
			},
			{
				title: 'Revisión de la compra',
				blocks: [
					{
						type: 'paragraph',
						text: 'Antes de proceder al pago, puede revisar los productos seleccionados, modificar sus cantidades o retirarlos del carrito. Verifique su selección y el total de la compra antes de continuar.',
					},
				],
			},
			{
				title: 'Aceptación de los términos',
				blocks: [
					{
						type: 'paragraph',
						text: 'Para finalizar la compra deberá aceptar expresamente estos términos mediante la casilla correspondiente, que estará desmarcada inicialmente. Si no los acepta, no podrá completar la compra y la plataforma mostrará un mensaje de validación. La aceptación quedará registrada como parte de la información de la orden.',
					},
					{
						type: 'paragraph',
						text: 'Puede consultar los términos antes de aceptarlos y conservar una copia. La visita al sitio o la consulta del catálogo no equivalen a aceptar una compra.',
					},
				],
			},
			{
				title: 'Métodos de pago',
				blocks: [
					{
						type: 'paragraph',
						text: 'La plataforma representa pagos con tarjetas Visa, American Express y Mastercard mediante un sistema completamente simulado. No solicita, procesa ni almacena información financiera real, como números de tarjetas, cuentas bancarias o credenciales de pago. Ninguna operación genera cargos económicos ni movimientos bancarios.',
					},
				],
			},
			{
				title: 'Confirmación de la orden',
				blocks: [
					{
						type: 'paragraph',
						text: 'La orden queda confirmada inmediatamente cuando se aprueba el pago simulado. La plataforma muestra el número de orden, la fecha y hora de la compra, el identificador de la transacción y un resumen de los importes. Además, enviaremos la confirmación de la compra al correo electrónico que haya proporcionado.',
					},
					{
						type: 'paragraph',
						text: 'Conserve el número de orden para consultar el estado de su pedido o realizar gestiones relacionadas con la compra.',
					},
				],
			},
			{
				title: 'Falta de disponibilidad de un producto',
				blocks: [
					{
						type: 'paragraph',
						text: 'Si un producto de una orden confirmada no pudiera entregarse por falta de existencias, atención al cliente se comunicará con usted para ofrecerle una alternativa disponible o un reembolso del importe pagado por ese producto. La elección le corresponde al cliente; MarketByte no sustituirá el artículo sin su consentimiento.',
					},
					{
						type: 'paragraph',
						text: 'El reembolso conserva el carácter simulado de los pagos e incluye los impuestos y el envío original pagado, conforme a las reglas de reembolso de esta política. No se exige devolver un producto que no haya sido entregado.',
					},
					{
						type: 'paragraph',
						text: 'Si elige el reembolso, este se completará de forma simulada en un plazo máximo de 8 días naturales desde que comunique su elección a atención al cliente.',
					},
				],
			},
			{
				title: 'Modificaciones después de la confirmación',
				blocks: [
					{
						type: 'paragraph',
						text: 'Una vez confirmada la orden, no se admiten modificaciones directas de los productos, las cantidades ni los datos de entrega asociados al pedido. Revise esta información antes de finalizar la compra.',
					},
					{
						type: 'paragraph',
						text: 'Esta limitación no impide solicitar la corrección de información personal incorrecta o la actualización de datos de contacto conforme a la Política de Privacidad. Tampoco excluye los cambios o reembolsos previstos en la Política de Devoluciones o por falta de existencias. Estas gestiones se atienden por los canales oficiales de atención al cliente y se distinguen de las modificaciones directas del pedido.',
					},
				],
			},
			{
				title: 'Propiedad intelectual',
				blocks: [
					{
						type: 'paragraph',
						text: 'Las imágenes y descripciones de productos publicadas en el catálogo proceden de terceros. Los derechos sobre estos contenidos corresponden a sus respectivos titulares; su publicación en MarketByte no implica que la tienda sea su autora o propietaria.',
					},
				],
			},
			{
				title: 'Interrupciones técnicas',
				blocks: [
					{
						type: 'paragraph',
						text: 'La plataforma puede presentar interrupciones por mantenimiento o fallos técnicos. Si una incidencia afecta su compra, comuníquese con atención al cliente e indique el número de orden, si dispone de él, y lo ocurrido. Una interrupción no anula por sí sola una orden confirmada ni elimina las responsabilidades que correspondan a la tienda.',
					},
				],
			},
		],
	},
	{
		slug: 'devoluciones',
		title: 'Política de devoluciones',
		sections: [
			{
				title: 'Plazo para solicitar una devolución',
				blocks: [
					{
						type: 'paragraph',
						text: 'Puede solicitar la devolución de un producto del catálogo dentro de los 30 días naturales siguientes a la recepción del artículo que desea devolver. En entregas fraccionadas, el plazo se cuenta por separado para cada artículo desde su recepción.',
					},
					{
						type: 'paragraph',
						text: 'Puede devolver uno o varios productos de una misma orden y conservar los demás. La solicitud debe identificar cuáles artículos desea devolver, y las condiciones de esta política se evaluarán para cada uno.',
					},
				],
			},
			{
				title: 'Condiciones de las devoluciones voluntarias',
				blocks: [
					{
						type: 'paragraph',
						text: 'Para aprobar una devolución voluntaria, el producto no debe haber sido utilizado por el cliente después de recibirlo. Debe conservar el estado en que fue entregado y mantener su empaque original, junto con todos sus accesorios y componentes. Estas condiciones también se aplican a los productos renovados, tomando como referencia su estado de entrega.',
					},
				],
			},
			{
				title: 'Casos en que no se aceptan devoluciones voluntarias',
				blocks: [
					{ type: 'paragraph', text: 'No se aprobarán devoluciones voluntarias en los siguientes casos:' },
					{
						type: 'list',
						items: [
							'La solicitud se presenta después de los 30 días naturales siguientes a la recepción del artículo.',
							'El producto fue utilizado por el cliente después de recibirlo o presenta deterioro causado después de su entrega.',
							'No se conserva el empaque original o faltan accesorios o componentes entregados con el producto.',
						],
					},
					{
						type: 'paragraph',
						text: 'Estas condiciones corresponden a devoluciones voluntarias y no eliminan la atención de reclamos por daños o defectos ni los derechos de retracto y garantía que correspondan.',
					},
				],
			},
			{
				title: 'Costo del transporte de regreso',
				blocks: [
					{
						type: 'paragraph',
						text: 'Si solicita la devolución de un producto en buen estado porque cambió de opinión, deberá asumir el costo del transporte de regreso a la tienda.',
					},
					{
						type: 'paragraph',
						text: 'Si el producto llega dañado o defectuoso, MarketByte asumirá el costo del transporte de regreso.',
					},
					{
						type: 'paragraph',
						text: 'Si corresponde un reemplazo por daños o defectos, MarketByte también cubrirá el envío del producto de reemplazo al cliente.',
					},
				],
			},
			{
				title: 'Productos dañados o defectuosos',
				blocks: [
					{
						type: 'paragraph',
						text: 'Si recibe un producto dañado o defectuoso, comuníquese con nuestro equipo de atención al cliente lo antes posible. Según el caso, podrá solicitar un reemplazo o gestionar un reembolso.',
					},
					{
						type: 'paragraph',
						text: 'Las solicitudes por daños o defectos se evalúan por separado de las devoluciones voluntarias. La condición de que el producto no haya sido utilizado por el cliente después de recibirlo no se utilizará por sí sola para rechazar una solicitud relacionada con un defecto.',
					},
				],
			},
			{
				title: 'Cómo solicitar una devolución',
				blocks: [
					{
						type: 'paragraph',
						text: 'Comuníquese con nuestro equipo de atención al cliente por alguno de los siguientes medios:',
					},
					{
						type: 'list',
						items: [
							'Correo electrónico: soporte@marketbyte.com.',
							'Teléfono y WhatsApp: +506 8888-8888.',
						],
					},
					{
						type: 'paragraph',
						text: 'Indique el número de orden, el producto que desea devolver y el motivo de la solicitud. Si el producto presenta un daño o defecto, adjunte fotografías cuando sea posible para facilitar su evaluación.',
					},
					{
						type: 'paragraph',
						text: 'Nuestro equipo dará una primera respuesta en un plazo máximo de 3 días hábiles a partir de la recepción de la solicitud. Este plazo corresponde a la atención inicial, no a la resolución definitiva de la devolución.',
					},
					{
						type: 'paragraph',
						text: 'Atención al cliente le indicará la dirección a la que debe enviar el producto. El transporte de regreso se realizará a esa dirección, y su costo será asumido por el cliente o por MarketByte según el motivo de la devolución indicado en esta política.',
					},
				],
			},
			{
				title: 'Opciones de resolución',
				blocks: [
					{
						type: 'paragraph',
						text: 'Una vez aprobada una devolución voluntaria, podrá elegir entre un cambio por otro producto del catálogo o un reembolso. Nuestro equipo de atención al cliente le indicará cómo continuar con la opción seleccionada.',
					},
					{
						type: 'paragraph',
						text: 'Si el producto elegido para el cambio tiene un precio mayor, deberá cubrir la diferencia. Si tiene un precio menor, se gestionará el reembolso de la diferencia. Estos ajustes se representan dentro del sistema de pagos simulado.',
					},
					{
						type: 'paragraph',
						text: `En los cambios voluntarios, el cliente cubrirá el costo del nuevo envío cuando corresponda, con las mismas reglas del envío inicial. ${REGLA_ENVIO}`,
					},
					{
						type: 'paragraph',
						text: 'Si elige el reembolso, este incluirá el importe del producto con sus impuestos y el costo del envío original que haya pagado. Los reembolsos tienen carácter simulado, al igual que los pagos de la plataforma, y no generan devoluciones de dinero real ni movimientos bancarios.',
					},
					{
						type: 'paragraph',
						text: 'Si devuelve solo parte de una orden, el reembolso incluirá el importe de los artículos devueltos con sus impuestos y la totalidad del envío original pagado. El envío original se reembolsará una sola vez por orden, aunque presente más de una solicitud de devolución.',
					},
				],
			},
			{
				title: 'Plazo de revisión y resolución',
				blocks: [
					{
						type: 'paragraph',
						text: 'MarketByte contará con un máximo de 8 días naturales desde la recepción del producto devuelto para revisarlo, comunicar el resultado y, si corresponde su aprobación, tramitar el cambio o reembolso.',
					},
					{
						type: 'paragraph',
						text: 'Este plazo corresponde a la revisión y tramitación de la solicitud. El tiempo de entrega del producto de reemplazo se rige por los plazos de la Política de Envíos.',
					},
				],
			},
			{
				title: 'Diferencia entre devolución voluntaria y retracto',
				blocks: [
					{
						type: 'paragraph',
						text: 'El plazo comercial de 30 días desde la recepción de cada artículo no sustituye el derecho de retracto. Como referencia para este proyecto, la normativa costarricense permite ejercer el retracto dentro de los 8 días hábiles siguientes al perfeccionamiento de la venta, cuando la naturaleza del bien lo permita. Puede comunicarlo por escrito al correo oficial de la tienda y conservar constancia de su envío.',
					},
					{
						type: 'paragraph',
						text: 'En un retracto, el reintegro se representa por el mismo medio de pago utilizado y dentro de los 8 días naturales siguientes al aviso; si el cliente ya recibió el producto, ese plazo se cuenta desde su devolución. Esta gestión conserva el carácter simulado de los pagos del proyecto.',
					},
					{
						type: 'paragraph',
						text: 'La primera respuesta de atención al cliente y la revisión de una devolución voluntaria no suspenden ni amplían los plazos aplicables al retracto. Los reclamos de garantía por defectos se atienden por separado y no se limitan al plazo comercial de 30 días.',
					},
				],
			},
		],
	},
	{
		slug: 'envios',
		title: 'Política de envíos',
		sections: [
			{
				title: 'Cobertura de entrega',
				blocks: [
					{
						type: 'paragraph',
						text: 'MarketByte realiza entregas en todo el territorio de Costa Rica. Nuestro servicio de distribución está disponible tanto para zonas urbanas como rurales, sujeto a las condiciones de acceso de cada ubicación.',
					},
				],
			},
			{
				title: 'Tiempos estimados de envío',
				blocks: [
					{
						type: 'paragraph',
						text: 'Una vez confirmada la compra, el pedido entra en proceso de preparación y coordinación logística.',
					},
					{ type: 'paragraph', text: 'Los tiempos estimados son los siguientes:' },
					{
						type: 'list',
						items: [
							'Preparación y coordinación del envío: hasta 3 días hábiles.',
							'Entrega del pedido: hasta 10 días hábiles posteriores a la coordinación del envío.',
						],
					},
					{
						type: 'paragraph',
						text: 'Por lo tanto, el plazo total estimado para recibir un pedido puede ser de hasta 13 días hábiles, dependiendo de la ubicación de entrega y las condiciones logísticas aplicables.',
					},
					{
						type: 'paragraph',
						text: 'Los tiempos indicados son estimados y podrían variar debido a factores externos como condiciones climáticas, alta demanda estacional, dificultades de acceso o imprevistos operativos.',
					},
				],
			},
			{
				title: 'Seguimiento de pedidos',
				blocks: [
					{
						type: 'paragraph',
						text: 'Para consultar sobre el estado de uno de sus pedidos, puede utilizar el identificador de la orden. Contáctenos a través de nuestros medios de comunicación para conocer el estado de su pedido.',
					},
				],
			},
			{
				title: 'Costos de envío',
				blocks: [
					{
						type: 'paragraph',
						text: 'Los costos de envío se calculan automáticamente durante el proceso de compra según las condiciones vigentes de la tienda.',
					},
					{
						// Las cifras salen de las mismas constantes que usa el carrito, para que
						// la política nunca contradiga el cálculo real.
						type: 'paragraph',
						text: REGLA_ENVIO,
					},
					{
						type: 'paragraph',
						text: 'Cuando corresponda un cargo por envío, este se mostrará de forma detallada antes de finalizar la compra.',
					},
				],
			},
			{
				title: 'Productos de gran tamaño',
				blocks: [
					{
						type: 'paragraph',
						text: 'Algunos artículos, como muebles y otros productos voluminosos, pueden requerir procesos especiales de manipulación, transporte o instalación.',
					},
					{ type: 'paragraph', text: 'En estos casos:' },
					{
						type: 'list',
						items: [
							'El tiempo de coordinación y entrega puede ser superior al plazo estándar.',
							'Podría ser necesario contactar al cliente para acordar una fecha y horario de entrega.',
							'Pedidos que incluyan múltiples productos de gran tamaño podrían requerir entregas programadas o fraccionadas.',
						],
					},
				],
			},
			{
				title: 'Restricciones y condiciones especiales',
				blocks: [
					{
						type: 'paragraph',
						text: 'Para garantizar una entrega adecuada, se aplican las siguientes condiciones:',
					},
					{
						type: 'list',
						items: [
							'La dirección proporcionada debe ser clara, completa y accesible para los medios de transporte de entrega.',
							'El cliente debe verificar el estado general de los productos al momento de recibirlos.',
							'Algunos productos pueden requerir coordinación previa de entrega debido a su tamaño, peso o características especiales.',
							'El transportista podrá contactar al cliente para confirmar detalles relacionados con la entrega.',
							'En caso de ausencia del cliente durante la visita programada, podría ser necesario reprogramar la entrega y se podrían aplicar costes adicionales.',
							'MarketByte no se responsabiliza por retrasos ocasionados por información de contacto incorrecta o direcciones incompletas proporcionadas por el cliente.',
							'Determinadas zonas de difícil acceso pueden requerir tiempos adicionales de entrega.',
						],
					},
				],
			},
			{
				title: 'Contacto sobre envíos',
				blocks: [
					{
						type: 'paragraph',
						text: 'Si tiene consultas relacionadas con el estado de una entrega o la coordinación de pedidos, nuestro equipo de atención al cliente estará disponible para brindarle asistencia a través de los canales de contacto publicados en la plataforma.',
					},
				],
			},
		],
	},
	{
		slug: 'privacidad',
		title: 'Política de privacidad',
		sections: [
			{
				title: 'Introducción',
				blocks: [
					{
						type: 'paragraph',
						text: 'En MarketByte, valoramos la privacidad de nuestros clientes y nos comprometemos a proteger la información que nos proporcionan durante el uso de nuestra plataforma. Esta Política de Privacidad describe qué información recopilamos, cómo la utilizamos y las medidas básicas que aplicamos para protegerla.',
					},
					{
						type: 'paragraph',
						text: 'Dado que MarketByte es un proyecto académico que simula el funcionamiento de una tienda en línea, esta política tiene fines educativos y busca representar prácticas comunes utilizadas en plataformas reales de comercio electrónico.',
					},
				],
			},
			{
				title: 'Información que recopilamos',
				blocks: [
					{
						type: 'paragraph',
						text: 'Para procesar compras y brindar una adecuada atención al cliente, MarketByte puede recopilar la siguiente información:',
					},
					{
						type: 'groups',
						groups: [
							{
								title: 'Datos personales',
								items: [
									'Nombre completo.',
									'Dirección de correo electrónico.',
									'Número de teléfono.',
									'Provincia y cantón de residencia.',
									'Dirección de entrega.',
									'Notas o comentarios proporcionados durante la compra.',
								],
							},
							{
								title: 'Información relacionada con pedidos',
								items: [
									'Productos adquiridos.',
									'Cantidades solicitadas.',
									'Fechas de compra.',
									'Estado del pedido.',
									'Historial de órdenes realizadas.',
									'Aceptación de los términos y condiciones, con su fecha y hora.',
								],
							},
							{
								title: 'Información técnica',
								items: [
									'Preferencias de navegación dentro de la plataforma.',
									'Configuración de tema visual (claro u oscuro).',
									'Información necesaria para mantener el carrito de compras y mejorar la experiencia de usuario.',
								],
							},
						],
					},
					{
						type: 'paragraph',
						text: 'Para efectos de simulación académica, esta información se considera almacenada en sistemas internos de la plataforma con el objetivo de administrar correctamente las órdenes y el funcionamiento general del servicio.',
					},
				],
			},
			{
				title: 'Uso de la información',
				blocks: [
					{
						type: 'paragraph',
						text: 'La información recopilada es utilizada exclusivamente para fines relacionados con la operación de la tienda, incluyendo:',
					},
					{
						type: 'list',
						items: [
							'Procesar y gestionar pedidos realizados por los clientes.',
							'Coordinar y dar seguimiento a las entregas.',
							'Comunicarse con los clientes respecto al estado de sus compras.',
							'Brindar soporte y atención al cliente.',
							'Resolver consultas, solicitudes o incidencias relacionadas con pedidos.',
							'Mantener registros históricos de órdenes para fines administrativos.',
							'Mejorar la experiencia general de uso de la plataforma.',
						],
					},
					{
						type: 'paragraph',
						text: 'MarketByte no utiliza la información de los clientes para campañas publicitarias externas ni para el envío masivo de promociones no solicitadas.',
					},
				],
			},
			{
				title: 'Protección de los datos',
				blocks: [
					{
						type: 'paragraph',
						text: 'Con el fin de proteger la información de nuestros clientes, MarketByte aplica medidas básicas de seguridad orientadas a prevenir accesos no autorizados, pérdidas accidentales o alteraciones de la información.',
					},
					{ type: 'paragraph', text: 'Entre estas medidas se incluyen:' },
					{
						type: 'list',
						items: [
							'Acceso restringido a la información almacenada.',
							'Utilización de mecanismos de validación en formularios para reducir errores de captura.',
							'Protección de los sistemas utilizados para el almacenamiento de datos.',
							'Monitoreo y mantenimiento periódico de la plataforma.',
							'Aplicación de buenas prácticas de desarrollo para proteger la integridad de la información.',
						],
					},
					{
						type: 'paragraph',
						text: 'Aunque se implementan medidas razonables de seguridad, ningún sistema tecnológico puede garantizar una protección absoluta frente a todos los riesgos existentes.',
					},
				],
			},
			{
				title: 'Compartición de información',
				blocks: [
					{
						type: 'paragraph',
						text: 'MarketByte no vende, alquila ni comparte información personal de sus clientes con terceros.',
					},
					{
						type: 'paragraph',
						text: 'Toda la información recopilada se utiliza exclusivamente para la gestión interna de la plataforma y la atención de los servicios ofrecidos por la tienda.',
					},
				],
			},
			{
				title: 'Derechos de los usuarios',
				blocks: [
					{ type: 'paragraph', text: 'Los clientes pueden solicitar en cualquier momento:' },
					{
						type: 'list',
						items: [
							'La consulta de la información registrada sobre sus pedidos.',
							'La corrección o actualización de información incorrecta.',
							'La eliminación de información personal que ya no sea necesaria para la gestión de una orden.',
							'La actualización de sus datos de contacto.',
							'La aclaración de cualquier aspecto relacionado con el tratamiento de sus datos.',
						],
					},
					{
						type: 'paragraph',
						text: 'Las solicitudes serán atendidas por el equipo de atención al cliente a través de los canales oficiales de contacto de la plataforma.',
					},
				],
			},
			{
				title: 'Información sobre pagos',
				blocks: [
					{
						type: 'paragraph',
						text: 'MarketByte utiliza un sistema de pagos completamente simulado con fines académicos.',
					},
					{ type: 'paragraph', text: 'Por esta razón:' },
					{
						type: 'list',
						items: [
							'No se solicitan números reales de tarjetas de crédito o débito.',
							'No se almacenan datos bancarios de los clientes.',
							'No se procesan transacciones financieras reales.',
							'No se realizan cargos económicos a los usuarios.',
						],
					},
					{
						type: 'paragraph',
						text: 'Los métodos de pago mostrados durante el proceso de compra tienen únicamente fines demostrativos y educativos.',
					},
				],
			},
			{
				title: 'Actualizaciones de esta política',
				blocks: [
					{
						type: 'paragraph',
						text: 'MarketByte podrá actualizar esta Política de Privacidad cuando sea necesario para reflejar cambios en la plataforma, mejoras en los servicios o modificaciones en los procedimientos internos.',
					},
					{
						type: 'paragraph',
						text: 'Se recomienda a los usuarios revisar periódicamente esta sección para mantenerse informados sobre el manejo de su información.',
					},
				],
			},
		],
	},
	{
		slug: 'preguntas-frecuentes',
		title: 'Preguntas frecuentes (FAQ)',
		sections: [
			{
				title: 'Compras',
				blocks: [
					{
						type: 'faq',
						items: [
							{
								question: '¿Necesito crear una cuenta para realizar una compra?',
								answer:
									'No. En MarketByte puede realizar sus compras como invitado, por lo que no es necesario crear una cuenta ni registrarse para completar un pedido.',
							},
							{
								question: '¿Cómo puedo realizar una compra en MarketByte?',
								answer:
									'Realizar una compra es muy sencillo. Navegue por nuestro catálogo de productos, agregue los artículos que desee al carrito de compras y, cuando esté listo, acceda al carrito para completar el proceso de compra siguiendo los pasos indicados por la plataforma.',
							},
							{
								question: '¿Puedo comprar varios productos en una misma orden?',
								answer:
									'Sí. Puede agregar uno o varios productos al carrito de compras y finalizar su compra en una única orden, siempre que los productos seleccionados se encuentren disponibles.',
							},
							{
								question: '¿Puedo modificar mi pedido después de haberlo confirmado?',
								answer:
									'No. Una vez que la orden ha sido confirmada, no es posible realizar modificaciones en los productos, cantidades o datos de entrega asociados al pedido. Le recomendamos revisar cuidadosamente la información antes de finalizar su compra.',
							},
							{
								question: '¿Cómo puedo consultar el estado de mi pedido?',
								answer:
									'Puede consultar el estado de su pedido a través de nuestros canales oficiales de atención al cliente. Para agilizar la gestión, tenga a mano el número de orden que recibió al finalizar la compra.',
							},
							{
								question: '¿Los precios mostrados incluyen impuestos?',
								answer:
									'No. Los precios del catálogo se muestran sin impuestos. El IVA y el costo de envío (si aplica) se detallan en el resumen de compra antes de finalizar el pedido.',
							},
						],
					},
				],
			},
			{
				title: 'Pagos',
				blocks: [
					{
						type: 'faq',
						items: [
							{
								question: '¿Qué métodos de pago acepta MarketByte?',
								answer:
									'MarketByte utiliza un sistema de pagos simulado con fines académicos. Durante el proceso de compra se muestran diferentes opciones de pago para representar escenarios reales de una tienda en línea.',
							},
							{
								question: '¿Se realizan cobros reales dentro de la plataforma?',
								answer:
									'No. MarketByte es un proyecto académico y no procesa transacciones financieras reales. Ningún método de pago genera cargos económicos ni movimientos bancarios.',
							},
							{
								question: '¿Se almacenan datos de tarjetas o cuentas bancarias?',
								answer:
									'No. MarketByte no solicita, procesa ni almacena información financiera real, como números de tarjetas, cuentas bancarias o credenciales de pago. Todas las operaciones relacionadas con los pagos son completamente simuladas.',
							},
						],
					},
				],
			},
			{
				title: 'Envíos',
				blocks: [
					{
						type: 'faq',
						items: [
							{
								question: '¿Realizan envíos a todo Costa Rica?',
								answer:
									'Sí. MarketByte ofrece cobertura de entrega en todo el territorio nacional, sujeto a las condiciones de acceso de cada ubicación.',
							},
							{
								question: '¿Cuánto tiempo tarda en llegar mi pedido?',
								answer:
									'Los pedidos pueden requerir hasta 3 días hábiles para su preparación y coordinación logística. Posteriormente, la entrega puede realizarse en un plazo de hasta 10 días hábiles adicionales, dependiendo de la ubicación y características del pedido.',
							},
							{
								question: '¿Los muebles y productos de gran tamaño tienen condiciones especiales de entrega?',
								answer:
									'Sí. Algunos muebles y artículos voluminosos pueden requerir coordinación adicional y tiempos de entrega superiores a los habituales debido a sus dimensiones, peso o requerimientos logísticos especiales.',
							},
						],
					},
				],
			},
			{
				title: 'Devoluciones',
				blocks: [
					{
						type: 'faq',
						items: [
							{
								question: '¿Puedo devolver un producto?',
								answer:
									'Sí. Dispone de hasta 30 días naturales después de recibir su pedido para solicitar una devolución.',
							},
							{
								question: '¿Qué condiciones debe cumplir un producto para ser devuelto?',
								answer:
									'Para ser elegible para devolución, el producto debe encontrarse sin uso, en buen estado y conservar su empaque original junto con todos sus accesorios y componentes.',
							},
							{
								question: '¿Existen productos que no pueden devolverse?',
								answer:
									'Sí. No se aprueban devoluciones voluntarias cuando la solicitud se presenta después de los 30 días naturales, cuando el producto fue utilizado después de recibirlo o cuando no conserva su empaque original o le faltan accesorios o componentes. Los reclamos por daños o defectos se atienden por separado.',
							},
							{
								question: '¿Qué debo hacer si recibo un producto dañado o defectuoso?',
								answer:
									'Si recibe un producto dañado o defectuoso, debe comunicarse con nuestro equipo de atención al cliente lo antes posible. Dependiendo del caso, podrá solicitar un reemplazo del producto o gestionar un reembolso.',
							},
						],
					},
				],
			},
			{
				title: 'Atención al cliente',
				blocks: [
					{
						type: 'faq',
						items: [
							{
								question: '¿Cómo puedo contactar al servicio de atención al cliente?',
								answer:
									'Puede comunicarse con nuestro equipo de atención al cliente por correo electrónico (soporte@marketbyte.com) o por teléfono y WhatsApp (+506 8888-8888). Nuestros asesores estarán disponibles para ayudarle con consultas relacionadas con pedidos, entregas, devoluciones o cualquier otra gestión relacionada con la plataforma.',
							},
						],
					},
				],
			},
		],
	},
]