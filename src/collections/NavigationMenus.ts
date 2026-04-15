import type { CollectionConfig } from 'payload'

export const NavigationMenus: CollectionConfig = {
  slug: 'navigation-menus',
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'url', 'target', 'order_sorting', 'is_active'],
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
      label: 'Label',
    },
    {
      name: 'url',
      type: 'text',
      required: true,
      label: 'URL',
    },
    {
      name: 'target',
      type: 'select',
      label: 'Target',
      defaultValue: '_self',
      options: [
        { label: 'Same Tab (_self)', value: '_self' },
        { label: 'New Tab (_blank)', value: '_blank' },
      ],
    },
    {
      name: 'order_sorting',
      type: 'number',
      label: 'Order / Sorting',
      defaultValue: 0,
    },
    {
      name: 'is_active',
      type: 'checkbox',
      label: 'Active',
      defaultValue: true,
    },
  ],
}
