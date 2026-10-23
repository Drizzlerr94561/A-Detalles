import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ErrorPedido, validarPedidoCatalogo, respuestaErrorPedido } from "@/lib/pedidosValidacion";

export async function POST(request) {
  try {
    let body;
    try { body = await request.json(); } catch { throw new ErrorPedido("La solicitud debe contener JSON válido."); }
    const validado = await validarPedidoCatalogo(body?.items, prisma);
    return NextResponse.json({ ok: true, ...validado }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const respuesta = respuestaErrorPedido(error);
    return NextResponse.json(respuesta.body, { status: respuesta.status, headers: { "Cache-Control": "no-store" } });
  }
}
