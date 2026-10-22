import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser, verifyIsAdmin } from "@/lib/auth";
import { ErrorPedido, validarIdPositivo, validarPedidoCatalogo, respuestaErrorPedido } from "@/lib/pedidosValidacion";

// GET: Obtener pedidos (Historial del cliente o todos si es Administrador)
export async function GET() {
  try {
    const usuario = await getAuthenticatedUser();
    if (!usuario) {
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });
    }

    const isAdmin = await verifyIsAdmin();

    let pedidosDB = [];
    if (isAdmin) {
      pedidosDB = await prisma.pedido.findMany({
        orderBy: { createdAt: "desc" },
      });
    } else {
      pedidosDB = await prisma.pedido.findMany({
        where: { usuarioId: usuario.id },
        orderBy: { createdAt: "desc" },
      });
    }

    const pedidos = (pedidosDB || []).map((p) => {
      let itemsParsed = [];
      if (Array.isArray(p?.items)) {
        itemsParsed = p.items;
      } else if (typeof p?.items === "string") {
        try {
          const parsed = JSON.parse(p.items);
          itemsParsed = Array.isArray(parsed) ? parsed : [];
        } catch {
          itemsParsed = [];
        }
      }

      return {
        ...p,
        items: itemsParsed,
        estado: p?.estado || "PENDIENTE",
      };
    });

    return NextResponse.json({ pedidos, success: true });
  } catch (error) {
    console.error("Error al obtener pedidos desde MySQL:", error);
    return NextResponse.json({ error: "Error al consultar pedidos en la base de datos." }, { status: 500 });
  }
}

