import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

// Collections
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { NavigationMenus } from './collections/NavigationMenus'
import { ExpertiseItems } from './collections/ExpertiseItems'
import { TechStackItems } from './collections/TechStackItems'
import { WhyWorkWithMeItems } from './collections/WhyWorkWithMeItems'
import { WorkProcessSteps } from './collections/WorkProcessSteps'
import { Testimonials } from './collections/Testimonials'
import { SocialLinks } from './collections/SocialLinks'
import { ProjectCategories } from './collections/ProjectCategories'
import { Projects } from './collections/Projects'

// Globals
import { SiteSettings } from './globals/SiteSettings'
import { HeroSection } from './globals/HeroSection'
import { AboutSection } from './globals/AboutSection'
import { ContactInfo } from './globals/ContactInfo'
import { FooterSettings } from './globals/FooterSettings'
import { SeoSettings } from './globals/SeoSettings'
import { SectionSettings } from './globals/SectionSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    NavigationMenus,
    ExpertiseItems,
    TechStackItems,
    WhyWorkWithMeItems,
    WorkProcessSteps,
    Testimonials,
    SocialLinks,
    ProjectCategories,
    Projects,
  ],
  globals: [
    SiteSettings,
    HeroSection,
    AboutSection,
    ContactInfo,
    FooterSettings,
    SeoSettings,
    SectionSettings,
  ],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
  }),
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || 'fallback-secret-change-in-production',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  upload: {
    limits: {
      fileSize: 5242880, // 5MB
    },
  },
})
