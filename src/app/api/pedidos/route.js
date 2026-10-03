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
    const body = await request.json();

    const {
      clienteNombre,
      clienteTelefono,
      clienteEmail,
      compradorNombre,
      compradorTelefono,
      metodoPago,
      items,
      subtotal,
      costoEnvio,
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
    let codigo = `AD-${Math.floor(1000 + Math.random() * 9000)}`;
    try {
      let existe = true;
      let intentos = 0;
      while (existe && intentos < 5) {
        intentos++;
        const testCodigo = `AD-${Math.floor(1000 + Math.random() * 9000)}`;
        const previo = await prisma.pedido.findUnique({ where: { codigo: testCodigo } });
        if (!previo) {
          codigo = testCodigo;
          existe = false;
        }
      }
    } catch (e) {
      console.warn("Aviso al verificar unicidad de código de pedido en MySQL:", e?.message);
    }

    const nombreFinalComprador = compradorNombre?.trim() || clienteNombre?.trim() || usuario?.nombre || "Cliente";
    const telefonoFinalComprador = compradorTelefono?.trim() || clienteTelefono?.trim() || usuario?.telefono || "";
    const emailFinal = clienteEmail?.trim() || usuario?.email || null;
    const metodoPagoFinal = metodoPago?.trim() || "Por definir";

    const subtotalCalculado = subtotal ? Number(subtotal) : items.reduce((acc, i) => acc + (Number(i.precio) * Number(i.cantidad)), 0);
    const envioCalculado = costoEnvio !== undefined && costoEnvio !== null ? Number(costoEnvio) : 15000;
    const totalFinalPagar = total ? Number(total) : (subtotalCalculado + envioCalculado);

    // Sanitizar items para eliminar cualquier propiedad 'undefined' que Prisma rechace
    const itemsSanitizados = JSON.parse(JSON.stringify(items || []));

    const payloadData = {
      codigo,
      usuarioId: usuario?.id || null,
      clienteNombre: nombreFinalComprador,
      clienteTelefono: telefonoFinalComprador,
      clienteEmail: emailFinal,
      items: itemsSanitizados,
      total: totalFinalPagar,
      direccionEntrega: direccionEntrega.trim(),
      barrioEntrega: barrioEntrega?.trim() || null,
      destinatario: destinatario?.trim() || null,
      telefonoDestinatario: telefonoDestinatario?.trim() || null,
      fechaEntrega: fechaEntrega?.trim() || null,
      mensajeTarjeta: mensajeTarjeta?.trim() || null,
    };

    let nuevoPedido = null;
    try {
      // 1. Intentar crear incluyendo el campo 'estado'
      nuevoPedido = await prisma.pedido.create({
        data: {
          ...payloadData,
          estado: "PENDIENTE",
        },
      });
    } catch (firstError) {
      console.warn("Aviso: Fallo al insertar con campo estado. Intentando autorreparación de esquema o inserción RAW:", firstError?.message);
      try {
        // Intentar agregar la columna física 'estado' a la tabla si no existe en Railway
        await prisma.$executeRawUnsafe(`ALTER TABLE pedidos ADD COLUMN estado VARCHAR(50) DEFAULT 'PENDIENTE'`);
        nuevoPedido = await prisma.pedido.create({
          data: {
            ...payloadData,
            estado: "PENDIENTE",
          },
        });
      } catch (alterErr) {
        console.warn("Aviso: Ejecutando inserción RAW sin campo estado:", alterErr?.message);
        // Inserción RAW directa sin la columna 'estado'
        await prisma.$executeRawUnsafe(
          `INSERT INTO pedidos (codigo, usuarioId, clienteNombre, clienteTelefono, clienteEmail, items, total, direccionEntrega, barrioEntrega, destinatario, telefonoDestinatario, fechaEntrega, mensajeTarjeta)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          payloadData.codigo,
          payloadData.usuarioId,
          payloadData.clienteNombre,
          payloadData.clienteTelefono,
          payloadData.clienteEmail,
          JSON.stringify(payloadData.items),
          payloadData.total,
          payloadData.direccionEntrega,
          payloadData.barrioEntrega,
          payloadData.destinatario,
          payloadData.telefonoDestinatario,
          payloadData.fechaEntrega,
          payloadData.mensajeTarjeta
        );

        nuevoPedido = await prisma.pedido.findUnique({
          where: { codigo: payloadData.codigo },
        });
      }
    }

    // Asegurar que el objeto en memoria devuelto al frontend tenga 'estado: PENDIENTE'
    if (nuevoPedido && !nuevoPedido.estado) {
      nuevoPedido.estado = "PENDIENTE";
    }

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
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al registrar pedido en MySQL:", error);
    return NextResponse.json({ error: error.message || "Error al registrar pedido." }, { status: 500 });
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
      mensaje: `Pedido #${pedidoExistente.codigo} eliminado exitosamente de MySQL.`,
    });
  } catch (error) {
    console.error("Error al eliminar pedido en MySQL:", error);
    return NextResponse.json({ error: "Error al eliminar el pedido en la base de datos." }, { status: 500 });
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

    const body = await request.json();
    const { id, estado } = body;

    if (!id || !estado) {
      return NextResponse.json({ error: "Se requiere ID de pedido y estado." }, { status: 400 });
    }

    const pedidoId = parseInt(id, 10);
    if (isNaN(pedidoId)) {
      return NextResponse.json({ error: "ID de pedido inválido." }, { status: 400 });
    }

    const estadoLimpio = String(estado).toUpperCase() === "VENDIDO" ? "VENDIDO" : "PENDIENTE";

    let pedidoActualizado = null;
    try {
      pedidoActualizado = await prisma.pedido.update({
        where: { id: pedidoId },
        data: { estado: estadoLimpio },
      });
    } catch (e) {
      console.warn("Aviso al actualizar estado en MySQL (posible ausencia de columna estado):", e?.message);
    }

    return NextResponse.json({
      success: true,
      pedido: pedidoActualizado || { id: pedidoId, estado: estadoLimpio },
      mensaje: `Pedido actualizado a ${estadoLimpio}.`,
    });
  } catch (error) {
    console.error("Error al actualizar estado del pedido en MySQL:", error);
    return NextResponse.json({ error: "Error al actualizar el estado del pedido en la base de datos." }, { status: 500 });
  }
}



