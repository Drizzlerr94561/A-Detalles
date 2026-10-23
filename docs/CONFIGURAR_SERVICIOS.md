# Activar servicios después de la corrección

En el panel de Cloudinary, genera una combinación nueva de API key y API secret para la aplicación. Configura en el proyecto Vercel `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET` usando los valores privados del proveedor. Deshabilita la combinación antigua expuesta cuando la nueva esté configurada y verificada. No pegues credenciales en chats, archivos versionados ni capturas compartidas.

Configura también `AUTH_SECRET` y `CRON_SECRET`, independientes entre sí y con al menos 32 bytes aleatorios. La sesión consulta `AUTH_SECRET` primero; `JWT_SECRET` solo se admite si se configuró explícitamente con longitud suficiente. Al cambiar la clave de sesión hay que iniciar sesión de nuevo. La autenticación ya no crea cuentas administrativas automáticamente.

Después de guardar las variables, publica un nuevo despliegue. Antes de activar subidas, aplica la migración de integridad revisada que crea `assets_catalogo`. El cron llama a `/api/cron/limpiar-imagenes`; una llamada sin su Bearer correcto debe recibir 401, y si falta configuración recibe 503. Una ejecución autorizada entrega únicamente un resumen de cantidades.

En un entorno con las variables cargadas, comprueba su presencia sin revelar valores:

```sh
node scripts/check-runtime-config.cjs
```

`ok: true` confirma presencia y longitud mínima; no confirma conexión MySQL, permisos Cloudinary ni la ejecución remota del cron. Comprueba esas funciones con una subida nueva y el flujo de guardar/cancelar del editor una vez autorizada la verificación en el entorno previsto. La limpieza espera 24 horas, conserva imágenes referenciadas en pedidos y reintenta los errores sin borrar recursos desconocidos.

Si la contraseña de una cuenta ya fue expuesta, debe sustituirse mediante el procedimiento administrativo de esa instalación; quitarla del repositorio no modifica automáticamente la contraseña guardada ni borra el historial de Git.

## Fotografías anteriores a esta corrección

La limpieza automática cubre las subidas nuevas registradas por la aplicación. Las fotografías que ya existían no tienen esa prueba de propiedad y no se borran al retirar un producto. Primero hay que rotar y configurar credenciales y realizar un inventario real; esa limpieza histórica sigue pendiente.

El siguiente inventario lee referencias de productos, snapshots de pedidos, catálogo oficial y registro de imágenes. Sin consultar el proveedor no puede descubrir archivos huérfanos y lo indica con `sinReferenciasLegadas: null`:

```sh
node scripts/auditar-assets-legados.cjs
```

Con credenciales nuevas, esta variante consulta únicamente el inventario de imágenes del proveedor bajo `adetallesbq/`; no sube, adopta ni borra recursos:

```sh
node scripts/auditar-assets-legados.cjs --provider
```

`--details` añade identificadores públicos y sus referencias, sin secretos ni datos de compradores. El inventario tiene un límite de páginas y declara si es completo. Un recurso sin referencias es un candidato a revisión, nunca una autorización de borrado. La adopción del legado requiere un procedimiento separado con comprobación de propiedad contra el proveedor, inventario completo, revisión explícita, espera mínima de 24 horas y nueva comprobación de referencias antes de cualquier borrado. El script actual no permite adoptar IDs antiguos automáticamente.
