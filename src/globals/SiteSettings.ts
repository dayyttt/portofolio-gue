import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  admin: {
    group: 'Settings',
  },
  fields: [
    {
      name: 'site_name',
      type: 'text',
      required: true,
      label: 'Site Name',
    },
    {
      name: 'tagline',
      type: 'text',
      label: 'Tagline',
    },
    {
      name: 'favicon',
      type: 'upload',
      relationTo: 'media',
      label: 'Favicon',
    },
    {
      name: 'og_image',
      type: 'upload',
      relationTo: 'media',
      label: 'Default OG Image',
    },
    {
      name: 'ga_id',
      type: 'text',
      label: 'Google Analytics ID',
    },
  ],
}
