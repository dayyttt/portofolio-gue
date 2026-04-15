import type { CollectionConfig } from 'payload'

export const SocialLinks: CollectionConfig = {
  slug: 'social-links',
  versions: {
    drafts: true,
  },
  admin: {
    useAsTitle: 'platform_name',
    defaultColumns: ['platform_name', 'url', '_status', 'order_sorting'],
  },
  fields: [
    {
      name: 'platform_name',
      type: 'text',
      required: true,
      label: 'Platform Name',
    },
    {
      name: 'url',
      type: 'text',
      required: true,
      label: 'URL',
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
