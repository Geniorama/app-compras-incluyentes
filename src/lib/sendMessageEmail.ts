import nodemailer from 'nodemailer';

const getTransporter = () => {
  let host = process.env.SMTP_HOST || 'smtp-relay.sendinblue.com';
  if (host === 'smtp-relay.brevo.com') {
    host = 'smtp-relay.sendinblue.com';
  }
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    throw new Error('SMTP_USER y SMTP_PASS deben estar configurados en las variables de entorno');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: process.env.SMTP_TLS_REJECT_UNAUTHORIZED === 'false' ? { rejectUnauthorized: false } : undefined,
  });
};

export async function sendMessageEmail(
  toEmail: string,
  recipientName: string,
  senderName: string,
  senderCompanyName: string,
  subject: string,
  content: string
) {
  const transporter = getTransporter();

  try {
    await transporter.verify();
  } catch (err) {
    console.error('Error verificando conexión SMTP:', err);
    throw err;
  }

  const from = process.env.SMTP_FROM;
  if (!from) {
    throw new Error('SMTP_FROM debe estar configurado con un remitente verificado en Brevo (ej: "No-Reply <tu-email@tudominio.com>")');
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app-compras-incluyentes.vercel.app';

  await transporter.sendMail({
    from,
    to: toEmail,
    subject: `[Compras Incluyentes] ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Tienes un nuevo mensaje</h2>
        <p>Hola ${recipientName},</p>
        <p><strong>${senderName}</strong> de <strong>${senderCompanyName}</strong> te ha enviado un mensaje a través de la plataforma Compras Incluyentes:</p>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 8px;"><strong>Asunto:</strong> ${subject}</p>
          <p style="margin: 0; white-space: pre-wrap;">${content}</p>
        </div>
        <p>Puedes responder desde la plataforma si tienes acceso, o contactando directamente a ${senderName}.</p>
        <div style="margin: 30px 0;">
          <a href="${appUrl}/login" 
             style="background-color: #4C66F7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Ir a la plataforma
          </a>
        </div>
        <p style="color: #666; font-size: 12px;">Este mensaje fue enviado desde la plataforma Compras Incluyentes.</p>
      </div>
    `,
  });
}
