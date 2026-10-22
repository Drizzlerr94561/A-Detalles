import { cargarCatalogo } from "@/lib/cargarCatalogo";
import CatalogoCliente from "@/components/CatalogoCliente";
import { obtenerOrdenCategorias } from "@/lib/categoriasOrden";

export const dynamic = "force-dynamic";

export default async function ProductosPage() {
  const catalogo = await cargarCatalogo();
  const ordenCategorias = obtenerOrdenCategorias();

  return (
    <div className="space-y-6 sm:space-y-12 pb-20">
      
      {/* 1. CATÁLOGO INTERACTIVO DE PRODUCTOS */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6">
        <CatalogoCliente
          productosIniciales={catalogo.productos}
          origenCatalogo={catalogo.source}
          imagenesDisponibles={catalogo.canWriteImages}
          ordenCategoriasInicial={ordenCategorias}
        />
      </section>

    </div>
  );
}
