import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyIsAdmin } from "@/lib/auth";
import { emparejarFotosConProductos } from "@/lib/stringMatcher";
import cloudinary from "@/lib/cloudinary";

export async function POST(request) {
  try {
    const admin = await verifyIsAdmin();
    if (!admin) {
      return NextResponse.json({ error: "No autorizado." }, { status: 403 });
    }

    const formData = await request.formData();
    const files = formData.getAll("files");

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No se seleccionaron archivos." }, { status: 400 });
    }

    // Obtener todos los productos de MySQL
    const productos = await prisma.producto.findMany();
    if (productos.length === 0) {
      return NextResponse.json({ error: "No hay productos en la base de datos." }, { status: 400 });
    }

    const emparejamientos = emparejarFotosConProductos(files, productos);
    const resultados = [];
    let contadorVinculados = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const matchInfo = emparejamientos[i];

      if (file && typeof file.arrayBuffer === "function") {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const mimeType = file.type || "image/jpeg";
        const base64Data = `data:${mimeType};base64,${buffer.toString("base64")}`;

        // Subir a Cloudinary en la nube con optimización automática
        const uploadResult = await cloudinary.uploader.upload(base64Data, {
          folder: "adetallesbq/productos",
          resource_type: "image",
          transformation: [{ quality: "auto", fetch_format: "auto" }],
        });

        const urlPublica = uploadResult.secure_url;

        if (matchInfo && matchInfo.productoId) {
          // Actualizar producto en la base de datos MySQL
          await prisma.producto.update({
            where: { id: matchInfo.productoId },
            data: { imagen: urlPublica },
          });

          contadorVinculados++;
          resultados.push({
            archivo: file.name,
            url: urlPublica,
            productoId: matchInfo.productoId,
            productoNombre: matchInfo.productoNombre,
            coincidenciaScore: matchInfo.score,
            estado: "VINCULADO",
          });
        } else {
          resultados.push({
            archivo: file.name,
            url: urlPublica,
            productoId: null,
            productoNombre: null,
            coincidenciaScore: 0,
            estado: "SIN_COINCIDENCIA",
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      totalProcesadas: files.length,
      vinculadas: contadorVinculados,
      sinCoincidencia: files.length - contadorVinculados,
      detalles: resultados,
    });
  } catch (error) {
    console.error("Error en carga masiva de fotos:", error);
    return NextResponse.json(
      { error: "Error al procesar la carga masiva de fotos: " + error.message },
      { status: 500 }
    );
  }
}
