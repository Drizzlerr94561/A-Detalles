// Category names are editable text. A numeric sentinel cannot collide with a
// real name such as "TODOS" or "Todas las categorías".
export const FILTRO_TODAS_CATEGORIAS = 0;

export function reconciliarFiltroCategoria(actual, categorias) {
  if (actual === FILTRO_TODAS_CATEGORIAS) return FILTRO_TODAS_CATEGORIAS;
  return categorias.find(c => c.id !== FILTRO_TODAS_CATEGORIAS && c.nombre.toLocaleLowerCase("es") === String(actual).toLocaleLowerCase("es"))?.nombre || FILTRO_TODAS_CATEGORIAS;
}

export function crearControlSolicitudesCatalogo() {
  const versiones = new Map();
  return {
    iniciar(clave) {
      const version = (versiones.get(clave) || 0) + 1;
      versiones.set(clave, version);
      return () => versiones.get(clave) === version;
    },
    invalidar() {
      for (const [clave, version] of versiones) versiones.set(clave, version + 1);
    },
  };
}

export function cambiarCategoriaFormulario(formulario, anterior, siguiente = "") {
  if (formulario.categoria !== anterior) return formulario;
  return {
    ...formulario,
    categoria: siguiente,
    etiqueta: formulario.etiqueta === anterior ? siguiente : formulario.etiqueta,
  };
}
