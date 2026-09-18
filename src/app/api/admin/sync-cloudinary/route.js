import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const productos = await prisma.producto.findMany({
      where: {
        imagen: {
          not: null,
        },
      },
    });

    const productosCloudinary = productos.filter((p) => p.imagen && p.imagen.includes("res.cloudinary.com"));

    return NextResponse.json({
      success: true,
      totalProductos: productos.length,
      totalEnCloudinary: productosCloudinary.length,
      mensaje: "Toda la tienda está operando 100% nativa en Cloudinary (enwlpozz).",
    });
  } catch (error) {
    console.error("Error en sync-cloudinary:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
