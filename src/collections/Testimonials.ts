import type { CollectionConfig } from 'payload'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  versions: {
    drafts: true,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'company', '_status', 'order_sorting'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Name',
    },
    {
      name: 'position',
      type: 'text',
      required: true,
      label: 'Position',
    },
    {
      name: 'company',
      type: 'text',
      required: true,
      label: 'Company',
    },
    {
      name: 'quote',
      type: 'textarea',
      required: true,
      label: 'Quote',
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      label: 'Photo',
    },
    {
      name: 'order_sorting',
      type: 'number',
      label: 'Order / Sorting',
      defaultValue: 0,
    },
  ],
}
