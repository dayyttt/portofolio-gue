import type { GlobalConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const AboutSection: GlobalConfig = {
  slug: 'about-section',
  admin: {
    group: 'Sections',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
      label: 'Heading',
    },
    {
      name: 'bio_text',
      type: 'richText',
      editor: lexicalEditor({}),
      label: 'Bio Text',
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      label: 'Photo',
    },
    {
      name: 'years_of_experience',
      type: 'number',
      label: 'Years of Experience',
    },
    {
      name: 'projects_completed',
      type: 'number',
      label: 'Projects Completed',
    },
    {
      name: 'clients_served',
      type: 'number',
      label: 'Clients Served',
    },
  ],
}
