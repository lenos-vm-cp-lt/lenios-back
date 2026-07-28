/* eslint-disable camelcase, max-len, no-underscore-dangle, no-restricted-syntax */

import { generarEnlaceWhatsApp } from '../services/whatsapp.service.js';
import Pedido from '../models/Pedido.js';

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
      return res.status(400).json({
        success: false,
        message: 'La información del cliente (nombre, telefono, ubicacion) es obligatoria.',
      });
    }

    // Validación: Productos solicitados obligatorio y no vacío
    if (!productos_solicitados || !Array.isArray(productos_solicitados) || productos_solicitados.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Debe incluir al menos un producto solicitado.',
      });
    }

    // Validación: Validar campos mínimos de cada producto
    for (const prod of productos_solicitados) {
      if (!prod.nombre || !prod.cantidad || !prod.precio_unitario) {
        return res.status(400).json({
          success: false,
          message: 'Cada producto solicitado debe tener nombre, cantidad y precio_unitario.',
        });
      }
    }

    // Validación: Total obligatorio y válido
    if (total === undefined || typeof total !== 'number' || total < 0) {
      return res.status(400).json({
        success: false,
        message: 'El total de la orden es obligatorio y debe ser un número no negativo.',
      });
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
    return res.status(201).json({
      success: true,
      pedido_id: nuevoPedido._id,
      whatsapp_url: dataWhatsApp.url,
      message: dataWhatsApp.mensaje_texto,
    });
  } catch (error) {
    console.error('Error en crearMensajeWhatsApp:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Ocurrió un error interno en el servidor.',
      error: error.message,
    });
  }
};
