import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyIsAdmin } from "@/lib/auth";

const TARJETAS_DEFECTO = [
  {
    clave: "card_coleccion_destacada",
    nombre: "COLECCIÓN DESTACADA 2026",
    subtitulo: "Card Pequeña - Colección Destacada",
    descripcion: "Cinta/Título separador para la primera colección de productos en el inicio.",
    imagen: "/images/hero_banner_palorosa.jpg",
    linkUrl: "/productos",
  },
  {
    clave: "card_edicion_especial",
    nombre: "COLECCIÓN EDICIÓN ESPECIAL 2026",
    subtitulo: "Card Pequeña - Edición Especial",
    descripcion: "Cinta/Título separador para la segunda colección edición especial en el inicio.",
    imagen: "/images/Desayuno.png",
    linkUrl: "/productos",
  },
  {
    clave: "hero_main_banner",
    nombre: "Recibe Hoy",
    subtitulo: "Banner Principal Hero",
    descripcion: "Fotografía principal del Banner superior de la página de inicio.",
    imagen: "/images/Amarillo.png",
    linkUrl: "https://wa.me/573106629289?text=Hola%20Adetallesbq,%20quisiera%20comprar",
  },
  {
    clave: "card_sorprende_graphic",
    nombre: "Sorprende a los que más quieres",
    subtitulo: "Tarjeta Gráfica Sorprende (Sección Rosas)",
    descripcion: "Imagen de la tarjeta gráfica izquierda en la sección Sorprende.",
    imagen: "/images/graphic_left.jpg",
    linkUrl: "https://wa.me/573106629289?text=Hola%20Adetallesbq,%20quisiera%20agendar",
  },
  {
    clave: "escenario_1",
    nombre: "Escenario",
    subtitulo: "Ambientación & Decoración",
    descripcion: "Decoración de cumpleaños y cenas de fin de año personalizadas.",
    imagen: "/images/Escenario.png",
    linkUrl: "/productos",
  },
  {
    clave: "escenario_2",
    nombre: "Caja más comida",
    subtitulo: "Desayuno Gourmet Especial",
    descripcion: "Sorprende con un desayuno delicioso con croissant, parfait y chocolate.",
    imagen: "/images/Caja mas comida.png",
    linkUrl: "/productos",
  },
  {
    clave: "escenario_3",
    nombre: "Diseño",
    subtitulo: "Cuadros & Recuerdos",
    descripcion: "Detalle que quede para siempre con un cuadro personalizado.",
    imagen: "/images/Diseño.png",
    linkUrl: "/productos",
  },
];

// GET: Obtener todas las tarjetas de inicio (poblando valores por defecto si no existen)
export async function GET() {
  try {
    let tarjetas = await prisma.tarjetaInicio.findMany({
      orderBy: { id: "asc" },
    });

    if (tarjetas.length === 0) {
      for (const t of TARJETAS_DEFECTO) {
        await prisma.tarjetaInicio.upsert({
          where: { clave: t.clave },
          update: {},
          create: t,
        });
      }
      tarjetas = await prisma.tarjetaInicio.findMany({
        orderBy: { id: "asc" },
      });
    }

    return NextResponse.json(tarjetas);
  } catch (error) {
    console.error("Error al consultar tarjetas de inicio:", error);
    return NextResponse.json({ error: "Error al consultar las tarjetas en MySQL." }, { status: 500 });
  }
}

// PUT: Actualizar una tarjeta de inicio por ID o por clave
export async function PUT(request) {
  try {
    const admin = await verifyIsAdmin();
    if (!admin) {
      return NextResponse.json({ error: "No autorizado. Solo el administrador puede modificar las tarjetas de inicio." }, { status: 403 });
    }

    const body = await request.json();
    const { id, clave, nombre, subtitulo, descripcion, imagen, linkUrl } = body;

    if (!id && !clave) {
      return NextResponse.json({ error: "Se requiere ID o clave de la tarjeta." }, { status: 400 });
    }

    const whereClause = id ? { id: parseInt(id) } : { clave };

    const tarjetaActualizada = await prisma.tarjetaInicio.update({
      where: whereClause,
      data: {
        ...(nombre !== undefined && { nombre }),
        ...(subtitulo !== undefined && { subtitulo }),
        ...(descripcion !== undefined && { descripcion }),
        ...(imagen !== undefined && { imagen }),
        ...(linkUrl !== undefined && { linkUrl }),
      },
    });

    return NextResponse.json(tarjetaActualizada);
  } catch (error) {
    console.error("Error al actualizar tarjeta de inicio:", error);
    return NextResponse.json({ error: "Error al actualizar la tarjeta de inicio." }, { status: 500 });
  }
}
