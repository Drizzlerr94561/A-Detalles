# 📜 Historial de Cambios y Depuración: Sesión de Trabajo

**Fecha de Registro:** 18 de Septiembre de 2026  
**Proyecto:** Adetallesbq (`A-Detalles`)  
**Rama:** `main`  
**Estado:** Totalmente sincronizado con `origin/main`

---

## 🎯 Resumen de la Jornada
Durante esta sesión se optimizó la experiencia del usuario, se fortaleció el sistema de checkout eliminando fricciones, se incorporó una lógica avanzada de validación telefónica para Colombia con detección de operadores y se llevó a cabo una auditoría completa del proyecto para eliminar código muerto y archivos residuales.

---

## 🚀 1. Funcionalidades Implementadas

### A. Validador Inteligente de Celulares Colombianos (`src/lib/phoneUtils.js`)
* **Regulación CRC Oficial**: Validación estricta de números celulares de Colombia (10 dígitos exactos que inician por `3`).
* **Detección de Operador en Tiempo Real**: Identifica el operador según el rango oficial asignado:
  * **Tigo**: `300, 301, 302, 303, 304, 305`
  * **Claro**: `310, 311, 312, 313, 314, 320, 321, 322, 323`
  * **Movistar**: `315, 316, 317, 318, 319`
  * **WOM**: `350, 351`
  * **Virgin Mobile / Móvil Éxito (OMV)**: `324, 333`
* **Formateo Visual Automático**: Aplica formato legible `3XX XXX XXXX` de manera transparente mientras el usuario escribe, sin alterar el valor limpio de 10 dígitos guardado en el estado.
* **Badges Visuales Modernos**: Insignias con color y logo corporativo del operador en el drawer del carrito (`CarritoDrawer.jsx`) y en la vista de pedidos del administrador (`admin/pedidos/page.jsx`).
* **Filtro Anti-Ficticios**: Detección y bloqueo de números falsos que repiten el mismo dígito 10 veces (ej: `3111111111`) o que terminan en 7 ceros consecutivos.

### B. Corrección de UX en Edición de Celular (Cursor Jump Fix)
* **Problema resuelto**: Al editar o borrar un dígito intermedio con la tecla retroceso (Backspace), React formateaba el string y enviaba el cursor automáticamente al final del input.
* **Solución técnica**:
  * Función matemática `calculatePhoneCursorPosition` para calcular el desplazamiento real de dígitos.
  * Sincronización con el DOM mediante `requestAnimationFrame`.
  * Controlador `handlePhoneKeyDown` que salta y borra el dígito anterior cuando el cursor está ubicado inmediatamente después de un espacio de separación.

### C. Flujo de Compra Directa Sin Login Obligatorio
* **Cero fricción de compra**: Los clientes pueden armar su regalo, agregar adicionales y finalizar el pedido directamente en WhatsApp sin tener que registrar una cuenta, verificar email o recordar claves.
* **Exclusividad Administrativa**: La pantalla de acceso `/login` se reservó únicamente para el Administrador de la tienda (`admin@adetallesbq.com`).
* **Ajuste de Navegación**: Se actualizaron el [Navbar.jsx](file:///C:/Users/ALUMNO/.gemini/antigravity/scratch/A-Detalles/src/components/Navbar.jsx) y el [Footer.jsx](file:///C:/Users/ALUMNO/.gemini/antigravity/scratch/A-Detalles/src/components/Footer.jsx) para reflejar este flujo simplificado.

### D. Mejoras en Panel de Pedidos (`src/app/admin/pedidos/page.jsx`)
* Filtros interactivos de pedidos por fecha: "Hoy", "Ayer", "Fecha Específica" o "Todos".
* Contadores y métricas dinámicas de ingresos según la fecha seleccionada.
* Visualización directa del operador detectado tanto para el cliente que compra como para el destinatario que recibe la sorpresa.

### E. Corrección Crítica en Endpoint de Pedidos (`src/app/api/pedidos/route.js`)
* **Solución a `ReferenceError: cleanPhone is not defined`**: Se definió y sanitizó `cleanPhone` a partir de `NEXT_PUBLIC_WHATSAPP_PHONE`.
* **Soporte Inteligente de Prefijo País (+57)**: Si la variable de entorno solo contiene los 10 dígitos locales (ej: `3106629289`), se le antepone automáticamente el código de Colombia `57` (`573106629289`) para garantizar que la URL de `wa.me` sea siempre 100% funcional.

### F. Blindaje de Seguridad y Sesión Administrativa (`src/lib/auth.js`, `api/auth/*`)
* **Cierre de Vulnerabilidad de Bypass Admin**: Se reemplazó la cookie en JSON plano por un **token firmado criptográficamente con HMAC-SHA256** (`signSessionToken` y `verifySessionToken`) con comparación segura contra ataques de temporización (`crypto.timingSafeEqual`).
* **Protección `httpOnly: true`**: La cookie `admin_session` ahora está protegida contra acceso o manipulación desde JavaScript en el navegador (DevTools / XSS).
* **Migración Automática de Contraseñas a Bcrypt**: Si una cuenta poseía contraseña en texto plano en la base de datos, al iniciar sesión se re-encripta automáticamente con Bcrypt en MySQL.
* **Protección de Endpoint de Métricas**: Se aseguró el endpoint `/api/admin/sync-cloudinary` con `verifyIsAdmin()` para restringir métricas internas únicamente a administradores verificados.

---

## 🗑️ 2. Elementos y Archivos Eliminados / Depurados

### A. Rutas y Código Obsoleto del Backend
* `src/app/api/auth/register/route.js`: Eliminado (ya no se requiere registro de usuarios clientes).
* `src/app/api/usuario/perfil/route.js`: Eliminado.
* `src/app/api/usuario/direcciones/route.js`: Eliminado.
* `src/app/api/usuario/cambiar-password/route.js`: Eliminado.
* `src/app/ubicanos/page.jsx`: Eliminada la sección obsoleta "Ubícanos".
* `src/lib/email.js`: Eliminado módulo de envío de correos SMTP para usuarios.

### B. Archivos Residuales de Pruebas e Imágenes Duplicadas
* `public/uploads/1775783819410_1789618708653.png`: Eliminado (foto de prueba con reloj/zapatillas).
* `public/uploads/LOGO_27_1789515973810.jfif`: Eliminado (logotipo "27" de prueba).
* `public/uploads/Logo_1789572125471.png`: Eliminado (logo de prueba en uploads).
* `public/uploads/descarga__5__1789517745190.jpeg`: Eliminado (foto de prueba con gafas).
* `public/images/graphic_left_raw.png`: Eliminado (archivo PNG no optimizado de 926 KB, reemplazado por la versión oficial `.jpg` de 123 KB).
* `GUIA_CORREO_DOMINIO_PRODUCCION.md`: Eliminado de la raíz.

### C. Protección de Repositorio
* Creado `public/uploads/.gitkeep` para preservar el directorio vacío en Git.
* Modificado `.gitignore` agregando `/public/uploads/*` y `!/public/uploads/.gitkeep` para garantizar que ninguna prueba de carga local vuelva a comitearse.

---

## 📌 3. Documentación Nueva Incorporada
1. **`GUIA_INICIO_NUEVA_MAQUINA.md`**: Manual técnico paso a paso para clonar, configurar `.env`, sincronizar base de datos con Prisma y arrancar el proyecto desde cero en cualquier computadora.
2. **`HISTORIAL_CAMBIOS_SESION.md`**: Este mismo archivo, como bitácora y auditoría viva del proyecto.
