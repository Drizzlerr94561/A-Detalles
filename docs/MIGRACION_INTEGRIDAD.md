# Integridad del catálogo y registro de imágenes

Esta actualización conserva las filas de productos, usuarios, pedidos y tablas de legado. No elimina General: esa acción independiente debe hacerse desde el administrador cuando esté vacía.

## Comprobación y aplicación

El script utiliza la conexión configurada en `DATABASE_URL`. No imprime la conexión ni datos de clientes.

```
node scripts/upgrade-catalog-integrity.cjs --check
node scripts/upgrade-catalog-integrity.cjs --apply
node scripts/upgrade-catalog-integrity.cjs --check
```

`--check` consulta metadatos y conteos sin escribir. Devuelve código 2 si hay pasos pendientes y 1 ante un error. `--apply` es explícito; no se ejecuta al arrancar la aplicación, instalar paquetes o crear pedidos.

## Cambios

- Crea `Categoria.orden` e inicializa su prioridad desde `src/lib/categoriasOrden.json`, únicamente para posiciones sin inicializar. Mantiene cualquier posición ya guardada.
- Comprueba productos huérfanos, categorías vacías/duplicadas y compatibilidad de tipos/collation; si hay inconsistencias se detiene para una reasignación explícita.
- Garantiza nombre único de categoría e índice de categoría de producto.
- Retira el valor predeterminado General de `productos.categoria`.
- Añade FK de `productos.categoria` a `categorias.nombre`: renombrar propaga el nombre; eliminar una categoría ocupada queda restringido.
- Rellena exclusivamente `pedidos.estado IS NULL` con PENDIENTE y hace obligatoria la columna.
- Crea `assets_catalogo` para registrar imágenes nuevas administradas y su limpieza diferida. No inventaría ni destruye imágenes históricas.

Si `assets_catalogo` ya existe, se comprueban tipos, precisión temporal, nullability, valores predeterminados, clave primaria, índices únicos completos de `publicId`/`url` e índice de la cola `(estado, eliminarDesde)`. Una tabla parcialmente creada o incompatible detiene la migración antes de escribir; no se reconstruye automáticamente ni se acepta un índice por prefijo como equivalente.

MySQL confirma DDL implícitamente. Cada paso vuelve a comprobarse y el script puede reanudarse tras un fallo; no se anuncia éxito si falta la FK o una columna. Durante la inicialización de orden, NULL sirve como marcador temporal y sus actualizaciones se confirman en una transacción antes de hacer la columna obligatoria.

## Despliegue coordinado

Preparar una copia de respaldo y comprobar la base prevista antes de aplicar. Aplicar primero la migración con el despliegue anterior activo, repetir `--check` hasta obtener `lista: true` y después publicar el código nuevo: las rutas nuevas necesitan `categorias.orden` y `assets_catalogo`. Usar un solo ejecutor; los pasos son reanudables, pero dos migraciones concurrentes pueden producir conflictos transitorios. Generar Prisma Client con el esquema actualizado para el despliegue. No sustituir este script por un reset o una sincronización que elimine las tablas de legado.

Si una escritura del despliegue anterior crea un producto huérfano durante la preparación, MySQL vuelve a validar las filas al añadir la FK y ese paso falla. El script no anuncia éxito; corregir la asignación explícitamente y reanudar. No desactivar `foreign_key_checks` para forzar la aplicación.

Ante un problema de despliegue, revertir primero el código conservando las columnas, índices y FK aditivos. No eliminar `assets_catalogo` tras subir imágenes nuevas: contiene el registro de propiedad y limpieza. Una reversión al código anterior también devuelve su comportamiento antiguo de creación de General, por lo que solo sirve como recuperación temporal. Una reversión completa del esquema requiere el respaldo previo y revisión de las escrituras posteriores.

Las rutas también validan categorías dentro de transacciones Serializable, por lo que no dependen solo de la FK. Al borrar una categoría ocupada, DELETE requiere `categoriaDestinoId` explícito; sin él devuelve 409. Una categoría vacía, incluida General, es borrable. El orden se guarda en la base y no en el filesystem de la instancia.

La limpieza de imágenes y las variables necesarias para ella se documentan por separado en su flujo de assets. No ejecutar limpiezas ni migraciones contra producción como parte de pruebas locales.
