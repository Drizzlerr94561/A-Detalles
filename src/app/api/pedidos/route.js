import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser, verifyIsAdmin } from "@/lib/auth";

// GET: Obtener pedidos (Historial del cliente o todos si es Administrador)
export async function GET() {
  try {
    const usuario = await getAuthenticatedUser();
    if (!usuario) {
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });
    }

    const isAdmin = await verifyIsAdmin();

    let pedidos = [];
    if (isAdmin) {
      // El administrador ve todos los pedidos de la tienda
      pedidos = await prisma.pedido.findMany({
        orderBy: { createdAt: "desc" },
      });
    } else {
      // El cliente solo ve sus propios pedidos
      pedidos = await prisma.pedido.findMany({
        where: { usuarioId: usuario.id },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({ pedidos, success: true });
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    return NextResponse.json({ error: "Error al consultar pedidos." }, { status: 500 });
  }
}

// POST: Registrar un nuevo pedido en MySQL y generar el texto para WhatsApp
export async function POST(request) {
  try {
    const usuario = await getAuthenticatedUser();
    const body = await request.json();

    const {
      clienteNombre,
      clienteTelefono,
      clienteEmail,
      compradorNombre,
      compradorTelefono,
      metodoPago,
      items,
      total,
      direccionEntrega,
      barrioEntrega,
      destinatario,
      telefonoDestinatario,
      fechaEntrega,
      mensajeTarjeta,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "El carrito está vacío." }, { status: 400 });
    }

    if (!direccionEntrega || !direccionEntrega.trim()) {
      return NextResponse.json({ error: "La dirección de entrega es obligatoria." }, { status: 400 });
    }

    // Generar código único de pedido (ej: AD-2041)
    let codigo = "";
    let existe = true;
    while (existe) {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      codigo = `AD-${randomNum}`;
      const previo = await prisma.pedido.findUnique({ where: { codigo } });
      if (!previo) existe = false;
    }

    const nombreFinalComprador = compradorNombre?.trim() || clienteNombre?.trim() || usuario?.nombre || "Cliente";
    const telefonoFinalComprador = compradorTelefono?.trim() || clienteTelefono?.trim() || usuario?.telefono || "";
    const emailFinal = clienteEmail?.trim() || usuario?.email || null;
    const metodoPagoFinal = metodoPago?.trim() || "Por definir";

    const nuevoPedido = await prisma.pedido.create({
      data: {
        codigo,
        usuarioId: usuario?.id || null,
        clienteNombre: nombreFinalComprador,
        clienteTelefono: telefonoFinalComprador,
        clienteEmail: emailFinal,
        items: items,
        total: parseFloat(total) || 0,
        direccionEntrega: direccionEntrega.trim(),
        barrioEntrega: barrioEntrega?.trim() || null,
        destinatario: destinatario?.trim() || null,
        telefonoDestinatario: telefonoDestinatario?.trim() || null,
        fechaEntrega: fechaEntrega?.trim() || null,
        mensajeTarjeta: mensajeTarjeta?.trim() || null,
      },
    });

    // Formatear texto detallado, vivo y estético para WhatsApp usando Unicode escapes (imposible de corromper)
    const lineasItems = items
      .map((it, idx) => {
        let det = `*${idx + 1}. ${it.nombre}* (${it.cantidad}x) - $${(Number(it.precio) * Number(it.cantidad)).toLocaleString("es-CO")}`;
        if (it.colorRosas) {
          det += `\n   \u{1F339} *Color de Rosas:* ${it.colorRosas}`;
        }
        if (it.numRosas) {
          det += `\n   \u{1F339} *Rosas en el ramo:* ${it.numRosas} rosas`;
        }
        if (it.tamanoPelucheCombo) {
          det += `\n   \u{1F9F8} *Tamaño del Peluche:* ${it.tamanoPelucheCombo}`;
        }
        if (it.nombreTermoMug) {
          det += `\n   \u{270D}\u{FE0F} *Personalización / Nombre:* "${it.nombreTermoMug}"`;
        }
        if (it.numFotosCuadro) {
          det += `\n   \u{1F5BC}\u{FE0F} *Fotos a incluir:* ${it.numFotosCuadro} ${it.numFotosCuadro === 1 ? "foto" : "fotos"}`;
        }
        if (it.colorFondoSpotify) {
          det += `\n   \u{1F3A8} *Color de Fondo:* ${it.colorFondoSpotify}`;
        }
        if (it.opcionAlbumFotos) {
          det += `\n   \u{1F4D6} *Opción Álbum:* ${it.opcionAlbumFotos}`;
        }
        if (it.adicionales && Array.isArray(it.adicionales) && it.adicionales.length > 0) {
          det += `\n   \u{2728} *Adicionales:* ${it.adicionales.join(", ")}`;
        }
        if (it.mensajeTarjeta) {
          det += `\n   \u{1F48C} *Dedicatoria:* "${it.mensajeTarjeta}"`;
        }
        return det;
      })
      .join("\n\n");

    const whatsappText = `\u{1F338} *¡Hola A’Detalles! Quiero confirmar mi pedido #${codigo}:* \u{1F338}

\u{1F4E6} *PRODUCTOS SOLICITADOS:*
${lineasItems}

\u{1F4B0} *TOTAL FINAL:* $${Number(total).toLocaleString("es-CO")}
\u{1F4B3} *MÉTODO DE PAGO:* ${metodoPagoFinal}

\u{1F464} *QUIEN ENVÍA (COMPRADOR):*
• *Nombre:* ${nombreFinalComprador}
${telefonoFinalComprador ? `• *Teléfono:* ${telefonoFinalComprador}` : ""}

\u{1F381} *DATOS DE ENTREGA (DESTINATARIO):*
• *Recibe:* ${destinatario?.trim() || nombreFinalComprador}
${telefonoDestinatario ? `• *Teléfono Contacto:* ${telefonoDestinatario.trim()}` : ""}
• *Dirección:* ${direccionEntrega.trim()}${barrioEntrega ? ` (${barrioEntrega.trim()}, Barranquilla)` : " (Barranquilla)"}
${fechaEntrega?.trim() ? `• *Fecha/Hora deseada:* ${fechaEntrega.trim()}` : ""}
${mensajeTarjeta?.trim() ? `\u{1F48C} *Mensaje Tarjeta:* "${mensajeTarjeta.trim()}"` : ""}

\u{2728} _Quedo atento/a para coordinar el pago y confirmar la entrega. ¡Muchas gracias!_ \u{1F495}`.trim();

    const rawPhone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "573106629289";
    const cleanPhone = rawPhone.replace(/\D/g, "");
    const whatsappUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappText)}`
      : `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;

    return NextResponse.json({
      ok: true,
      pedido: nuevoPedido,
      codigo,
      whatsappText,
      whatsappPhone: cleanPhone || null,
      whatsappUrl,
    }, { status: 201 });
  } catch (error) {
    console.error("Error al registrar pedido:", error);
    return NextResponse.json({ error: "Error al registrar pedido." }, { status: 500 });
  }
}

// DELETE: Eliminar un pedido del panel (Exclusivo Administrador)
export async function DELETE(request) {
  try {
    const admin = await verifyIsAdmin();
    if (!admin) {
      return NextResponse.json({ error: "No autorizado. Solo el administrador puede eliminar pedidos." }, { status: 403 });
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

    const pedidoId = parseInt(id, 10);
    if (isNaN(pedidoId)) {
      return NextResponse.json({ error: "ID de pedido inválido." }, { status: 400 });
    }

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
      mensaje: `Pedido #${pedidoExistente.codigo} eliminado exitosamente.`,
    });
  } catch (error) {
    console.error("Error al eliminar pedido:", error);
    return NextResponse.json({ error: "Error al eliminar el pedido." }, { status: 500 });
  }
}
