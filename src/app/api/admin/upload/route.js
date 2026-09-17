import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { verifyIsAdmin } from "@/lib/auth";

export async function POST(request) {
  try {
    const admin = await verifyIsAdmin();
    if (!admin) {
      return NextResponse.json({ error: "No autorizado. Solo el administrador puede subir imágenes." }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No se seleccionó ninguna imagen." }, { status: 400 });
    }

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "El archivo debe ser una imagen válida (PNG, JPG, WEBP, etc.)." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Crear carpeta public/uploads si no existe
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    // Sanitizar nombre del archivo y generar nombre único
    const extension = path.extname(file.name) || ".png";
    const baseName = path.basename(file.name, extension).replace(/[^a-zA-Z0-9_-]/g, "_");
    const filename = `${baseName}_${Date.now()}${extension}`;
    const filePath = path.join(uploadDir, filename);

    await writeFile(filePath, buffer);

    const url = `/uploads/${filename}`;
    return NextResponse.json({ url, filename }, { status: 200 });
  } catch (error) {
    console.error("Error al procesar la subida de imagen:", error);
    return NextResponse.json({ error: "Error al guardar la imagen en el servidor." }, { status: 500 });
  }
}
