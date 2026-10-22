import { NextResponse } from "next/server";
import { verifyIsAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { solicitarLimpiezaTemporal } from "@/lib/assetsCatalogo";

const ID_VALIDO = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export async function POST(request) {
  try {
    if (!(await verifyIsAdmin())) return NextResponse.json({ error: "No autorizado." }, { status: 403 });
    const body = await request.json().catch(() => null);
    if (!body || Object.keys(body).some((key) => key !== "assetIds") || !Array.isArray(body.assetIds) || body.assetIds.length > 50 || body.assetIds.some((id) => typeof id !== "string" || !ID_VALIDO.test(id))) {
      return NextResponse.json({ error: "Envía una lista de hasta 50 identificadores de imágenes subidas." }, { status: 400 });
    }
    const resultado = await solicitarLimpiezaTemporal(prisma, [...new Set(body.assetIds)]);
    return NextResponse.json({ ok: true, programadas: resultado.count });
  } catch {
    return NextResponse.json({ error: "No se pudo programar la limpieza de imágenes." }, { status: 503 });
  }
}
