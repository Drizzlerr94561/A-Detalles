# 🚀 Guía: Configuración de Correo Profesional con Dominio Propio (Cero Spam)

Esta guía contiene los pasos exactos para cuando publiques **Adetallesbq** en internet con tu propio dominio (ejemplo: `adetallesbq.com`), garantizando que los correos de bienvenida lleguen **100% directo a la Bandeja Principal** de los clientes (Gmail, Outlook, Yahoo) sin caer jamás en Spam.

---

## 📋 Resumen de lo que se necesita

1. **Tu dominio propio** (ejemplo: `adetallesbq.com` comprado en GoDaddy, Namecheap, DonDominio o Hostinger).
2. **Una cuenta en un servicio transaccional profesional** (Recomendado: **Resend** o **Brevo**, ambos tienen plan gratuito con miles de correos al mes).
3. **Firmas digitales en los DNS de tu dominio**:
   * **SPF**: Certifica que el servidor tiene permiso para enviar correos en tu nombre.
   * **DKIM**: Firma digital criptográfica que evita que alguien altere el correo en el camino.
   * **DMARC**: Le dice a Google y Microsoft que rechacen correos falsos que intenten suplantar tu marca.

---

## 🛠️ Paso a Paso para Producción

### Paso 1: Crear cuenta en Resend (Servicio Oficial moderno de Next.js)
1. Entra a [resend.com](https://resend.com) y crea tu cuenta gratuita.
2. Ve a la sección **Domains** -> Haz clic en **Add Domain**.
3. Escribe tu dominio (ejemplo: `adetallesbq.com`).

### Paso 2: Copiar los registros DNS en tu proveedor de dominio
Resend te mostrará una tabla con 3 registros DNS para copiar y pegar en el panel de control donde compraste tu dominio:

| Tipo | Nombre / Host | Valor / Destino |
| :--- | :--- | :--- |
| **TXT** | `resend._domainkey` | (clave que te da Resend) |
| **TXT** | `@` o nombre de dominio | `v=spf1 include:amazonses.com ~all` |
| **MX** | `feedback` | `feedback-smtp.us-east-1.amazonses.com` |

Una vez pegados, le das clic a **Verify DNS** en Resend. (Tarda unos minutos en activarse en verde).

### Paso 3: Generar la API Key de Resend
1. En Resend, ve a **API Keys** -> Haz clic en **Create API Key**.
2. Dale un nombre (ej: `Adetallesbq Web`) y copia la clave que empieza por `re_...`.

### Paso 4: Actualizar las variables de entorno en tu servidor
En el panel de tu hosting de producción (Vercel, Railway o tu servidor VPS), añades estas variables:

```env
RESEND_API_KEY="re_123456789abcdef..."
EMAIL_FROM="Adetallesbq <bienvenida@adetallesbq.com>"
NEXT_PUBLIC_WHATSAPP_PHONE="573000000000"
```

---

## 💬 Mensaje listo para pedirle a tu Asistente IA en ese momento:

Cuando tengas tu dominio y tu clave de Resend listos, solo debes copiar y pegar este mensaje aquí:

> *"Ya tengo mi dominio propio configurado y mi API Key de Resend. Por favor reemplaza el transporte de Nodemailer actual por Resend para que todos los correos salgan desde bienvenida@adetallesbq.com hacia la bandeja principal de los clientes."*

Con solo esa instrucción, se adaptará el código en 1 minuto y quedará funcionando al 100%.
