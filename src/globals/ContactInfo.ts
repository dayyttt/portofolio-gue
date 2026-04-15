import type { GlobalConfig } from 'payload'

export const ContactInfo: GlobalConfig = {
  slug: 'contact-info',
  admin: {
    group: 'Settings',
  },
  fields: [
    {
      name: 'whatsapp',
      type: 'text',
      label: 'WhatsApp Number',
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      label: 'Email',
    },
    {
      name: 'linkedin_url',
      type: 'text',
      label: 'LinkedIn URL',
    },
    {
      name: 'github_url',
      type: 'text',
      label: 'GitHub URL',
    },
    {
      name: 'cta_text',
      type: 'text',
      label: 'CTA Text',
    },
    {
      name: 'cta_subtitle',
      type: 'text',
      label: 'CTA Subtitle',
    },
  ],
}
