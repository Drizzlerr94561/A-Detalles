# 🚀 Guía de Inicio Rápido y Análisis: Adetallesbq

Esta guía está diseñada para que cualquier desarrollador o IA que abra este proyecto en una **nueva máquina** pueda configurarlo, conectarlo, entender su arquitectura y ponerlo en marcha en menos de 5 minutos sin perder el hilo.

---

## 📋 1. Requisitos Previos en la Máquina
Asegúrate de tener instalado en el sistema operativo:
* **Node.js**: Versión 18.x o 20.x LTS recomendada.
* **npm**: Gestor de paquetes de Node (incluido con Node.js).
* **Git**: Para control de versiones.
* **MySQL**: Base de datos MySQL local (vía XAMPP, Laragon, Docker o servicio MySQL nativo) o una base de datos MySQL en la nube (Aiven, PlanetScale, Railway, Clever Cloud).

---

## ⚙️ 2. Paso a Paso para Configurar el Proyecto

### Paso 2.1: Clonar y Acceder
```bash
git clone https://github.com/Drizzlerr94561/A-Detalles.git
cd A-Detalles
```

### Paso 2.2: Instalar Dependencias
```bash
npm install
```
*(El comando `postinstall` ejecutará automáticamente `prisma generate` para compilar el cliente ORM de Prisma).*

### Paso 2.3: Crear el Archivo de Entorno (`.env`)
En la raíz del proyecto, crea un archivo llamado `.env` con las siguientes variables:

```env
# URL de Conexión a Base de Datos MySQL (Reemplaza con tus credenciales reales)
# Formato: mysql://USUARIO:PASSWORD@HOST:PUERTO/NOMBRE_DB
DATABASE_URL="mysql://root:@localhost:3306/adetallesbq"

# Número de WhatsApp oficial para recibir pedidos (código de país + 10 dígitos)
NEXT_PUBLIC_WHATSAPP_PHONE="573106629289"

# Credenciales de Cloudinary (para gestión y subida de fotos en la nube)
CLOUDINARY_CLOUD_NAME="enwlpozz"
CLOUDINARY_API_KEY="676424772427112"
CLOUDINARY_API_SECRET="Gj93-nrNpQPvJelmSN2mewHrgBY"

# Entorno de ejecución
NODE_ENV="development"
```

### Paso 2.4: Inicializar la Base de Datos con Prisma
Aplica el esquema y puebla la base de datos con los datos iniciales (categorías, admin y productos base):

```bash
# 1. Generar cliente de Prisma (si no se ejecutó en install)
npx prisma generate

# 2. Sincronizar el esquema de tablas en tu base de datos MySQL
npx prisma db push

# 3. Poblar la base de datos con las categorías y cuenta de Admin oficial
npm run seed
```

### Paso 2.5: Iniciar el Servidor de Desarrollo
```bash
npm run dev
```
Abre tu navegador en [http://localhost:3000](http://localhost:3000).

---

## 👑 3. Credenciales y Acceso Administrativo

El proyecto cuenta con un sistema de login **exclusivo para administradores**:
* **URL de Acceso**: `/login` (o `/admin` si ya iniciaste sesión).
* **Usuario / Email**: `admin@adetallesbq.com`
* **Contraseña**: `admin`
* **Funcionalidades del Administrador**:
  * Gestión en tiempo real del catálogo (crear, editar, eliminar productos y fotos).
  * Panel de Pedidos (`/admin/pedidos`): Ver historial, filtrar por fechas ("Hoy", "Ayer", días específicos), ver totales acumulados, detalles de dedicatoria, dirección y operador de telefonía detectado.
  * Gestión de categorías y tarjetas publicitarias de la página de inicio.

---

## 🧠 4. Mapa de Arquitectura y Análisis del Proyecto

Para analizar el código rápidamente, aquí está la distribución clave:

### A. Experiencia del Cliente (100% sin login)
* **Filosofía**: Cero fricción. Los clientes no necesitan registrarse ni recordar contraseñas para enviar regalos.
* **Carrito y Checkout** (`src/components/CarritoDrawer.jsx`):
  * Drawer lateral con cálculo de adicionales (rosas, dedicatorias, etc.).
  * **Validador de Celulares Colombianos** (`src/lib/phoneUtils.js`):
    * Valida 10 dígitos obligatorios con prefijo CRC `3XX`.
    * Detecta y muestra badge del operador en tiempo real: **Tigo** (`300-305`), **Claro** (`310-314, 320-323`), **Movistar** (`315-319`), **WOM** (`350-351`), etc.
    * Formatea el teléfono visualmente (`3XX XXX XXXX`) manteniendo la posición del cursor intacta al editar o borrar.
    * Filtro anti-ficticios (rechaza números como `3111111111` o `3000000000`).
  * **Cierre del Pedido**: Registra el pedido en MySQL vía `/api/pedidos` y genera el enlace directo estructurado para enviar la orden a WhatsApp.

### B. Gestión de Imágenes y Catálogo
* **Cloudinary**: Las imágenes de productos oficiales cargan desde la nube `res.cloudinary.com`.
* **Catálogo de Respaldo**: `src/lib/catalogoOficial.js` contiene el catálogo preconfigurado con enlaces seguros en la nube en caso de que la base de datos esté vacía.

### C. Estructura de Carpetas Clave
```
├── prisma/
│   ├── schema.prisma        # Esquema MySQL (Productos, Pedidos, Usuarios, Categorías)
│   └── seed.js              # Semilla inicial con categorías y usuario admin
├── public/
│   ├── fonts/               # Tipografías personalizadas (Agbalumo, Gummy Child, Lemon Shake)
│   ├── images/              # Banners, logos oficiales e ilustraciones optimizadas
│   └── uploads/             # Directorio de subidas locales (.gitkeep protegido)
├── src/
│   ├── app/
│   │   ├── admin/           # Páginas del panel de administración y pedidos
│   │   ├── api/             # Endpoints REST (auth, admin, pedidos)
│   │   ├── login/           # Acceso exclusivo para administradores
│   │   ├── productos/       # Catálogo completo de la tienda
│   │   └── page.jsx         # Página principal / Landing de inicio
│   ├── components/          # Componentes React (Navbar, Carrito, Catálogo, Banners)
│   ├── context/             # CartContext (estado persistente del carrito)
│   └── lib/                 # Utilidades (prisma, auth, phoneUtils, cloudinary)
```

---

## 🔍 5. Checklist para Verificar el Proyecto en una Nueva Máquina
Cada vez que abras el proyecto en otro equipo:
1. `git pull origin main` para tener siempre la última versión.
2. Comprobar que `.env` exista con un `DATABASE_URL` válido.
3. Ejecutar `npx prisma generate` si modificaste el esquema.
4. Ejecutar `npm run build` para comprobar que Next.js compile sin errores de sintaxis o imports.
5. Iniciar con `npm run dev` y probar una compra en el carrito para verificar la integración con WhatsApp y el validador de celulares.
