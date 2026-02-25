import { defineField, defineType } from 'sanity'

/**
 * Schema para respuestas del cuestionario de experiencia con la plataforma.
 * Agregar este archivo a tu Sanity Studio en schemas/index.ts
 */
export default defineType({
  name: 'platformSurveyResponse',
  title: 'Respuestas Cuestionario Plataforma',
  type: 'document',
  fields: [
    defineField({
      name: 'user',
      title: 'Usuario',
      type: 'reference',
      to: [{ type: 'user' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'firebaseUid',
      title: 'Firebase UID',
      type: 'string',
      description: 'Identificador del usuario en Firebase para búsquedas',
      readOnly: true,
    }),
    defineField({
      name: 'experienceRating',
      title: 'Calificación de experiencia',
      type: 'number',
      description: 'Del 1 al 5: ¿Cómo calificarías tu experiencia general con la plataforma?',
      validation: (Rule) => Rule.required().min(1).max(5),
    }),
    defineField({
      name: 'helpedGetClients',
      title: '¿La plataforma te ha ayudado a conseguir clientes?',
      type: 'string',
      options: {
        list: [
          { title: 'Sí', value: 'si' },
          { title: 'No', value: 'no' },
          { title: 'En parte', value: 'en-parte' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'helpedGetProjects',
      title: '¿La plataforma te ha ayudado a conseguir proyectos?',
      type: 'string',
      options: {
        list: [
          { title: 'Sí', value: 'si' },
          { title: 'No', value: 'no' },
          { title: 'En parte', value: 'en-parte' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'recommendationScore',
      title: '¿Qué tan probable es que recomiendes la plataforma? (0-10)',
      type: 'number',
      description: 'Escala NPS: 0 = Muy improbable, 10 = Muy probable',
      validation: (Rule) => Rule.required().min(0).max(10),
    }),
    defineField({
      name: 'additionalComments',
      title: 'Comentarios o sugerencias adicionales',
      type: 'text',
      description: 'Opcional',
    }),
    defineField({
      name: 'submittedAt',
      title: 'Fecha de envío',
      type: 'datetime',
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      title: 'user.firstName',
      subtitle: 'submittedAt',
    },
    prepare({ title, subtitle }) {
      return {
        title: title ? `Encuesta: ${title}` : 'Respuesta sin usuario',
        subtitle: subtitle ? new Date(subtitle).toLocaleDateString('es-CO') : '',
      }
    },
  },
})
