import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyIsAdmin } from "@/lib/auth";
import { emparejarFotosConProductos } from "@/lib/stringMatcher";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

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

    // Carpeta destino para guardar las imágenes
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const emparejamientos = emparejarFotosConProductos(files, productos);
    const resultados = [];
    let contadorVinculados = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const matchInfo = emparejamientos[i];

      if (file && typeof file.arrayBuffer === "function") {
        const buffer = Buffer.from(await file.arrayBuffer());
        
        // Generar nombre de archivo limpio y seguro
        const ext = path.extname(file.name) || ".jpg";
        const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
        const filenameSafe = `${baseName}_${Date.now()}${ext}`;
        const filePath = path.join(uploadDir, filenameSafe);

        // Guardar archivo físico en el disco
        await writeFile(filePath, buffer);
        const urlPublica = `/uploads/${filenameSafe}`;

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
