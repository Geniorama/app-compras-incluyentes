import nodemailer from 'nodemailer';

export async function sendActivationEmail(email: string, name: string, companyName: string) {
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
    
    console.log('Correo de activación enviado exitosamente');
    console.log('Message ID:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error detallado al enviar el correo:', error);
    throw error;
  }
} 