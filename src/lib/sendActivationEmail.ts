import nodemailer from 'nodemailer';

export async function sendActivationEmail(email: string, name: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: 'No-Reply <no-reply@tusitio.com>',
    to: email,
    subject: '¡Tu empresa ha sido activada!',
    html: `<p>Hola ${name},</p>
      <p>¡Tu empresa ha sido activada! Ya puedes ingresar a la plataforma.</p>
      <a href="https://tusitio.com/login">Iniciar sesión</a>`,
  });
} 