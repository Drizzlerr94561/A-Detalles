import { NextResponse } from "next/server";
import { verifyIsAdmin } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

export async function POST(request) {
  try {
    const admin = await verifyIsAdmin();
    if (!admin) {
      return NextResponse.json({ error: "No autorizado. Solo el administrador puede subir imágenes." }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const folder = formData.get("folder") || "adetallesbq/productos";

    if (!file) {
      return NextResponse.json({ error: "No se seleccionó ninguna imagen." }, { status: 400 });
    }

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "El archivo debe ser una imagen válida (PNG, JPG, WEBP, etc.)." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Subir nativamente a Cloudinary como Base64 Data URI
    const base64Data = `data:${file.type};base64,${buffer.toString("base64")}`;

    const uploadResult = await cloudinary.uploader.upload(base64Data, {
      folder: folder,
      resource_type: "image",
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    });

    return NextResponse.json(
      {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
        filename: file.name,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al subir la imagen a Cloudinary:", error);
    return NextResponse.json({ error: "Error al subir la imagen a Cloudinary." }, { status: 500 });
  }
}
