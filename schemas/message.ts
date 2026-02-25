import {defineType} from 'sanity'

export default defineType({
  name: 'message',
  title: 'Mensajes',
  type: 'document',
  fields: [
    {
      name: 'subject',
      title: 'Asunto',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'content',
      title: 'Contenido',
      type: 'text',
      validation: Rule => Rule.required()
    },
    {
      name: 'sender',
      title: 'Usuario remitente',
      type: 'reference',
      to: [{ type: 'user' }],
      description: 'Usuario específico que envió el mensaje',
      validation: Rule => Rule.required()
    },
    {
      name: 'senderCompany',
      title: 'Empresa remitente',
      type: 'reference',
      to: [{ type: 'company' }],
      description: 'Empresa desde la cual se envía el mensaje',
      validation: Rule => Rule.required()
    },
    {
      name: 'recipientCompany',
      title: 'Empresa destinataria',
      type: 'reference',
      to: [{ type: 'company' }],
      description: 'Empresa que recibe el mensaje (opcional si el mensaje es a una persona)'
    },
    {
      name: 'recipientUser',
      title: 'Usuario destinatario (mensaje persona a persona)',
      type: 'reference',
      to: [{ type: 'user' }],
      description: 'Cuando se envía a una persona en lugar de a una empresa. Los Miembros reciben el mensaje por email.'
    },
    {
      name: 'createdAt',
      title: 'Fecha de envío',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: Rule => Rule.required()
    },
    {
      name: 'read',
      title: 'Leído',
      type: 'boolean',
      initialValue: false
    },
    {
      name: 'deleted',
      title: 'Eliminado',
      type: 'boolean',
      initialValue: false,
      hidden: true
    },
    {
      name: 'type',
      title: 'Tipo de mensaje',
      type: 'string',
      options: {
        list: [
          { title: 'Mensaje entre empresas', value: 'company_message' },
          { title: 'Mensaje persona a persona', value: 'person_message' },
          { title: 'Notificación', value: 'notification' },
          { title: 'Soporte', value: 'support' },
          { title: 'Alerta', value: 'alert' }
        ]
      },
      initialValue: 'company_message'
    }
  ],
  orderings: [
    {
      title: 'Fecha de envío',
      name: 'createdAtDesc',
      by: [
        {field: 'createdAt', direction: 'desc'}
      ]
    }
  ],
  preview: {
    select: {
      sender: 'sender.firstName',
      senderCompany: 'senderCompany.nameCompany',
      recipientCompany: 'recipientCompany.nameCompany',
      recipientUser: 'recipientUser.firstName',
      recipientUserLast: 'recipientUser.lastName',
      subject: 'subject',
      content: 'content'
    },
    prepare(selection) {
      const {sender, senderCompany, recipientCompany, recipientUser, recipientUserLast, subject, content} = selection;
      const recipient = recipientCompany || (recipientUser ? `${recipientUser} ${recipientUserLast || ''}`.trim() : 'N/A');
      return {
        title: subject || content?.substring(0, 50) + '...',
        subtitle: `${senderCompany || 'N/A'} → ${recipient} (por: ${sender || 'N/A'})`
      };
    }
  },
})
