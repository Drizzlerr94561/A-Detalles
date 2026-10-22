# Preparar una instalación de A-Detalles

1. Instala las dependencias con `npm ci`.
2. Copia `.env.example` a `.env.local` y completa las variables usando el gestor de secretos del entorno. En Vercel, configura las variables del proyecto y vuelve a desplegar.
3. Genera valores independientes y aleatorios de al menos 32 bytes para `AUTH_SECRET` y `CRON_SECRET`. Puedes generarlos localmente con `node -e "process.stdout.write(require('node:crypto').randomBytes(48).toString('base64url'))"` y pegarlos directamente en el gestor de secretos. No los guardes en documentación ni commits.
4. Ejecuta `npx prisma generate`. Revisa y aplica la migración de integridad del catálogo antes de habilitar la edición y las subidas. No uses `db push` sobre producción como sustituto de una migración revisada.
5. Para una instalación totalmente vacía, configura `SEED_ADMIN_PASSWORD` con al menos 12 caracteres y ejecuta `npm run seed`. El seed rechaza bases con información en sus modelos. No lo uses para recuperar o sincronizar un catálogo existente; no elimina tablas legadas.
6. Ejecuta `npm run dev`. La cuenta administrativa debe existir en la base de datos; el acceso ya no crea usuarios automáticamente.

Las credenciales Cloudinary y la conexión MySQL se obtienen de sus paneles de administración. El código no incluye valores de respaldo. Si faltan secretos de sesión o del servicio de imágenes, las operaciones correspondientes quedan deshabilitadas.

## Imágenes y limpieza

Cada subida nueva obtiene un registro en `assets_catalogo` y un identificador propio. Al guardar el producto, las imágenes se vinculan en la misma transacción. Quitar una imagen de la galería o eliminar el producto deja una solicitud de limpieza con 24 horas de espera. Cerrar el editor sin guardar también solicita la limpieza de las subidas temporales; si el navegador se cierra antes, la reserva expira igualmente.

El cron configurado en Vercel llama a `/api/cron/limpiar-imagenes` y exige `Authorization: Bearer CRON_SECRET`. Cada ejecución procesa un lote limitado, adquiere una reserva de trabajo y vuelve a comprobar referencias en productos, pedidos históricos y catálogo oficial. Los fallos quedan pendientes para reintento. Las fotografías antiguas sin registro de propiedad no se eliminan automáticamente.

Para revisar la cola sin borrar imágenes:

```sh
node scripts/limpiar-assets.cjs --check
```

Para procesar hasta 50 solicitudes vencidas con las mismas comprobaciones del cron:

```sh
node scripts/limpiar-assets.cjs --apply
```

La salida solo contiene cantidades de imágenes revisadas, protegidas, pendientes o eliminadas. Si falla una lectura de referencias, no se elimina la imagen.

## Verificación

`npm run test:catalogo` comprueba las regresiones con proveedores y bases simuladas. `npm run build` verifica la compilación. Una base de datos disponible y vacía produce un catálogo vacío; un fallo de conexión presenta un estado de indisponibilidad y no recupera productos eliminados desde datos históricos.
