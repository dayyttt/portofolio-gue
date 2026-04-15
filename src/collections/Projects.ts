import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Projects: CollectionConfig = {
  slug: 'projects',
  versions: {
    drafts: true,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'category', 'featured_status', '_status', 'order_sorting'],
  },
  indexes: [
    { fields: ['slug'] },
    { fields: ['_status'] },
    { fields: ['featured_status'] },
  ],
  fields: [
    // --- Tabs ---
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
              label: 'Title',
            },
            {
              name: 'slug',
              type: 'text',
              required: true,
              unique: true,
              index: true,
              label: 'Slug',
              admin: {
                description: 'URL-friendly identifier. Must be unique across all projects.',
              },
            },
            {
              name: 'short_description',
              type: 'textarea',
              required: true,
              label: 'Short Description',
            },
            {
              name: 'full_description',
              type: 'richText',
              label: 'Full Description',
              editor: lexicalEditor({}),
            },
            {
              name: 'thumbnail',
              type: 'upload',
              relationTo: 'media',
              required: true,
              label: 'Thumbnail',
            },
            {
              name: 'gallery',
              type: 'array',
              label: 'Gallery',
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                  label: 'Image',
                },
              ],
            },
            {
              name: 'category',
              type: 'relationship',
              relationTo: 'project-categories',
              required: true,
              label: 'Category',
            },
          ],
        },
        {
          label: 'Details',
          fields: [
            {
              name: 'tech_stack',
              type: 'array',
              label: 'Tech Stack',
              fields: [
                {
                  name: 'technology',
                  type: 'text',
                  required: true,
                  label: 'Technology',
                },
              ],
            },
            {
              name: 'role',
              type: 'text',
              label: 'Role',
            },
            {
              name: 'responsibilities',
              type: 'array',
              label: 'Responsibilities',
              fields: [
                {
                  name: 'item',
                  type: 'text',
                  required: true,
                  label: 'Responsibility',
                },
              ],
            },
            {
              name: 'key_features',
              type: 'array',
              label: 'Key Features',
              fields: [
                {
                  name: 'item',
                  type: 'text',
                  required: true,
                  label: 'Feature',
                },
              ],
            },
            {
              name: 'result_impact',
              type: 'textarea',
              label: 'Result / Impact',
            },
            {
              name: 'project_year',
              type: 'number',
              label: 'Project Year',
            },
            {
              name: 'duration',
              type: 'text',
              label: 'Duration',
            },
          ],
        },
        {
          label: 'Settings',
          fields: [
            {
              name: 'featured_status',
              type: 'checkbox',
              label: 'Featured',
              defaultValue: false,
              admin: {
                description: 'Show this project in the Featured Projects section on the homepage.',
              },
            },
            {
              name: 'order_sorting',
              type: 'number',
              label: 'Order / Sorting',
              defaultValue: 0,
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            {
              name: 'meta',
              type: 'group',
              label: 'SEO Meta',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  label: 'Meta Title',
                },
                {
                  name: 'description',
                  type: 'textarea',
                  label: 'Meta Description',
                },
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'OG Image',
                },
                {
                  name: 'canonical_url',
                  type: 'text',
                  label: 'Canonical URL',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
