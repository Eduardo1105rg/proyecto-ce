import { UMBRAL_ENVIO_GRATIS } from '../../services/carritoCalculos'
import { formatPrice } from '../../utils/formatPrice'
import type { Policy } from '../../types/policy'

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
		sections: [],
	},
	{
		slug: 'devoluciones',
		title: 'Política de devoluciones',
		sections: [],
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
						// El monto sale de la misma constante que usa el carrito, para que
						// la política nunca contradiga el cálculo real.
						type: 'paragraph',
						text: `Las compras con un subtotal igual o superior a ${formatPrice(UMBRAL_ENVIO_GRATIS)} califican para envío gratuito. En los pedidos que no califican para envío gratuito, se aplicará el costo de envío correspondiente según las reglas de cálculo del sistema.`,
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
									'Sí. Los productos personalizados, fabricados bajo pedido o que hayan sido armados específicamente para el cliente no son elegibles para devolución.',
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