# Corrección del catálogo y la galería

La auditoría de octubre de 2026 confirmó que la web pública entrega exactamente el catálogo de respaldo de `75063d2`, con 259 productos en General. La API pública no permite distinguir si la consulta de productos falló o si devolvió cero filas. La falta de la columna `productos.imagenes`, añadida al modelo sin una actualización de base de datos incluida, es una hipótesis que debe comprobarse en el entorno publicado.

La corrección restaura las doce colecciones del respaldo a partir de la semilla original, sin ejecutar esa semilla. La base de datos es la fuente del catálogo cuando se puede consultar. Si falta únicamente `imagenes`, se consultan los campos anteriores y se conservan los productos y sus categorías guardadas. Si falla la base de datos, las tarjetas de respaldo se identifican y se muestran sin controles de edición.

## Comprobar el entorno publicado

Ejecutar desde la raíz del proyecto con las variables del entorno publicado. El `.env` de esta computadora apunta a MySQL local y no sirve para comprobar la base de datos de producción.

```text
npm run db:check-catalogo
npm run db:imagenes:check
```

La primera consulta es de solo lectura: informa cantidad real de productos, categorías, colecciones sin registro y disponibilidad de la columna de galería. La segunda comprueba la columna sin modificarla; termina con código 2 si falta.

Si la tabla `productos` está vacía, investigar la pérdida de datos y recuperar un respaldo de la base de datos. El catálogo estático no demuestra que existan 303 filas persistidas. La semilla se reserva para una base completamente vacía y ahora rechaza cualquier instalación que tenga información.

## Habilitar varias imágenes

Si la comprobación demuestra que falta `productos.imagenes`, después de verificar la conexión prevista:

```text
npm run db:imagenes:apply
npm run db:imagenes:check
npm run db:check-catalogo
```

La actualización añade únicamente `imagenes JSON NULL`. No elimina tablas, no reemplaza productos y no cambia categorías, precios ni fotografías existentes. Si la columna ya existe, no modifica el esquema. Las fotos antiguas del campo `imagen` siguen funcionando; la galería se rellena al editar el producto. MySQL confirma automáticamente cambios de esquema: el script vuelve a comprobar la columna para verificar el resultado.

No se necesita ejecutar el seed ni una sincronización general del esquema para añadir esta columna. Esta utilidad está versionada en `scripts/upgrade-product-images.cjs`; no requiere inicializar un historial de migraciones sobre una base existente.

## Validar y publicar el código

```text
npm run test:catalogo
npm run build
```

Las pruebas automatizadas simulan Prisma: no leen ni escriben una base de datos. Verifican clasificación, galerías, compatibilidad con el esquema anterior, guardados parciales, transacciones de categorías y protección del seed.

Después del despliegue, comprobar `/api/admin/productos`: `X-Catalogo-Fuente: bd` confirma una consulta de productos real; `X-Catalogo-Imagenes-Disponibles: true` confirma que la lectura completa admite la galería. Si la fuente es `respaldo`, revisar los registros del servidor y la comprobación de base de datos antes de permitir administración.

Las cantidades del respaldo restaurado son 303 referencias en 12 colecciones, incluidas 7 de Flores Amarillas y 10 Combos Luxury. Los conteos reales de producción pueden diferir si se editaron productos desde la creación de la semilla.

## Hallazgos independientes

La auditoría completa documenta credenciales Cloudinary incrustadas, secretos y contraseñas por defecto en autenticación, y fallos de validación/persistencia de pedidos. Requieren una revisión específica, rotación de credenciales cuando estén activas y comprobación del entorno publicado. La corrección del catálogo no resuelve esos riesgos.
