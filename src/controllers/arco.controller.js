import nodemailer from 'nodemailer';
import Pedido from '../models/Pedido.js';
import SolicitudArco from '../models/SolicitudArco.js';
import { validarIdentidadCliente } from '../utils/validarIdentidadCliente.js';
import { registrarAuditoria } from '../utils/auditLog.js';
import { successResponse, errorResponse } from '../utils/response.js';

const IDENTIDAD_INVALIDA = 'No se pudo validar tu identidad. Verifica tu nombre y teléfono registrados.';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'lenosrellenos@gmail.com',
    pass: process.env.EMAIL_PASS || 'tmyq iqgs ykjg moaf',
  },
});

export async function solicitarAcceso(req, res) {
  try {
    const { telefono, nombre } = req.body;
    const cliente = await validarIdentidadCliente(req.params.id, telefono, nombre);

    if (!cliente) {
      registrarAuditoria({
        accion: 'ARCO_ACCESO',
        usuarioId: 'cliente_publico',
        recurso: 'Cliente',
        recursoId: req.params.id,
        resultado: 'fallo',
      });
      return errorResponse(res, 401, IDENTIDAD_INVALIDA);
    }

    if (cliente.bloqueado || cliente.anonimizado) {
      return errorResponse(res, 410, 'Tus datos ya no están disponibles.');
    }

    await SolicitudArco.create({
      // eslint-disable-next-line no-underscore-dangle
      clienteId: cliente._id,
      tipo: 'acceso',
      respuesta: 'Se entregaron los datos personales registrados al titular.',
    });

    registrarAuditoria({
      accion: 'ARCO_ACCESO',
      usuarioId: 'cliente_publico',
      recurso: 'Cliente',
      // eslint-disable-next-line no-underscore-dangle
      recursoId: cliente._id,
      resultado: 'exito',
    });

    return successResponse(res, 200, 'Estos son tus datos personales registrados.', {
      nombre: cliente.nombre,
      telefono: cliente.telefono,
      ubicacion: cliente.ubicacion,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

export async function solicitarRectificacion(req, res) {
  try {
    const {
      telefono, nombre, nuevoNombre, nuevoTelefono, nuevaUbicacion,
    } = req.body;

    const cliente = await validarIdentidadCliente(req.params.id, telefono, nombre);
    if (!cliente) {
      registrarAuditoria({
        accion: 'ARCO_RECTIFICACION',
        usuarioId: 'cliente_publico',
        recurso: 'Cliente',
        recursoId: req.params.id,
        resultado: 'fallo',
      });
      return errorResponse(res, 401, IDENTIDAD_INVALIDA);
    }

    if (cliente.bloqueado || cliente.anonimizado) {
      return errorResponse(res, 410, 'Tus datos ya no están disponibles.');
    }

    if (nuevoNombre) cliente.nombre = nuevoNombre;
    if (nuevoTelefono) cliente.telefono = nuevoTelefono;
    if (nuevaUbicacion) cliente.ubicacion = nuevaUbicacion;
    await cliente.save();

    await SolicitudArco.create({
      // eslint-disable-next-line no-underscore-dangle
      clienteId: cliente._id,
      tipo: 'rectificacion',
      respuesta: 'Los datos personales fueron actualizados correctamente.',
    });

    registrarAuditoria({
      accion: 'ARCO_RECTIFICACION',
      usuarioId: 'cliente_publico',
      recurso: 'Cliente',
      // eslint-disable-next-line no-underscore-dangle
      recursoId: cliente._id,
      resultado: 'exito',
    });

    return successResponse(res, 200, 'Tus datos fueron actualizados correctamente.', {
      nombre: cliente.nombre,
      telefono: cliente.telefono,
      ubicacion: cliente.ubicacion,
    });
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
}

export async function solicitarBloqueo(req, res) {
  try {
    const { telefono, nombre, motivo } = req.body;
    const cliente = await validarIdentidadCliente(req.params.id, telefono, nombre);

    if (!cliente) {
      registrarAuditoria({
        accion: 'ARCO_BLOQUEO',
        usuarioId: 'cliente_publico',
        recurso: 'Cliente',
        recursoId: req.params.id,
        resultado: 'fallo',
      });
      return errorResponse(res, 401, IDENTIDAD_INVALIDA);
    }

    cliente.bloqueado = true;
    await cliente.save();

    await SolicitudArco.create({
      // eslint-disable-next-line no-underscore-dangle
      clienteId: cliente._id,
      tipo: 'oposicion',
      detalleSolicitud: motivo || '',
      respuesta: 'Tus datos personales fueron bloqueados.',
    });

    registrarAuditoria({
      accion: 'ARCO_BLOQUEO',
      usuarioId: 'cliente_publico',
      recurso: 'Cliente',
      // eslint-disable-next-line no-underscore-dangle
      recursoId: cliente._id,
      resultado: 'exito',
    });

    return successResponse(res, 200, 'Tus datos fueron bloqueados correctamente.');
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
}

export async function solicitarCancelacion(req, res) {
  try {
    const { telefono, nombre } = req.body;
    const cliente = await validarIdentidadCliente(req.params.id, telefono, nombre);

    if (!cliente) {
      registrarAuditoria({
        accion: 'ARCO_CANCELACION',
        usuarioId: 'cliente_publico',
        recurso: 'Cliente',
        recursoId: req.params.id,
        resultado: 'fallo',
      });
      return errorResponse(res, 401, IDENTIDAD_INVALIDA);
    }

    const telefonoOriginal = cliente.telefono;

    cliente.nombre = '[DATO ELIMINADO]';
    cliente.telefono = '[DATO ELIMINADO]';
    cliente.ubicacion = '[DATO ELIMINADO]';
    cliente.anonimizado = true;
    cliente.bloqueado = true;
    await cliente.save();

    await Pedido.updateMany(
      { 'cliente.telefono': telefonoOriginal },
      {
        $set: {
          'cliente.nombre': '[DATO ELIMINADO]',
          'cliente.telefono': '[DATO ELIMINADO]',
          'cliente.ubicacion': '[DATO ELIMINADO]',
        },
      },
    );

    await SolicitudArco.create({
      // eslint-disable-next-line no-underscore-dangle
      clienteId: cliente._id,
      tipo: 'cancelacion',
      respuesta: 'Tus datos personales fueron anonimizados.',
    });

    registrarAuditoria({
      accion: 'ARCO_CANCELACION',
      usuarioId: 'cliente_publico',
      recurso: 'Cliente',
      // eslint-disable-next-line no-underscore-dangle
      recursoId: cliente._id,
      resultado: 'exito',
    });

    return successResponse(res, 200, 'Tus datos fueron anonimizados correctamente.');
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
}

export async function crearSolicitudArco(req, res) {
  try {
    const {
      nombreCompleto, email, telefono, tipoDerecho, motivo,
    } = req.body;

    const folio = `ARCO-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const nuevaSolicitud = await SolicitudArco.create({
      folio,
      nombreCompleto: nombreCompleto || '',
      email: email || '',
      telefono: telefono || '',
      tipo: tipoDerecho || 'ACCESO',
      detalleSolicitud: motivo || '',
      estado: 'Pendiente',
      respuesta: '',
    });

    registrarAuditoria({
      accion: `SOLICITUD_ARCO_${tipoDerecho || 'GENERAL'}`,
      usuarioId: 'cliente_publico',
      recurso: 'SolicitudArco',
      // eslint-disable-next-line no-underscore-dangle
      recursoId: nuevaSolicitud._id,
      resultado: 'exito',
    });

    return successResponse(res, 201, 'Solicitud de derechos ARCO registrada exitosamente', {
      folio,
      mensaje: 'Su solicitud de derechos ARCO ha sido registrada exitosamente.',
      fechaRegistro: nuevaSolicitud.createdAt || new Date().toISOString(),
      detalles: {
        // eslint-disable-next-line no-underscore-dangle
        id: nuevaSolicitud._id,
        nombreCompleto,
        email,
        telefono,
        tipoDerecho,
        motivo,
      },
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

export async function obtenerSolicitudesArco(req, res) {
  try {
    const solicitudes = await SolicitudArco.find()
      .populate('clienteId', 'nombre telefono email')
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'Solicitudes ARCO obtenidas exitosamente', solicitudes);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

export async function actualizarSolicitudArco(req, res) {
  try {
    const { id } = req.params;
    const { estado, respuesta } = req.body;

    const solicitud = await SolicitudArco.findById(id);
    if (!solicitud) {
      return errorResponse(res, 404, 'Solicitud ARCO no encontrada');
    }

    if (estado !== undefined) {
      solicitud.estado = estado;
    }
    if (respuesta !== undefined) {
      solicitud.respuesta = respuesta;
    }

    await solicitud.save();

    const correoDestino = solicitud.email;
    if (correoDestino) {
      const mailOptions = {
        from: '"Oficial de Privacidad - Leños Rellenos" <no-reply@lenosrellenos.com>',
        to: correoDestino,
        subject: `Actualización de tu Solicitud ARCO (${solicitud.folio || id})`,
        html: `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <h2 style="color: #ea580c;">Actualización de Derechos ARCO</h2>
                <p>Hola, <strong>${solicitud.nombreCompleto || 'Titular'}</strong>:</p>
                <p>Te informamos que el estatus de tu solicitud de derechos ARCO ha sido actualizado.</p>
                <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 15px 0;">
                    <p style="margin: 5px 0;"><strong>Folio:</strong> ${solicitud.folio || id}</p>
                    <p style="margin: 5px 0;"><strong>Derecho:</strong> ${solicitud.tipo}</p>
                    <p style="margin: 5px 0;"><strong>Nuevo Estado:</strong> <span style="color: #d97706; font-weight: bold;">${solicitud.estado}</span></p>
                </div>
                <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin-top: 15px; border-left: 4px solid #f59e0b;">
                    <p style="margin: 0; font-weight: bold; color: #b45309;">Respuesta del Administrador:</p>
                    <p style="margin-top: 5px; color: #78350f;">${solicitud.respuesta || 'Sin comentarios adicionales.'}</p>
                </div>
                <p style="margin-top: 25px; font-size: 12px; color: #6b7280; text-align: center;">
                    Este es un mensaje automático emitido por el sistema de gestión de Leños Rellenos.
                </p>
            </div>
        `,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error al enviar el correo de notificación ARCO:', error);
        } else {
          console.log('Correo de notificación ARCO enviado con éxito:', info.response);
        }
      });
    }

    registrarAuditoria({
      accion: 'ARCO_ACTUALIZAR_ESTADO',
      // eslint-disable-next-line no-underscore-dangle
      usuarioId: req.user?._id || 'admin',
      recurso: 'SolicitudArco',
      recursoId: id,
      resultado: 'exito',
    });

    return successResponse(res, 200, 'Solicitud ARCO actualizada exitosamente', solicitud);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}
