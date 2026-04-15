import type { GlobalConfig } from 'payload'

export const SeoSettings: GlobalConfig = {
  slug: 'seo-settings',
  admin: {
    group: 'Settings',
  },
  fields: [
    {
      name: 'default_meta_title',
      type: 'text',
      label: 'Default Meta Title',
    },
    {
      name: 'default_meta_description',
      type: 'textarea',
      label: 'Default Meta Description',
    },
    {
      name: 'default_og_image',
      type: 'upload',
      relationTo: 'media',
      label: 'Default OG Image',
    },
    {
      name: 'gsc_verification_code',
      type: 'text',
      label: 'Google Search Console Verification Code',
    },
  ],
}
