import type { GlobalConfig } from 'payload'

export const HeroSection: GlobalConfig = {
  slug: 'hero-section',
  admin: {
    group: 'Sections',
  },
  fields: [
    {
      name: 'headline',
      type: 'text',
      required: true,
      label: 'Headline',
    },
    {
      name: 'subheadline',
      type: 'textarea',
      label: 'Subheadline',
    },
    {
      name: 'cta_primary_text',
      type: 'text',
      label: 'CTA Primary Text',
    },
    {
      name: 'cta_primary_url',
      type: 'text',
      label: 'CTA Primary URL',
    },
    {
      name: 'cta_secondary_text',
      type: 'text',
      label: 'CTA Secondary Text',
    },
    {
      name: 'cta_secondary_url',
      type: 'text',
      label: 'CTA Secondary URL',
    },
    {
      name: 'profile_image',
      type: 'upload',
      relationTo: 'media',
      label: 'Profile Image',
    },
    {
      name: 'background_image',
      type: 'upload',
      relationTo: 'media',
      label: 'Background Image',
    },
  ],
}
