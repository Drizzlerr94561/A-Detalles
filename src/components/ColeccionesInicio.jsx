'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import QuickViewModal from "@/components/QuickViewModal";
import { obtenerImagenProducto } from "@/lib/productosDefecto";
import { crearColeccionesInicio, leerOrdenColecciones } from "@/lib/coleccionesInicio";
import { iniciarAvanceAutomatico, intervaloCarrusel } from "@/lib/carruselAutomatico";
import styles from "./ColeccionesInicio.module.css";

const precio = (valor) => Number.isFinite(Number(valor)) && Number(valor) > 0
  ? `$${Number(valor).toLocaleString("es-CO")}` : "Consultar precio";

const presentaciones = {
  "desayunos y meriendas": ["Una mañana especial", "Desayunos y meriendas que convierten cualquier día en una sorpresa."],
  "arreglos florales": ["Dilo con flores", "Rosas, colores y detalles para expresar lo que sientes."],
  "cajas de regalo": ["Una caja, mil emociones", "Pequeñas sorpresas reunidas en un regalo muy especial."],
  "anchetas": ["Para compartir felicidad", "Combinaciones de sabores y detalles para celebrar a tu manera."],
  "arreglos con globos": ["Celebra en grande", "Globos y arreglos que llenan de alegría tus momentos especiales."],
  "combos luxury": ["Una sorpresa inolvidable", "Combinaciones especiales para quienes merecen un gran detalle."],
  "peluches": ["Abrazos que se quedan", "Compañeros suaves y tiernos para regalar una sonrisa."],
  "adicionales": ["El toque final", "Complementa tu sorpresa con ese detalle que la hace única."],
};

