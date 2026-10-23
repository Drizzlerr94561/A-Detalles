import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";
import { procesarLimpiezaAssets } from "@/lib/assetsCatalogo";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  if (typeof secret !== "string" || Buffer.byteLength(secret, "utf8") < 32) return NextResponse.json({ error: "Limpieza no configurada." }, { status: 503 });
  const esperado = Buffer.from(`Bearer ${secret}`);
  const recibido = Buffer.from(request.headers.get("authorization") || "");
  if (recibido.length !== esperado.length || !timingSafeEqual(recibido, esperado)) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  if (!["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"].every((key) => process.env[key])) return NextResponse.json({ error: "Servicio de imágenes no configurado." }, { status: 503 });
  try {
    // Reservar 15 s del límite de la función para persistencia y entrega de la respuesta.
    const resultado = await procesarLimpiezaAssets({ cliente: prisma, proveedor: cloudinary, cloudName: process.env.CLOUDINARY_CLOUD_NAME, aplicar: true, limite: 10, presupuestoMs: 45000 });
    return NextResponse.json({ ok: resultado.errores === 0, ...resultado }, { status: resultado.errores ? 503 : 200, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "No se pudo completar la limpieza. Los pendientes se conservan para reintento." }, { status: 503 });
  }
}
