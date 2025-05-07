import nodemailer from 'nodemailer';

export async function sendActivationEmail(email: string, name: string) {
  console.log('Iniciando configuración del transporter...');
  console.log('Host:', process.env.SMTP_HOST);
  console.log('Port:', process.env.SMTP_PORT);
  console.log('User:', process.env.SMTP_USER);
  
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
    // Verificar la conexión
    console.log('Verificando conexión SMTP...');
    await transporter.verify();
    console.log('Conexión SMTP verificada correctamente');

    console.log('Intentando enviar email a:', email);
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'No-Reply <gerencia@camaradeladiversidad.com>',
      to: email,
      subject: '¡Tu empresa ha sido activada!',
      html: `<p>Hola ${name},</p>
        <p>¡Tu empresa ha sido activada! Ya puedes ingresar a la plataforma.</p>
        <a href="https://app-compras-incluyentes.vercel.app/login">Iniciar sesión</a>`,
    });
    
    console.log('Correo de activación enviado exitosamente');
    console.log('Message ID:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error detallado al enviar el correo:', error);
    throw error;
  }
} 