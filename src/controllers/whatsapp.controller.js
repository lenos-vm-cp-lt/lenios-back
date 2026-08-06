/* eslint-disable camelcase, max-len, no-underscore-dangle, no-restricted-syntax */

import { generarEnlaceWhatsApp } from '../services/whatsapp.service.js';
import Pedido from '../models/Pedido.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Controlador para validar el cuerpo de la petición, guardar el pedido en MongoDB Atlas y crear el mensaje estructurado de WhatsApp.
 */
export const crearMensajeWhatsApp = async (req, res) => {
  // Configurar el encabezado para asegurar codificación UTF-8 en emojis y caracteres especiales
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  try {
    const {
      cliente, productos_solicitados, total, observaciones,
    } = req.body;

    // Validación: Cliente obligatorio con nombre, teléfono y ubicación
    if (!cliente || !cliente.nombre || !cliente.telefono || !cliente.ubicacion) {
      return errorResponse(
        res,
        400,
        'La información del cliente (nombre, telefono, ubicacion) es obligatoria.',
      );
    }

    // Validación: Productos solicitados obligatorio y no vacío
    if (!productos_solicitados || !Array.isArray(productos_solicitados) || productos_solicitados.length === 0) {
      return errorResponse(res, 400, 'Debe incluir al menos un producto solicitado.');
    }

    // Validación: Validar campos mínimos de cada producto
    for (const prod of productos_solicitados) {
      if (!prod.nombre || !prod.cantidad || !prod.precio_unitario) {
        return errorResponse(
          res,
          400,
          'Cada producto solicitado debe tener nombre, cantidad y precio_unitario.',
        );
      }
    }

    // Validación: Total obligatorio y válido
    if (total === undefined || typeof total !== 'number' || total < 0) {
      return errorResponse(res, 400, 'El total de la orden es obligatorio y debe ser un número no negativo.');
    }

    // Guardar la orden en MongoDB Atlas
    const nuevoPedido = await Pedido.create({
      cliente,
      productos_solicitados,
      total,
      observaciones,
      estado: 'Pendiente',
    });

    // Generar el enlace y texto del mensaje de WhatsApp a través del servicio
    const dataWhatsApp = generarEnlaceWhatsApp({
      cliente,
      productos_solicitados,
      total,
      observaciones,
    });

    // Responder HTTP 201 Created con el ID del pedido y la URL de WhatsApp
    return successResponse(res, 201, 'Pedido creado y enlace de WhatsApp generado exitosamente', {
      pedido_id: nuevoPedido._id,
      whatsapp_url: dataWhatsApp.url,
      whatsapp_message: dataWhatsApp.mensaje_texto,
    });
  } catch (error) {
    console.error('Error en crearMensajeWhatsApp:', error.message);
    return errorResponse(res, 500, 'Ocurrió un error interno en el servidor.', error.message);
  }
};
