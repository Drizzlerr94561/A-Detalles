import nodemailer from "nodemailer";

/**
 * Genera el cliente de transporte SMTP con Nodemailer
 */
function getTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: user.trim(),
      pass: pass.trim().replace(/\s+/g, ""), // Soporta contraseñas de app con o sin espacios
    },
  });
}

/**
 * Genera la plantilla HTML responsiva del correo de bienvenida para Adetallesbq
 */
function getWelcomeEmailHtml({ nombre, email }) {
  const whatsappPhone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "573106629289";
  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
    `Hola A’Detalles, me acabo de registrar con el correo ${email} y quisiera asesoría para un detalle especial.`
  )}`;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>¡Bienvenido/a a A’Detalles!</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #faf6f4;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #5c4a42;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #faf6f4;
      padding: 30px 10px;
    }
    .main-table {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 24px;
      border: 1px solid #ebd3cb;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(140, 107, 93, 0.08);
    }
    .header {
      background: linear-gradient(135deg, #f8ece8 0%, #f3dcd3 100%);
      padding: 36px 24px;
      text-align: center;
      border-bottom: 1px solid #ebd3cb;
    }
    .logo-title {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: 2px;
      color: #5c4a42;
      text-transform: uppercase;
      margin: 0;
    }
    .logo-subtitle {
      font-size: 11px;
      letter-spacing: 3px;
      color: #8c6b5d;
      text-transform: uppercase;
      margin-top: 4px;
      font-weight: 600;
    }
    .content {
      padding: 36px 30px;
    }
    .greeting {
      font-size: 22px;
      font-weight: 700;
      color: #5c4a42;
      margin: 0 0 14px 0;
    }
    .intro-text {
      font-size: 14px;
      line-height: 1.65;
      color: #786055;
      margin: 0 0 24px 0;
    }
    .features-card {
      background-color: #faf6f4;
      border: 1px solid #ebd3cb;
      border-radius: 18px;
      padding: 20px 22px;
      margin-bottom: 24px;
    }
    .features-title {
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 1.5px;
      color: #8c6b5d;
      text-transform: uppercase;
      margin: 0 0 12px 0;
    }
    .feature-item {
      font-size: 13px;
      line-height: 1.6;
      color: #5c4a42;
      margin: 8px 0;
    }
    .account-box {
      background-color: #fff9f7;
      border-left: 4px solid #c29486;
      padding: 14px 18px;
      border-radius: 10px;
      margin-bottom: 28px;
    }
    .account-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #8c6b5d;
      font-weight: 700;
      margin: 0 0 4px 0;
    }
    .account-value {
      font-size: 13px;
      color: #5c4a42;
      font-weight: 600;
      margin: 0;
    }
    .cta-section {
      background: linear-gradient(135deg, #f8ece8 0%, #faf6f4 100%);
      border: 1px dashed #ebd3cb;
      border-radius: 20px;
      padding: 24px;
      text-align: center;
      margin-bottom: 28px;
    }
    .cta-title {
      font-size: 16px;
      font-weight: 700;
      color: #5c4a42;
      margin: 0 0 8px 0;
    }
    .cta-desc {
      font-size: 13px;
      color: #786055;
      line-height: 1.5;
      margin: 0 0 18px 0;
    }
    .button-whatsapp {
      display: inline-block;
      background-color: #8c6b5d;
      color: #ffffff !important;
      text-decoration: none;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      padding: 14px 28px;
      border-radius: 50px;
      box-shadow: 0 4px 12px rgba(140, 107, 93, 0.25);
    }
    .footer {
      border-top: 1px solid #f4e6e1;
      padding: 24px 30px 30px 30px;
      text-align: center;
      font-size: 12px;
      color: #a88d81;
      line-height: 1.6;
    }
    .signature {
      font-size: 14px;
      font-weight: 700;
      color: #8c6b5d;
      margin: 0 0 4px 0;
    }
    .tagline {
      font-style: italic;
      color: #a88d81;
      margin: 0 0 14px 0;
    }
    .instagram-link {
      display: inline-block;
      color: #8c6b5d;
      font-weight: 700;
      text-decoration: none;
      font-size: 12px;
      padding: 6px 14px;
      background-color: #faf6f4;
      border: 1px solid #ebd3cb;
      border-radius: 30px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="main-table" cellpadding="0" cellspacing="0" width="100%">
      <!-- HEADER -->
      <tr>
        <td class="header">
          <h1 class="logo-title">A’DETALLES</h1>
          <div class="logo-subtitle">BREAKFAST &amp; GIFTS</div>
        </td>
      </tr>

      <!-- CONTENT -->
      <tr>
        <td class="content">
          <h2 class="greeting">¡HOLA, ${nombre ? nombre.toUpperCase() : "CLIENTE"}! ✨</h2>
          
          <p class="intro-text">
            Nos llena de alegría darte la bienvenida a nuestra familia. Desde hoy tienes un lugar especial reservado con nosotros para hacer que cualquier mañana ordinaria se convierta en un recuerdo inolvidable.
          </p>

          <!-- FEATURES CARD -->
          <div class="features-card">
            <div class="features-title">¿Qué encontrarás en A’Detalles?</div>
            <div class="feature-item">🌸 <strong>Desayunos Sorpresa Artesanales:</strong> panadería recién horneada y fruta fresca de temporada.</div>
            <div class="feature-item">🌹 <strong>Cajas de Lujo &amp; Floristería:</strong> ramos elaborados con rosas de exportación de corte reciente.</div>
            <div class="feature-item">🧸 <strong>Detalles &amp; Peluches:</strong> peluches tiernos y empaques personalizados con tarjeta dedicatoria.</div>
            <div class="feature-item">🚀 <strong>Despachos puntuales a domicilio:</strong> en toda Barranquilla entregas el mismo día.</div>
          </div>

          <!-- ACCOUNT INFO -->
          <div class="account-box">
            <div class="account-label">DATOS DE TU CUENTA</div>
            <div class="account-value">• Correo registrado: ${email}</div>
            <div class="account-value">• Estado de cuenta: Activa y verificada</div>
          </div>

          <!-- CTA WHATSAPP -->
          <div class="cta-section">
            <div class="cta-title">¿TIENES UNA FECHA ESPECIAL MUY PRONTO? 🎂</div>
            <p class="cta-desc">
              Si se acerca un cumpleaños, aniversario o simplemente quieres sacarle una sonrisa a esa persona especial, ¡estamos listos para ayudarte a armar el regalo perfecto!
            </p>
            <a href="${whatsappUrl}" target="_blank" class="button-whatsapp">
              HABLAR CON UNA ASESORA POR WHATSAPP
            </a>
          </div>
        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td class="footer">
          <div class="signature">Con mucho cariño, El equipo de A’Detalles 🌸</div>
          <div class="tagline">"Diseñamos emociones que perduran"</div>
          <a href="https://instagram.com/Adetallesbq" target="_blank" class="instagram-link">
            📸 Síguenos en Instagram: @Adetallesbq
          </a>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Envía el correo de bienvenida al registrarse en la plataforma.
 * No interrumpe el flujo si el servidor SMTP no está configurado aún en el archivo .env.
 *
 * @param {{ to: string, nombre: string }} options
 * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
 */
export async function sendWelcomeEmail({ to, nombre }) {
  try {
    const transporter = getTransporter();

    if (!transporter) {
      console.warn(
        `[EMAIL] SMTP_USER o SMTP_PASS no configurados en .env. El correo de bienvenida a ${to} se omite.`
      );
      return { success: false, error: "SMTP no configurado en .env" };
    }

    const fromAddress = process.env.SMTP_USER;
    const htmlContent = getWelcomeEmailHtml({ nombre, email: to });

    const info = await transporter.sendMail({
      from: `"A’Detalles - Breakfast & Gifts" <${fromAddress}>`,
      to,
      subject: "¡Bienvenido/a a A’Detalles! 🎁 Tu cuenta está lista",
      html: htmlContent,
      text: `¡Hola, ${nombre}! Bienvenido a A’Detalles. Tu cuenta (${to}) ha sido creada con éxito. Despachos puntuales a domicilio en toda Barranquilla entregas el mismo día. Escríbenos a WhatsApp para personalizar tu pedido. Síguenos en Instagram: @Adetallesbq`,
    });

    console.log(`[EMAIL] Correo de bienvenida enviado a ${to}. ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EMAIL] Error al enviar correo de bienvenida a ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}
