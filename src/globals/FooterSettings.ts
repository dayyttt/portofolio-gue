import type { GlobalConfig } from 'payload'

export const FooterSettings: GlobalConfig = {
  slug: 'footer-settings',
  admin: {
    group: 'Settings',
  },
  fields: [
    {
      name: 'copyright_text',
      type: 'text',
      label: 'Copyright Text',
    },
    {
      name: 'footer_tagline',
      type: 'text',
      label: 'Footer Tagline',
    },
    {
      name: 'show_social_links',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show Social Links',
    },
  ],
}
