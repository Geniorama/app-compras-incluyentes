import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'opportunity',
  title: 'Oportunidades',
  type: 'document',
  fields: [
    defineField({
      name: 'company',
      title: 'Empresa publicadora',
      type: 'reference',
      to: [{ type: 'company' }],
      validation: (Rule) => Rule.required(),
      description: 'Solo empresas grandes pueden publicar licitaciones.',
      options: {
        filter: 'companySize == "grande"',
      },
    }),
    defineField({
      name: 'cover',
      title: 'Portada',
      type: 'image',
      description: 'Imagen de portada para la oportunidad. Opcional.',
      options: { hotspot: true },
    }),
    defineField({
      name: 'title',
      title: 'Título',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'startDate',
      title: 'Fecha de inicio',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'maxApplicationDate',
      title: 'Fecha máxima de postulación',
      type: 'datetime',
      validation: (Rule) =>
        Rule.required().custom((maxDate, context) => {
          const startDate = (context.document as { startDate?: string })?.startDate;
          if (!startDate || !maxDate) return true;
          return (
            new Date(maxDate as string) >= new Date(startDate) ||
            'La fecha máxima debe ser igual o posterior a la fecha de inicio'
          );
        }),
    }),
    defineField({
      name: 'description',
      title: 'Descripción',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'requirements',
      title: 'Requisitos',
      type: 'text',
      description: 'Requisitos para postularse a esta licitación.',
    }),
    defineField({
      name: 'contractValue',
      title: 'Valor del contrato',
      type: 'number',
      description: 'Valor estimado del contrato (opcional).',
    }),
    defineField({
      name: 'status',
      title: 'Estado',
      type: 'string',
      options: {
        list: [
          { title: 'Borrador', value: 'draft' },
          { title: 'Abierta', value: 'open' },
          { title: 'Cerrada', value: 'closed' },
        ],
      },
      initialValue: 'draft',
    }),
    defineField({
      name: 'applications',
      title: 'Empresas postuladas',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'company' }] }],
      description: 'Empresas que se han postulado. Cualquier tipo de empresa puede postularse.',
      validation: (Rule) =>
        Rule.custom((applications) => {
          if (!Array.isArray(applications)) return true;
          const refs = (applications as Array<{ _ref?: string }>)
            .map((a) => a?._ref)
            .filter((r): r is string => Boolean(r));
          const unique = new Set(refs);
          if (refs.length !== unique.size) {
            return 'Una empresa no puede postularse más de una vez a la misma oportunidad';
          }
          return true;
        }),
    }),
    defineField({
      name: 'createdAt',
      title: 'Fecha de creación',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'updatedAt',
      title: 'Fecha de actualización',
      type: 'datetime',
      readOnly: true,
    }),
  ],
  orderings: [
    { title: 'Fecha de inicio (más reciente)', name: 'startDateDesc', by: [{ field: 'startDate', direction: 'desc' }] },
    { title: 'Fecha máxima postulación (próxima)', name: 'maxApplicationDateAsc', by: [{ field: 'maxApplicationDate', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'title', company: 'company.nameCompany', startDate: 'startDate', status: 'status' },
    prepare({ title, company, startDate, status }) {
      const date = startDate ? new Date(startDate).toLocaleDateString('es-CO') : 'Sin fecha';
      const statusLabel = status === 'open' ? 'Abierta' : status === 'closed' ? 'Cerrada' : 'Borrador';
      return {
        title: title || 'Sin título',
        subtitle: `${company || 'Sin empresa'} · ${date} · ${statusLabel}`,
      };
    },
  },
});
