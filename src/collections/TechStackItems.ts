import type { CollectionConfig } from 'payload'

export const TechStackItems: CollectionConfig = {
  slug: 'tech-stack-items',
  versions: {
    drafts: true,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', '_status', 'order_sorting'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Name',
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Logo',
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      label: 'Category',
      options: [
        { label: 'Frontend', value: 'Frontend' },
        { label: 'Backend', value: 'Backend' },
        { label: 'Database', value: 'Database' },
        { label: 'DevOps', value: 'DevOps' },
        { label: 'Mobile', value: 'Mobile' },
        { label: 'Other', value: 'Other' },
      ],
    },
    {
      name: 'order_sorting',
      type: 'number',
      label: 'Order / Sorting',
      defaultValue: 0,
    },
  ],
}
