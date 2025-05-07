import nodemailer from 'nodemailer';

export async function sendActivationEmail(email: string, name: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'No-Reply <gerencia@camaradeladiversidad.com>',
      to: email,
      subject: '¡Tu empresa ha sido activada!',
      html: `<p>Hola ${name},</p>
        <p>¡Tu empresa ha sido activada! Ya puedes ingresar a la plataforma.</p>
        <a href="https://app-compras-incluyentes.vercel.app/login">Iniciar sesión</a>`,
    });
    console.log('Correo de activación enviado exitosamente');
  } catch (error) {
    console.error('Error al enviar el correo de activación:', error);
    throw error;
  }
} 