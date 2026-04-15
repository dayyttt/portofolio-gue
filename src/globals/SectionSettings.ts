import type { GlobalConfig } from 'payload'

const SECTION_KEYS = [
  'hero',
  'about',
  'expertise',
  'tech_stack',
  'featured_projects',
  'why_work_with_me',
  'work_process',
  'testimonials',
  'contact_cta',
] as const

export const SectionSettings: GlobalConfig = {
  slug: 'section-settings',
  admin: {
    group: 'Settings',
  },
  fields: [
    {
      name: 'sections',
      type: 'array',
      label: 'Sections',
      defaultValue: [
        { section_key: 'hero', label: 'Hero', is_visible: true, order_sorting: 0 },
        { section_key: 'about', label: 'About', is_visible: true, order_sorting: 1 },
        { section_key: 'expertise', label: 'Core Expertise', is_visible: true, order_sorting: 2 },
        { section_key: 'tech_stack', label: 'Tech Stack', is_visible: true, order_sorting: 3 },
        { section_key: 'featured_projects', label: 'Featured Projects', is_visible: true, order_sorting: 4 },
        { section_key: 'why_work_with_me', label: 'Why Work With Me', is_visible: true, order_sorting: 5 },
        { section_key: 'work_process', label: 'Work Process', is_visible: true, order_sorting: 6 },
        { section_key: 'testimonials', label: 'Testimonials', is_visible: true, order_sorting: 7 },
        { section_key: 'contact_cta', label: 'Contact CTA', is_visible: true, order_sorting: 8 },
      ],
      fields: [
        {
          name: 'section_key',
          type: 'select',
          required: true,
          label: 'Section',
          options: SECTION_KEYS.map((key) => ({
            label: key
              .split('_')
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' '),
            value: key,
          })),
        },
        {
          name: 'label',
          type: 'text',
          label: 'Display Label',
        },
        {
          name: 'is_visible',
          type: 'checkbox',
          defaultValue: true,
          label: 'Visible',
        },
        {
          name: 'order_sorting',
          type: 'number',
          defaultValue: 0,
          label: 'Order',
        },
      ],
    },
  ],
}