// POST: Registrar un nuevo pedido en MySQL y generar el texto para WhatsApp
export async function POST(request) {
  try {
    const usuario = await getAuthenticatedUser();
    let body;
    try { body = await request.json(); } catch { throw new ErrorPedido("La solicitud debe contener JSON válido."); }
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new ErrorPedido("Revisa los datos del pedido.");
    const leerTexto = (valor, nombre, maximo, obligatorio = false) => {
      if (valor === undefined || valor === null) {
        if (obligatorio) throw new ErrorPedido("El campo " + nombre + " es obligatorio.");
        return "";
      }
      if (typeof valor !== "string" || valor.trim().length > maximo || (obligatorio && !valor.trim())) throw new ErrorPedido("Revisa el campo " + nombre + ".");
      return valor.trim();
    };
    const direccionEntrega = leerTexto(body.direccionEntrega, "dirección de entrega", 255, true);
    const barrioEntrega = leerTexto(body.barrioEntrega, "barrio", 100);
    const destinatario = leerTexto(body.destinatario, "destinatario", 255);
    const telefonoDestinatario = leerTexto(body.telefonoDestinatario, "teléfono destinatario", 50);
    const fechaEntrega = leerTexto(body.fechaEntrega, "fecha de entrega", 100);
    const mensajeTarjeta = leerTexto(body.mensajeTarjeta, "mensaje", 2000);
    const nombreFinalComprador = leerTexto(body.compradorNombre ?? body.clienteNombre ?? usuario?.nombre ?? "Cliente", "nombre comprador", 255, true);
    const telefonoFinalComprador = leerTexto(body.compradorTelefono ?? body.clienteTelefono ?? usuario?.telefono, "teléfono comprador", 50);
    const emailFinal = leerTexto(body.clienteEmail ?? usuario?.email, "correo", 255) || null;
    const metodoPagoFinal = leerTexto(body.metodoPago, "método de pago", 100) || "Por definir";
    let nuevoPedido;
    let validado;
    let codigo;
    // Validate and insert under the same isolation boundary as catalog changes.
    for (let intento = 0; intento < 3; intento++) {
      codigo = ("AD-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8)).toUpperCase();
      try {
        const resultado = await prisma.$transaction(async (tx) => {
          const cotizacion = await validarPedidoCatalogo(body.items, tx);
          const pedido = await tx.pedido.create({ data: {
            codigo, usuarioId: usuario?.id || null, clienteNombre: nombreFinalComprador,
            clienteTelefono: telefonoFinalComprador, clienteEmail: emailFinal,
            items: cotizacion.items, total: cotizacion.total, direccionEntrega,
            barrioEntrega: barrioEntrega || null, destinatario: destinatario || null,
            telefonoDestinatario: telefonoDestinatario || null, fechaEntrega: fechaEntrega || null,
            mensajeTarjeta: mensajeTarjeta || null, estado: "PENDIENTE",
          } });
          return { pedido, cotizacion };
        }, { isolationLevel: "Serializable" });
        nuevoPedido = resultado.pedido;
        validado = resultado.cotizacion;
        break;
      } catch (error) {
        if (!["P2002", "P2034"].includes(error?.code) || intento === 2) throw error;
      }
    }
    const { items, subtotal: subtotalCalculado, costoEnvio: envioCalculado, total: totalFinalPagar } = validado;

    // Formatear texto detallado y elegante para WhatsApp usando exclusivamente símbolos comprobados (✦, ★, •, ✓, ✿)
    const lineasItems = items
      .map((it, idx) => {
        let det = `*${idx + 1}. ${it.nombre}* (${it.cantidad}x) - $${(Number(it.precio) * Number(it.cantidad)).toLocaleString("es-CO")}`;
        if (it.colorRosas) {
          det += `\n   • *Color de Rosas:* ${it.colorRosas}`;
        }
        if (it.numRosas) {
          det += `\n   • *Rosas en el ramo:* ${it.numRosas} rosas`;
        }
        if (it.tamanoPelucheCombo) {
          det += `\n   • *Tamaño del Peluche:* ${it.tamanoPelucheCombo}`;
        }
        if (it.nombreTermoMug) {
          det += `\n   • *Personalización / Nombre:* "${it.nombreTermoMug}"`;
        }
        if (it.numFotosCuadro) {
          det += `\n   • *Fotos a incluir:* ${it.numFotosCuadro} ${it.numFotosCuadro === 1 ? "foto" : "fotos"}`;
        }
        if (it.colorFondoSpotify) {
          det += `\n   • *Color de Fondo:* ${it.colorFondoSpotify}`;
        }
        if (it.opcionAlbumFotos) {
          det += `\n   • *Opción Álbum:* ${it.opcionAlbumFotos}`;
        }
        if (it.adicionales && Array.isArray(it.adicionales) && it.adicionales.length > 0) {
          det += `\n   • *Adicionales:* ${it.adicionales.join(", ")}`;
        }
        if (it.mensajeTarjeta) {
          det += `\n   • *Dedicatoria:* "${it.mensajeTarjeta}"`;
        }
        return det;
      })
      .join("\n\n");

    const whatsappText = `✦ *¡Hola A’Detalles! Quiero confirmar mi pedido #${codigo}:* ✦

★ *PRODUCTOS SOLICITADOS:*
${lineasItems}

★ *RESUMEN DEL PEDIDO:*
• *Subtotal Regalos:* $${subtotalCalculado.toLocaleString("es-CO")}
• 🚚 *Domicilio (Barranquilla):* $${envioCalculado.toLocaleString("es-CO")}
★ *TOTAL FINAL A PAGAR:* $${totalFinalPagar.toLocaleString("es-CO")}
✓ *MÉTODO DE PAGO:* ${metodoPagoFinal}

★ *QUIEN ENVÍA (COMPRADOR):*
• *Nombre:* ${nombreFinalComprador}
${telefonoFinalComprador ? `• *Teléfono:* ${telefonoFinalComprador}` : ""}

✦ *DATOS DE ENTREGA (DESTINATARIO):*
• *Recibe:* ${destinatario?.trim() || nombreFinalComprador}
${telefonoDestinatario ? `• *Teléfono Contacto:* ${telefonoDestinatario.trim()}` : ""}
• *Dirección:* ${direccionEntrega.trim()}${barrioEntrega ? ` (${barrioEntrega.trim()}, Barranquilla)` : " (Barranquilla)"}
${fechaEntrega?.trim() ? `• *Fecha/Hora deseada:* ${fechaEntrega.trim()}` : ""}
${mensajeTarjeta?.trim() ? `• *Mensaje Tarjeta:* "${mensajeTarjeta.trim()}"` : ""}

✦ _Quedo atento/a para coordinar el pago y confirmar la entrega. ¡Muchas gracias!_ ✦`.trim();

    const rawPhone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "573004633576";
    let cleanPhone = rawPhone.replace(/\D/g, "");
    if (cleanPhone.length === 10) {
      cleanPhone = `57${cleanPhone}`;
    }
    const whatsappUrl = `https://wa.me/${cleanPhone || "573004633576"}?text=${encodeURIComponent(whatsappText)}`;

    return NextResponse.json(
      {
        ok: true,
        pedido: nuevoPedido,
        codigo,
        whatsappText,
        whatsappPhone: cleanPhone || null,
        whatsappUrl,
        subtotal: subtotalCalculado, costoEnvio: envioCalculado, total: totalFinalPagar,
      },
      { status: 201 }
    );
  } catch (error) {
    const respuesta = respuestaErrorPedido(error);
    return NextResponse.json(respuesta.body, { status: respuesta.status });
  }
}

// DELETE: Eliminar un pedido del panel (Exclusivo Administrador)
export async function DELETE(request) {
  try {
    const admin = await verifyIsAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: "No autorizado. Solo el administrador puede eliminar pedidos." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");

    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body?.id;
    }

    if (!id) {
      return NextResponse.json({ error: "Se requiere el ID del pedido a eliminar." }, { status: 400 });
    }

    const pedidoId = validarIdPositivo(id);

    const pedidoExistente = await prisma.pedido.findUnique({
      where: { id: pedidoId },
    });

    if (!pedidoExistente) {
      return NextResponse.json({ error: "El pedido no existe o ya fue eliminado." }, { status: 404 });
    }

    await prisma.pedido.delete({
      where: { id: pedidoId },
    });

    return NextResponse.json({
      success: true,
      id: pedidoId,
      codigo: pedidoExistente.codigo,
      mensaje: `Pedido #${pedidoExistente.codigo} eliminado exitosamente de MySQL.`,
    });
  } catch (error) {
    const respuesta = respuestaErrorPedido(error);
    return NextResponse.json(respuesta.body, { status: respuesta.status });
  }
}

// PATCH: Actualizar el estado de un pedido (ej: PENDIENTE -> VENDIDO)
export async function PATCH(request) {
  try {
    const admin = await verifyIsAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: "No autorizado. Solo el administrador puede cambiar el estado de un pedido." },
        { status: 403 }
      );
    }

    let body;
    try { body = await request.json(); } catch { throw new ErrorPedido("La solicitud debe contener JSON válido."); }
    const { id, estado } = body || {};

    if (!id || !estado) {
      return NextResponse.json({ error: "Se requiere ID de pedido y estado." }, { status: 400 });
    }

    const pedidoId = validarIdPositivo(id);

    if (!["PENDIENTE", "VENDIDO"].includes(estado)) throw new ErrorPedido("Elige un estado de pedido válido.");
    const pedidoActualizado = await prisma.pedido.update({ where: { id: pedidoId }, data: { estado } });
    return NextResponse.json({ success: true, pedido: pedidoActualizado, mensaje: "Pedido actualizado a " + estado + "." });
  } catch (error) {
    const respuesta = respuestaErrorPedido(error);
    return NextResponse.json(respuesta.body, { status: respuesta.status });
  }
}



