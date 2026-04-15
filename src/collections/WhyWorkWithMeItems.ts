import type { CollectionConfig } from 'payload'

export const WhyWorkWithMeItems: CollectionConfig = {
  slug: 'why-work-with-me-items',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'order_sorting'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Title',
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      label: 'Description',
    },
    {
      name: 'icon',
      type: 'text',
      label: 'Icon (class name or SVG string)',
    },
    {
      name: 'order_sorting',
      type: 'number',
      label: 'Order / Sorting',
      defaultValue: 0,
    },
  ],
}
