import nodemailer from 'nodemailer';

export async function sendActivationEmail(email: string, name: string, companyName: string) {
  let host = process.env.SMTP_HOST || 'smtp-relay.sendinblue.com';
  if (host === 'smtp-relay.brevo.com') host = 'smtp-relay.sendinblue.com';
  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const from = process.env.SMTP_FROM;
  if (!from) {
    throw new Error('SMTP_FROM debe estar configurado con un remitente verificado en Brevo (ej: "No-Reply <tu-email@tudominio.com>")');
  }

  try {
    await transporter.verify();

    const info = await transporter.sendMail({
      from,
      to: email,
      subject: `¡${companyName} ha sido activada en la plataforma!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">¡Bienvenido/a a la plataforma!</h2>
          <p>Hola ${name},</p>
          <p>Nos complace informarte que la empresa <strong>${companyName}</strong> ha sido activada en nuestra plataforma de compras incluyentes.</p>
          <p>Como usuario asociado a esta empresa, ya puedes acceder a todas las funcionalidades de la plataforma.</p>
          <div style="margin: 30px 0;">
            <a href="https://app-compras-incluyentes.vercel.app/login" 
               style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              Iniciar sesión
            </a>
          </div>
          <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
          <p>Saludos cordiales,<br>Equipo de Compras Incluyentes</p>
        </div>
      `,
    });
    
    return info;
  } catch (error) {
    console.error('Error detallado al enviar el correo:', error);
    throw error;
  }
} 