// El orden del catálogo asigna intervalos distintos, también a categorías nuevas.
export function intervaloCarrusel(indice = 0) {
  return 4200 + (Number.isSafeInteger(indice) && indice >= 0 ? indice : 0) * 450;
}

export function iniciarAvanceAutomatico({ contenedor, pista, intervalo, avanzar, pausado = false, alCambiarMovimientoReducido = () => {} }) {
  const movimientoReducido = window.matchMedia("(prefers-reduced-motion: reduce)");
  let visible = !window.IntersectionObserver;
  let encima = window.matchMedia("(hover: hover)").matches && contenedor.matches(":hover");
  let tocando = false;
  let foco = contenedor.contains(document.activeElement)
    && document.activeElement.matches(":focus-visible");
  let eliminado = false;
  let temporizador;

  const puedeAvanzar = () => !eliminado && !pausado && !document.hidden
    && !movimientoReducido.matches && visible && !encima && !tocando && !foco
    && pista.scrollWidth > pista.clientWidth + 2;

  const programar = () => {
    window.clearTimeout(temporizador);
    if (!puedeAvanzar()) return;
    temporizador = window.setTimeout(() => {
      if (puedeAvanzar()) avanzar();
      programar();
    }, intervalo);
  };

  const alEntrar = (event) => {
    if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
    encima = true;
    programar();
  };
  const alSalir = () => { encima = false; programar(); };
  const alTocar = () => { tocando = true; programar(); };
  const alSoltar = () => {
    if (!tocando) return;
    tocando = false;
    programar();
  };
  const alEnfocar = (event) => {
    foco = event.target.matches(":focus-visible");
    programar();
  };
  const alDesenfocar = () => { foco = false; programar(); };
  const alCambiarPreferencia = () => {
    alCambiarMovimientoReducido(movimientoReducido.matches);
    programar();
  };

  const observer = window.IntersectionObserver ? new window.IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting && entry.intersectionRatio >= 0.15;
    programar();
  }, { threshold: 0.15 }) : null;
  observer?.observe(pista);

  const eventos = [
    [contenedor, "pointerenter", alEntrar],
    [contenedor, "pointerleave", alSalir],
    [contenedor, "pointerdown", alTocar],
    [window, "pointerup", alSoltar],
    [window, "pointercancel", alSoltar],
    [contenedor, "focusin", alEnfocar],
    [contenedor, "focusout", alDesenfocar],
    [pista, "scroll", programar],
    [pista, "wheel", programar],
    [document, "visibilitychange", programar],
    [window, "resize", programar],
    [movimientoReducido, "change", alCambiarPreferencia],
  ];
  eventos.forEach(([elemento, evento, listener]) => elemento.addEventListener(evento, listener, { passive: true }));
  alCambiarPreferencia();

  return () => {
    eliminado = true;
    window.clearTimeout(temporizador);
    observer?.disconnect();
    eventos.forEach(([elemento, evento, listener]) => elemento.removeEventListener(evento, listener));
  };
}
