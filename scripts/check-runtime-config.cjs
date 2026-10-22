// Revisa únicamente presencia y tamaño; nunca imprime valores de configuración.
function revisarConfiguracion(env) {
  const definido = (nombre) => typeof env[nombre] === "string" && env[nombre].trim().length > 0;
  const suficiente = (valor) => typeof valor === "string" && Buffer.byteLength(valor, "utf8") >= 32;
  const nombres = ["DATABASE_URL", "AUTH_SECRET", "JWT_SECRET", "CRON_SECRET", "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"];
  const presentes = Object.fromEntries(nombres.map((nombre) => [nombre, definido(nombre)]));
  const auth = env.AUTH_SECRET || env.JWT_SECRET;
  const autenticacionConfigurada = suficiente(auth);
  const limpiezaConfigurada = suficiente(env.CRON_SECRET);
  const imagenesConfiguradas = ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"].every(definido);
  return { presentes, autenticacionConfigurada, limpiezaConfigurada, imagenesConfiguradas,
    ok: presentes.DATABASE_URL && autenticacionConfigurada && limpiezaConfigurada && imagenesConfiguradas };
}

if (require.main === module) {
  require("@next/env").loadEnvConfig(process.cwd(), false, { info() {}, error() {} });
  const resultado = revisarConfiguracion(process.env);
  console.log(JSON.stringify(resultado, null, 2));
  if (!resultado.ok) process.exitCode = 2;
}

module.exports = { revisarConfiguracion };
