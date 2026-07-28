/* eslint-disable camelcase, max-len, no-underscore-dangle, no-restricted-syntax */

export const generarEnlaceWhatsApp = (datosPedido) => {
  const {
    cliente, productos_solicitados, total, observaciones,
  } = datosPedido;
  const telefonoNegocio = process.env.WHATSAPP_PHONE_NUMBER || '524181234567';

  // Emojis de alta compatibilidad en todos los dispositivos
  const eLeno = String.fromCodePoint(0x1F525); // 🔥 (Fuego)
  const eCliente = String.fromCodePoint(0x1F464); // 👤 (Cliente)
  const eBolsa = String.fromCodePoint(0x1F6CD); // 🛍️ (Bolsa de compras)
  const eDinero = String.fromCodePoint(0x1F4B5); // 💵 (Billetes)
  const eLapis = String.fromCodePoint(0x270D); // ✍️ (Lápiz)

  let mensaje = `${eLeno} *NUEVO PEDIDO - LEÑOS RELLENOS*\n\n`;
  mensaje += `${eCliente} *Datos del Cliente:*\n`;
  mensaje += `• *Nombre:* ${cliente.nombre}\n`;
  mensaje += `• *Teléfono:* ${cliente.telefono}\n`;
  mensaje += `• *Ubicación:* ${cliente.ubicacion}\n\n`;

  mensaje += `${eBolsa} *Productos Solicitados:*\n`;
  productos_solicitados.forEach((item) => {
    const subtotal = item.cantidad * item.precio_unitario;
    mensaje += `• ${item.nombre} x${item.cantidad} - $${item.precio_unitario} (Subtotal: $${subtotal})\n`;
  });

  mensaje += `\n${eDinero} *Total de la Orden:* $${total}\n`;

  if (observaciones) {
    mensaje += `\n${eLapis} *Observaciones:* ${observaciones}\n`;
  }

  const numLimpio = telefonoNegocio.replace(/[^0-9]/g, '');
  const url = `https://api.whatsapp.com/send?phone=${numLimpio}&text=${encodeURIComponent(mensaje)}`;

  return {
    url,
    mensaje_texto: mensaje,
  };
};