function CarruselColeccion({ coleccion, onPersonalizar, intervaloAutomatico, pausado }) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const [limites, setLimites] = useState({ anterior: false, siguiente: false });
  const actualizarLimites = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const maximo = Math.max(0, track.scrollWidth - track.clientWidth);
    const anterior = track.scrollLeft > 2;
    const siguiente = track.scrollLeft < maximo - 2;
    setLimites((prev) => prev.anterior === anterior && prev.siguiente === siguiente ? prev : { anterior, siguiente });
  }, []);

  useEffect(() => {
    actualizarLimites();
    const track = trackRef.current;
    if (!track) return;
    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(actualizarLimites);
      observer.observe(track);
      return () => observer.disconnect();
    }
    window.addEventListener("resize", actualizarLimites);
    return () => window.removeEventListener("resize", actualizarLimites);
  }, [actualizarLimites, coleccion.productos.length]);

  const mover = useCallback((direccion, ciclico = false) => {
    const track = trackRef.current;
    if (!track?.children.length) return;
    const maximo = Math.max(0, track.scrollWidth - track.clientWidth);
    if (maximo <= 2) return;
    const actual = Math.max(0, Math.min(track.scrollLeft, maximo));
    const origen = track.children[0].offsetLeft;
    const posiciones = Array.from(track.children, (card) => Math.min(card.offsetLeft - origen, maximo));
    const destino = direccion > 0
      ? posiciones.find((posicion) => posicion > actual + 2) ?? (ciclico ? 0 : maximo)
      : [...posiciones].reverse().find((posicion) => posicion < actual - 2) ?? 0;
    const volverAlInicio = ciclico && destino === 0;
    track.scrollTo({ left: destino, behavior: volverAlInicio || window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, []);

  useEffect(() => {
    if (!sectionRef.current || !trackRef.current) return;
    return iniciarAvanceAutomatico({
      contenedor: sectionRef.current,
      pista: trackRef.current,
      intervalo: intervaloAutomatico,
      avanzar: () => mover(1, true),
      pausado,
    });
  }, [intervaloAutomatico, coleccion.productos.length, mover, pausado]);

  const [subtitulo, descripcion] = presentaciones[coleccion.clave] || ["Detalles especiales", "Encuentra el regalo perfecto para esa persona que tanto quieres."];
  const tituloId = `coleccion-${encodeURIComponent(coleccion.clave)}`;

  return (
    <section ref={sectionRef} className={styles.collection} aria-labelledby={tituloId} data-coleccion={coleccion.nombre}>
      <div className={styles.header}>
        <div className={styles.heading}>
          <p className={styles.eyebrow}>{subtitulo}</p>
          <h2 id={tituloId} className={styles.title}>{coleccion.nombre}</h2>
          <p className={styles.description}>{descripcion}</p>
        </div>
        <div className={styles.controls}>
          <button type="button" className={styles.arrow} disabled={!limites.anterior} onClick={() => mover(-1)} aria-label={`Ver productos anteriores de ${coleccion.nombre}`} aria-controls={`${tituloId}-productos`}><ChevronLeft size={18} aria-hidden="true" /></button>
          <button type="button" className={styles.arrow} disabled={!limites.siguiente} onClick={() => mover(1)} aria-label={`Ver siguientes productos de ${coleccion.nombre}`} aria-controls={`${tituloId}-productos`}><ChevronRight size={18} aria-hidden="true" /></button>
          <Link className={styles.viewAll} href={`/productos?categoria=${encodeURIComponent(coleccion.nombre)}`} prefetch={false} aria-label={`Ver todos los productos de ${coleccion.nombre}`}>Ver todos</Link>
        </div>
      </div>

      <div id={`${tituloId}-productos`} ref={trackRef} className={styles.track} onScroll={actualizarLimites} role="region" aria-label={`Productos de ${coleccion.nombre}`} tabIndex={0} onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          event.preventDefault();
          mover(event.key === "ArrowRight" ? 1 : -1);
        }
      }}>
        {coleccion.productos.map((producto, index) => {
          const imagen = obtenerImagenProducto(producto, index);
          return (
            <article key={producto.id} className={styles.card}>
              <button type="button" className={styles.photo} onClick={() => onPersonalizar(producto, imagen)} aria-label={`Ver ${producto.nombre} en detalle`} aria-haspopup="dialog" disabled={producto.writable === false}>
                <img src={imagen} alt={producto.nombre || "Regalo A’Detalles"} loading="lazy" decoding="async" referrerPolicy="no-referrer" />
                <span className={styles.tag}>{coleccion.nombre}</span>
              </button>
              <div className={styles.body}>
                <h3 className={styles.productName}>{producto.nombre}</h3>
                <p className={styles.productDescription}>{producto.descripcion || "Un detalle especial para sorprender a quien más quieres."}</p>
                <div className={styles.footer}>
                  <span className={styles.price}>{precio(producto.precio)}</span>
                  <button type="button" className={styles.order} onClick={() => onPersonalizar(producto, imagen)} disabled={producto.writable === false} aria-label={`Pedir y personalizar ${producto.nombre}`} aria-haspopup="dialog"><Sparkles size={14} aria-hidden="true" /><span>Pedir y personalizar</span></button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default function ColeccionesInicio({ productos = [], ordenCategorias = [], origenCatalogo = "bd" }) {
  const [ordenActualizado, setOrdenActualizado] = useState(null);
  const [seleccion, setSeleccion] = useState(null);
  const cerrarModal = useCallback(() => setSeleccion(null), []);
  const colecciones = useMemo(() => crearColeccionesInicio(productos, ordenActualizado ?? ordenCategorias), [productos, ordenActualizado, ordenCategorias]);

  useEffect(() => {
    let activo = true;
    let peticion;
    const actualizar = async () => {
      peticion?.abort();
      const controlador = new AbortController();
      peticion = controlador;
      try {
        const respuesta = await fetch("/api/admin/categorias/orden", { cache: "no-store", signal: controlador.signal });
        if (!respuesta.ok) return;
        const orden = leerOrdenColecciones(await respuesta.json());
        if (activo && !controlador.signal.aborted && orden) setOrdenActualizado(orden);
      } catch { /* Una consulta fallida conserva el último orden disponible. */ }
    };
    const alMostrar = () => { if (document.visibilityState === "visible") actualizar(); };
    actualizar();
    window.addEventListener("focus", actualizar);
    document.addEventListener("visibilitychange", alMostrar);
    return () => {
      activo = false;
      peticion?.abort();
      window.removeEventListener("focus", actualizar);
      document.removeEventListener("visibilitychange", alMostrar);
    };
  }, []);

  if (origenCatalogo !== "bd") return <p role="status" className={styles.status}>No pudimos consultar las colecciones. Intenta nuevamente en unos instantes.</p>;
  if (!colecciones.length) return null;

  return (
    <div className={styles.collections} data-colecciones-inicio="true">
      {colecciones.map((coleccion, indice) => <CarruselColeccion key={coleccion.clave} coleccion={coleccion} intervaloAutomatico={intervaloCarrusel(indice)} pausado={Boolean(seleccion)} onPersonalizar={(producto, imagen) => setSeleccion({ producto, imagen })} />)}
      <QuickViewModal producto={seleccion?.producto || null} imagen={seleccion?.imagen || null} isOpen={Boolean(seleccion)} onClose={cerrarModal} />
    </div>
  );
}
