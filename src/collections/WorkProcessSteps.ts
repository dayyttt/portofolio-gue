import type { CollectionConfig } from 'payload'

export const WorkProcessSteps: CollectionConfig = {
  slug: 'work-process-steps',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['step_number', 'title', 'order_sorting'],
  },
  fields: [
    {
      name: 'step_number',
      type: 'number',
      required: true,
      label: 'Step Number',
    },
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
