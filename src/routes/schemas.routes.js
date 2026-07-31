/**
 * @openapi
 * components:
 *   schemas:
 *
 *     # ── Autenticación ──────────────────────────────────────────────────────
 *     LoginInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: admin@lenosrellenos.com
 *         password:
 *           type: string
 *           format: password
 *           example: miPassword123
 *
 *     LoginResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT Bearer token para usar en rutas protegidas.
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         usuario:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               example: 64a1b2c3d4e5f6789abcdef0
 *             nombre:
 *               type: string
 *               example: Admin Principal
 *             email:
 *               type: string
 *               example: admin@lenosrellenos.com
 *             rol:
 *               type: string
 *               enum: [admin, editor, viewer]
 *               example: admin
 *
 *     # ── Productos ──────────────────────────────────────────────────────────
 *     ProductoInput:
 *       type: object
 *       required:
 *         - nombre
 *         - precio
 *         - stock
 *         - categoria
 *       properties:
 *         nombre:
 *           type: string
 *           example: Leño Relleno Clásico
 *         descripcion:
 *           type: string
 *           example: Con queso Oaxaca y champiñones
 *         precio:
 *           type: number
 *           minimum: 0
 *           example: 65.00
 *         imagen:
 *           type: string
 *           example: https://cdn.ejemplo.com/leno-clasico.jpg
 *         categoria:
 *           type: string
 *           example: Salados
 *         disponible:
 *           type: boolean
 *           example: true
 *         stock:
 *           type: integer
 *           minimum: 0
 *           example: 15
 *
 *     Producto:
 *       allOf:
 *         - $ref: '#/components/schemas/ProductoInput'
 *         - type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: 64a1b2c3d4e5f6789abcdef1
 *             createdAt:
 *               type: string
 *               format: date-time
 *             updatedAt:
 *               type: string
 *               format: date-time
 *
 *     # ── Pedidos ────────────────────────────────────────────────────────────
 *     ClienteInput:
 *       type: object
 *       required:
 *         - nombre
 *         - telefono
 *         - ubicacion
 *       properties:
 *         nombre:
 *           type: string
 *           example: Juan Pérez
 *         telefono:
 *           type: string
 *           example: "5512345678"
 *         ubicacion:
 *           type: string
 *           example: Calle Falsa 123, Col. Centro
 *
 *     ProductoSolicitado:
 *       type: object
 *       required:
 *         - id_producto
 *         - nombre
 *         - cantidad
 *         - precio_unitario
 *       properties:
 *         id_producto:
 *           type: string
 *           example: 64a1b2c3d4e5f6789abcdef0
 *         nombre:
 *           type: string
 *           example: Leño Relleno Clásico
 *         cantidad:
 *           type: integer
 *           minimum: 1
 *           example: 2
 *         precio_unitario:
 *           type: number
 *           example: 65.00
 *
 *     PedidoInput:
 *       type: object
 *       required:
 *         - cliente
 *         - productos_solicitados
 *         - total
 *       properties:
 *         cliente:
 *           $ref: '#/components/schemas/ClienteInput'
 *         productos_solicitados:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProductoSolicitado'
 *         total:
 *           type: number
 *           minimum: 0
 *           example: 130.00
 *         estado:
 *           type: string
 *           enum: [Pendiente, En preparacion, Entregado, Cancelado]
 *           example: Pendiente
 *         metodo_envio:
 *           type: string
 *           enum: [Domicilio, Recoger en Local]
 *           example: Domicilio
 *         observaciones:
 *           type: string
 *           example: Sin cebolla por favor
 *
 *     Pedido:
 *       allOf:
 *         - $ref: '#/components/schemas/PedidoInput'
 *         - type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: 64a1b2c3d4e5f6789abcdef2
 *             createdAt:
 *               type: string
 *               format: date-time
 *             updatedAt:
 *               type: string
 *               format: date-time
 *
 *     # ── WhatsApp ───────────────────────────────────────────────────────────
 *     ProductoWhatsApp:
 *       type: object
 *       required:
 *         - nombre
 *         - cantidad
 *         - precio_unitario
 *       properties:
 *         nombre:
 *           type: string
 *           example: Leño Relleno Clásico
 *         cantidad:
 *           type: integer
 *           minimum: 1
 *           example: 2
 *         precio_unitario:
 *           type: number
 *           example: 65.00
 *
 *     WhatsAppInput:
 *       type: object
 *       required:
 *         - cliente
 *         - productos_solicitados
 *         - total
 *       properties:
 *         cliente:
 *           $ref: '#/components/schemas/ClienteInput'
 *         productos_solicitados:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProductoWhatsApp'
 *         total:
 *           type: number
 *           minimum: 0
 *           example: 215.00
 *         observaciones:
 *           type: string
 *           example: Extra crema en el Especial
 *
 *     WhatsAppResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         pedido_id:
 *           type: string
 *           example: 64a1b2c3d4e5f6789abcdef2
 *         whatsapp_url:
 *           type: string
 *           example: https://wa.me/521XXXXXXXXXX?text=...
 *         message:
 *           type: string
 *           example: "🍕 *NUEVO PEDIDO*\n..."
 *
 *     # ── Errores genéricos ──────────────────────────────────────────────────
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: Descripción del error
 *
 *     ErrorWhatsApp:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: Descripción del error
 *         error:
 *           type: string
 *           example: Detalle técnico del error
 *
 *     # ── Vulnerabilidades ───────────────────────────────────────────────────
 *     VulnerabilidadInput:
 *       type: object
 *       required:
 *         - tipo
 *         - descripcion
 *         - fechaOcurrencia
 *         - accionesCorrectivas
 *       properties:
 *         tipo:
 *           type: string
 *           enum:
 *             - perdida_destruccion
 *             - robo_extravio_copia
 *             - acceso_no_autorizado
 *             - alteracion_no_autorizada
 *           example: acceso_no_autorizado
 *         descripcion:
 *           type: string
 *           example: Fuga de datos detectada en el endpoint
 *         fechaOcurrencia:
 *           type: string
 *           format: date-time
 *           example: "2026-07-31T12:00:00Z"
 *         accionesCorrectivas:
 *           type: string
 *           example: Se revoca el token comprometido
 *
 *     Vulnerabilidad:
 *       allOf:
 *         - $ref: '#/components/schemas/VulnerabilidadInput'
 *         - type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: 64a1b2c3d4e5f6789abcdef9
 *             reportadoPor:
 *               type: string
 *               example: 64a1b2c3d4e5f6789abcdef0
 *             estado:
 *               type: string
 *               enum: [abierta, en_atencion, resuelta]
 *               example: abierta
 *             createdAt:
 *               type: string
 *               format: date-time
 *             updatedAt:
 *               type: string
 *               format: date-time
 */

// Este archivo solo contiene definiciones de esquemas OpenAPI.
// No exporta nada — swagger-jsdoc lo escanea como parte del glob ./src/routes/*.js
