# Design Document — Portfolio Hidayat CMS

## Overview

Sistem ini adalah portfolio personal + CMS untuk Hidayat Syahidin Ambo, seorang Full Stack Developer. Arsitektur menggunakan **monorepo berbasis Next.js** dengan Payload CMS v3 sebagai backend terintegrasi:

1. **Payload CMS v3** — berjalan di dalam Next.js App Router, menyediakan Admin Panel (`/admin`), REST API otomatis, Local API, dan PostgreSQL adapter.
2. **Next.js (App Router, SSR)** — frontend portfolio publik yang mengonsumsi data via Payload Local API (server-side) untuk SEO optimal.

Seluruh konten bersifat data-driven; tidak ada hardcoded content di frontend. Admin mengelola semua konten melalui Payload Admin UI tanpa menyentuh kode.

```mermaid
graph TD
    Visitor -->|HTTP| NextJS[Next.js App Router\nSSR + RSC]
    Admin -->|HTTP /admin| PayloadAdmin[Payload CMS\nAdmin UI]
    NextJS -->|Local API| Payload[Payload CMS\nCollections + Globals]
    PayloadAdmin -->|Local API| Payload
    Payload -->|@payloadcms/db-postgres| DB[(PostgreSQL)]
    Payload -->|File| Storage[Storage\nLocal / S3]
```

---

## Architecture

### Tech Stack

| Layer | Technology | Alasan |
|---|---|---|
| CMS + Backend | Payload CMS v3 | Collections, Globals, built-in admin UI, REST + Local API, auth terintegrasi |
| Frontend | Next.js 15 (App Router, SSR) | RSC untuk data fetching server-side, SEO optimal, file-based routing |
| Database | PostgreSQL | JSON support, production-grade, didukung `@payloadcms/db-postgres` |
| ORM / DB Adapter | `@payloadcms/db-postgres` | Payload native adapter, schema otomatis dari Collections |
| Rich Text | `@payloadcms/richtext-lexical` | Editor rich text bawaan Payload v3 |
| File Storage | Payload Upload (local dev / S3 prod) | Built-in upload handling di Payload |
| CSS | Tailwind CSS v4 | Utility-first, design system konsisten |
| Language | TypeScript | Type safety seluruh codebase |
| Email | Nodemailer / Resend | Notifikasi contact form |
| Auth | Payload built-in auth | Session-based, terintegrasi dengan Users collection |
| Testing | Vitest + fast-check | Unit + property-based testing |

### Deployment Architecture

```mermaid
graph LR
    subgraph Server
        NextJS[Next.js + Payload CMS\nSingle Process]
        NextJS --> PG[(PostgreSQL)]
        NextJS --> FS[File Storage]
    end
    Browser -->|SSR HTML| NextJS
    Browser -->|/admin| NextJS
```

### Request Flow — Frontend (SSR)

1. Browser request → Next.js RSC (Server Component)
2. Server Component memanggil Payload Local API langsung (in-process, tanpa HTTP)
3. Next.js merender HTML lengkap termasuk SEO meta tags
4. HTML dikirim ke browser → React hydration
5. Navigasi selanjutnya: client-side dengan React Router

### Request Flow — Admin

1. Admin login → Payload `/admin` → session cookie
2. CRUD operations → Payload Admin UI → Payload Local API → PostgreSQL
3. Image upload → Payload Upload handler → Storage → URL disimpan di DB

---

## Components and Interfaces

### Project Structure

```
src/
├── payload.config.ts               # Payload CMS configuration
├── collections/
│   ├── Users.ts                    # Admin users (auth)
│   ├── Media.ts                    # Image uploads
│   ├── Projects.ts
│   ├── ProjectCategories.ts
│   ├── ExpertiseItems.ts
│   ├── TechStackItems.ts
│   ├── Testimonials.ts
│   ├── NavigationMenus.ts
│   ├── SocialLinks.ts
│   ├── WhyWorkWithMeItems.ts
│   └── WorkProcessSteps.ts
├── globals/
│   ├── SiteSettings.ts
│   ├── HeroSection.ts
│   ├── AboutSection.ts
│   ├── ContactInfo.ts
│   ├── FooterSettings.ts
│   ├── SeoSettings.ts
│   └── SectionSettings.ts
└── app/
    ├── (payload)/
    │   └── admin/[[...segments]]/  # Payload admin UI (auto-generated)
    ├── (frontend)/
    │   ├── page.tsx                # Homepage
    │   ├── projects/
    │   │   └── [slug]/page.tsx     # Project Detail
    │   ├── contact/page.tsx        # Contact Page
    │   └── not-found.tsx           # 404
    ├── api/
    │   └── contact/route.ts        # Contact form POST handler
    ├── sitemap.ts                  # Next.js sitemap generation
    └── robots.ts                   # Next.js robots.txt generation

components/
├── layout/
│   ├── AppHeader.tsx
│   ├── AppFooter.tsx
│   └── AppNav.tsx
├── sections/
│   ├── HeroSection.tsx
│   ├── AboutSection.tsx
│   ├── ExpertiseSection.tsx
│   ├── TechStackSection.tsx
│   ├── FeaturedProjectsSection.tsx
│   ├── WhyWorkWithMeSection.tsx
│   ├── WorkProcessSection.tsx
│   ├── TestimonialsSection.tsx
│   └── ContactCtaSection.tsx
├── project/
│   ├── ProjectCard.tsx
│   ├── ProjectGallery.tsx
│   └── ProjectNavigation.tsx
├── ui/
│   ├── BaseButton.tsx
│   ├── BaseImage.tsx
│   ├── SectionWrapper.tsx
│   └── LoadingSpinner.tsx
└── contact/
    └── ContactForm.tsx

### Payload CMS Configuration

Payload dikonfigurasi di `src/payload.config.ts`:

```typescript
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { nextPayload } from '@payloadcms/next'

export default buildConfig({
  admin: { user: 'users' },
  collections: [Users, Media, Projects, ProjectCategories, /* ... */],
  globals: [SiteSettings, HeroSection, AboutSection, /* ... */],
  db: postgresAdapter({ pool: { connectionString: process.env.DATABASE_URL } }),
  editor: lexicalEditor({}),
})
```

### API Interface Contract

Payload menyediakan dua cara akses data:

**1. Local API (digunakan di Server Components — tanpa HTTP overhead):**
```typescript
import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })
const projects = await payload.find({
  collection: 'projects',
  where: { _status: { equals: 'published' } },
  sort: 'order_sorting',
})
```

**2. REST API (tersedia otomatis di `/api/{collection}`):**
```
GET /api/projects?where[_status][equals]=published
GET /api/projects/{id}
GET /api/globals/site-settings
```

Error response format (REST):
```json
{
  "errors": [{ "message": "string" }]
}
```

---

## Data Models

### Payload Collections

#### `users` (Auth)
```typescript
{
  email: text (required, unique),
  password: text (hashed),
  // Payload built-in auth fields
}
```

#### `media` (Image Uploads)
```typescript
{
  alt: text (required),
  // Payload built-in: filename, mimeType, filesize, width, height, url
  // Validation: mimeType in [image/jpeg, image/png, image/webp], filesize <= 5MB
}
```

#### `projects`
```typescript
{
  title:             text (required),
  slug:              text (required, unique, indexed),
  thumbnail:         upload → media (required),
  gallery:           array of upload → media,
  short_description: textarea (required),
  full_description:  richText (lexical),
  category:          relationship → project_categories (required),
  tech_stack:        array of text,
  role:              text,
  responsibilities:  array of text,
  key_features:      array of text,
  result_impact:     textarea,
  project_year:      number,
  duration:          text,
  featured_status:   checkbox (default: false),
  order_sorting:     number (default: 0),
  _status:           'draft' | 'published' (Payload versions/draft),
  meta: {
    title:           text,
    description:     textarea,
    image:           upload → media,
    canonical_url:   text,
  }
}
```

#### `project_categories`
```typescript
{
  name: text (required),
  slug: text (required, unique),
  description: textarea,
}
```

#### `expertise_items`
```typescript
{
  title:         text (required),
  description:   textarea (required),
  icon:          text,
  order_sorting: number (default: 0),
  _status:       'draft' | 'published',
}
```

#### `tech_stack_items`
```typescript
{
  name:          text (required),
  logo:          upload → media (required),
  category:      select ['Frontend','Backend','Database','DevOps','Mobile','Other'] (required),
  order_sorting: number (default: 0),
  _status:       'draft' | 'published',
}
```

#### `testimonials`
```typescript
{
  name:          text (required),
  position:      text (required),
  company:       text (required),
  quote:         textarea (required),
  photo:         upload → media,
  order_sorting: number (default: 0),
  _status:       'draft' | 'published',
}
```

#### `navigation_menus`
```typescript
{
  label:         text (required),
  url:           text (required),
  target:        select ['_self', '_blank'] (default: '_self'),
  order_sorting: number (default: 0),
  is_active:     checkbox (default: true),
}
```

#### `social_links`
```typescript
{
  platform_name: text (required),
  url:           text (required),
  icon:          text,
  order_sorting: number (default: 0),
  _status:       'draft' | 'published',
}
```

#### `why_work_with_me_items`
```typescript
{
  title:         text (required),
  description:   textarea (required),
  icon:          text,
  order_sorting: number (default: 0),
}
```

#### `work_process_steps`
```typescript
{
  step_number:   number (required),
  title:         text (required),
  description:   textarea (required),
  icon:          text,
  order_sorting: number (default: 0),
}
```

### Payload Globals

#### `site_settings`
```typescript
{
  site_name: text (required),
  tagline:   text,
  favicon:   upload → media,
  og_image:  upload → media,
  ga_id:     text,
}
```

#### `hero_section`
```typescript
{
  headline:              text (required),
  subheadline:           textarea,
  cta_primary_text:      text,
  cta_primary_url:       text,
  cta_secondary_text:    text,
  cta_secondary_url:     text,
  profile_image:         upload → media,
  background_image:      upload → media,
}
```

#### `about_section`
```typescript
{
  heading:              text (required),
  bio_text:             richText (lexical),
  photo:                upload → media,
  years_of_experience:  number,
  projects_completed:   number,
  clients_served:       number,
}
```

#### `contact_info`
```typescript
{
  whatsapp:    text,
  email:       email (required),
  linkedin_url: text,
  github_url:  text,
  cta_text:    text,
  cta_subtitle: text,
}
```

#### `footer_settings`
```typescript
{
  copyright_text:    text,
  footer_tagline:    text,
  show_social_links: checkbox (default: true),
}
```

#### `seo_settings`
```typescript
{
  default_meta_title:       text,
  default_meta_description: textarea,
  default_og_image:         upload → media,
  gsc_verification_code:    text,
}
```

#### `section_settings`
```typescript
{
  sections: array of {
    section_key:   select ['hero','about','expertise','tech_stack','featured_projects',
                           'why_work_with_me','work_process','testimonials','contact_cta'],
    label:         text,
    is_visible:    checkbox (default: true),
    order_sorting: number (default: 0),
  }
}
```

### Entity Relationships

```mermaid
erDiagram
    projects }o--|| project_categories : "belongs to"
    projects }o--o{ media : "thumbnail / gallery"
    projects {
        string slug UK
        string _status
        boolean featured_status
        number order_sorting
    }
    project_categories {
        string slug UK
    }
    tech_stack_items }o--|| media : "logo"
    testimonials }o--o| media : "photo"
```

---

## API Endpoints

### Payload REST API (otomatis dari Collections)

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/projects?where[_status][equals]=published` | Published projects list |
| GET | `/api/projects?where[slug][equals]={slug}` | Project by slug |
| GET | `/api/project-categories` | All categories |
| GET | `/api/expertise-items?where[_status][equals]=published&sort=order_sorting` | Published expertise |
| GET | `/api/tech-stack-items?where[_status][equals]=published&sort=order_sorting` | Published tech stack |
| GET | `/api/testimonials?where[_status][equals]=published&sort=order_sorting` | Published testimonials |
| GET | `/api/navigation-menus?sort=order_sorting` | Navigation items |
| GET | `/api/social-links?where[_status][equals]=published&sort=order_sorting` | Social links |
| GET | `/api/globals/site-settings` | Site settings |
| GET | `/api/globals/hero-section` | Hero section data |
| GET | `/api/globals/about-section` | About section data |
| GET | `/api/globals/contact-info` | Contact info |
| GET | `/api/globals/footer-settings` | Footer settings |
| GET | `/api/globals/seo-settings` | SEO settings |
| GET | `/api/globals/section-settings` | Section visibility + order |

### Custom Next.js API Routes

| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/api/contact` | Submit contact form, kirim email notifikasi |

### Response Example — Project Detail

```json
{
  "docs": [{
    "id": "abc123",
    "title": "Project Title",
    "slug": "project-title",
    "thumbnail": { "url": "https://...", "alt": "..." },
    "gallery": [{ "url": "https://...", "alt": "..." }],
    "short_description": "...",
    "full_description": { "root": { ... } },
    "category": { "id": "cat1", "name": "SaaS", "slug": "saas" },
    "tech_stack": ["Next.js", "PostgreSQL"],
    "role": "Full Stack Developer",
    "responsibilities": ["..."],
    "key_features": ["..."],
    "result_impact": "...",
    "project_year": 2024,
    "duration": "3 months",
    "_status": "published"
  }],
  "totalDocs": 1
}
```

---

## Admin Panel Architecture (Payload CMS)

### Auth Flow

```mermaid
sequenceDiagram
    Admin->>Payload: POST /api/users/login (email, password)
    Payload->>UsersCollection: authenticate(credentials)
    UsersCollection-->>Payload: success / fail
    Payload-->>Admin: session cookie + redirect /admin
    Admin->>Payload: GET /admin/collections/projects
    Payload->>Middleware: auth check (session)
    Middleware-->>Admin: 200 OK / redirect /admin/login
```

### Image Upload Flow

```mermaid
sequenceDiagram
    Admin->>PayloadAdmin: Upload image file
    Payload->>MediaCollection: validate(mimeType, filesize)
    MediaCollection-->>Payload: error / pass
    Payload->>Storage: store file
    Storage-->>Payload: file path + URL
    Payload->>DB: save Media document
    Payload-->>Admin: preview URL
```

### CRUD Flow — Project

```mermaid
sequenceDiagram
    Admin->>ProjectsCollection: Fill form (title, slug, thumbnail, ...)
    ProjectsCollection->>Validator: validate required fields + unique slug
    Validator-->>ProjectsCollection: errors / pass
    ProjectsCollection->>DB: create/update project document
    DB-->>Admin: success notification
```

---

## Frontend Architecture

### Page Structure & Data Fetching

```mermaid
graph TD
    Homepage[app/page.tsx] -->|Local API| SectionSettings
    Homepage -->|Local API| HeroData
    Homepage -->|Local API| AboutData
    Homepage -->|Local API| ExpertiseData
    Homepage -->|Local API| FeaturedProjects

    ProjectDetail[app/projects/slug/page.tsx] -->|Local API| ProjectData
    ProjectDetail --> ProjectGallery
    ProjectDetail --> ProjectNavigation

    ContactPage[app/contact/page.tsx] -->|Local API| ContactData
    ContactPage --> ContactForm
```

### SSR Data Fetching Strategy

Homepage menggunakan **Payload Local API** langsung di Server Components — tanpa HTTP round-trip, data di-fetch in-process:

```typescript
// app/(frontend)/page.tsx
import { getPayload } from 'payload'
import config from '@payload-config'

export default async function HomePage() {
  const payload = await getPayload({ config })

  const [sectionSettings, hero, about, expertise, featuredProjects] = await Promise.all([
    payload.findGlobal({ slug: 'section-settings' }),
    payload.findGlobal({ slug: 'hero-section' }),
    payload.findGlobal({ slug: 'about-section' }),
    payload.find({ collection: 'expertise-items',
      where: { _status: { equals: 'published' } }, sort: 'order_sorting' }),
    payload.find({ collection: 'projects',
      where: { _status: { equals: 'published' }, featured_status: { equals: true } },
      sort: 'order_sorting' }),
  ])

  const visibleSections = sectionSettings.sections
    .filter(s => s.is_visible)
    .sort((a, b) => a.order_sorting - b.order_sorting)

  return <main>{/* render sections */}</main>
}
```

### SEO Implementation

```typescript
// app/(frontend)/projects/[slug]/page.tsx
import type { Metadata } from 'next'

export async function generateMetadata({ params }): Promise<Metadata> {
  const payload = await getPayload({ config })
  const project = await payload.find({
    collection: 'projects',
    where: { slug: { equals: params.slug }, _status: { equals: 'published' } },
  })
  const seoSettings = await payload.findGlobal({ slug: 'seo-settings' })
  const doc = project.docs[0]

  return {
    title: doc?.meta?.title ?? seoSettings.default_meta_title,
    description: doc?.meta?.description ?? seoSettings.default_meta_description,
    openGraph: { images: [doc?.meta?.image?.url ?? seoSettings.default_og_image?.url] },
    alternates: { canonical: doc?.meta?.canonical_url },
  }
}
```

### Contact Form Flow

```mermaid
sequenceDiagram
    Visitor->>ContactForm: Fill fields (name, email, subject, message)
    ContactForm->>ClientValidator: validate (non-empty, email format)
    ClientValidator-->>ContactForm: errors per field (no API call)
    ContactForm->>NextAPI: POST /api/contact
    NextAPI->>Nodemailer: sendMail(adminEmail, formData)
    NextAPI-->>ContactForm: 200 success / 422 errors
    ContactForm-->>Visitor: success message / field errors
```

---
## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Image Upload Validation

*For any* file uploaded through the Payload Media collection, the system should accept the file if and only if its MIME type is one of `image/jpeg`, `image/png`, or `image/webp` AND its size is at most 5MB; any file outside these constraints should be rejected with an error message listing the accepted formats.

**Validates: Requirements 4.2, 4.3, 9.5**

---

### Property 2: Publish Status Filtering

*For any* Payload collection query that returns a list of content items (projects, expertise items, tech stack items, testimonials), every item in the response must have `_status = "published"`; no draft items should ever appear in public list responses.

**Validates: Requirements 6.3, 9.8, 10.3, 17.3**

---

### Property 3: Order Sorting Ascending Invariant

*For any* collection of items that have an `order_sorting` field (navigation menus, expertise items, tech stack items, testimonials, sections, why-work-with-me items, work process steps), the items returned by the API or rendered by the frontend must be ordered by `order_sorting` in ascending order.

**Validates: Requirements 3.3, 13.3, 14.3**

---

### Property 4: Project Round-Trip Data Integrity

*For any* valid Project object saved to the database via Payload, fetching that project via Local API with the same slug must return a document whose fields are equivalent to the saved object — no data loss, no field mutation, no type coercion that changes meaning.

**Validates: Requirements 23.1, 23.2, 17.4**

---

### Property 5: Testimonial Round-Trip Data Integrity

*For any* valid Testimonial object saved to the database via Payload, fetching the testimonials list via Local API must include a testimonial whose fields are equivalent to the saved object.

**Validates: Requirements 23.3**

---

### Property 6: Slug Uniqueness Across Projects

*For any* two distinct projects in the database, their `slug` values must differ; attempting to create or update a project with a slug that already exists must be rejected with a validation error identifying the conflicting slug.

**Validates: Requirements 9.3, 9.4**

---

### Property 7: Required Field Validation

*For any* content creation request (Expertise Item, Tech Stack Item, Project Category, Project, Testimonial) that omits one or more required fields, Payload must reject the request and return a validation error identifying each missing field; no partial record should be persisted.

**Validates: Requirements 6.2, 7.2, 8.2, 9.2, 10.2**

---

### Property 8: Project Detail 404 for Draft or Missing Slug

*For any* slug that either does not exist in the database or belongs to a project with `_status = "draft"`, a query to Payload Local API for that project must return an empty `docs` array; no project data should be leaked for draft or non-existent projects.

**Validates: Requirements 9.10, 17.5**

---

### Property 9: Section Visibility Filtering

*For any* homepage render, only sections whose `is_visible = true` in `section_settings` should appear; any section with `is_visible = false` must be absent from the rendered output regardless of its content.

**Validates: Requirements 13.2, 18.1**

---

### Property 10: SEO Meta Rendering with Global Fallback

*For any* page (homepage, contact, project detail), the rendered `<head>` must contain `<title>`, `<meta name="description">`, `<meta property="og:*">`, and `<link rel="canonical">` tags; if the page-specific SEO meta fields are empty, the values must fall back to the global SEO settings rather than rendering empty tags.

**Validates: Requirements 15.3, 15.4, 19.3**

---

### Property 11: JSON-LD Schema Markup Type Correctness

*For any* homepage render, the JSON-LD script tag must contain a schema of type `Person`; *for any* project detail page render, the JSON-LD script tag must contain a schema of type `CreativeWork`.

**Validates: Requirements 15.5**

---

### Property 12: Sitemap Completeness for Published Projects

*For any* set of projects with `_status = "published"` in the database, every project's canonical URL (`/projects/{slug}`) must appear in the generated `sitemap.xml`; no draft project URL should appear in the sitemap.

**Validates: Requirements 15.6**

---

### Property 13: Contact Form Client-Side Validation

*For any* contact form submission where one or more fields are invalid (empty name, invalid email format, empty message), the frontend must display a validation error message for each invalid field and must not make an API call to `POST /api/contact`.

**Validates: Requirements 20.3**

---

### Property 14: Contact Form API Returns 422 with Field Errors

*For any* `POST /api/contact` request with one or more invalid fields, the API must return HTTP 422 and a JSON body containing an `errors` array with messages for each invalid field.

**Validates: Requirements 17.8**

---

### Property 15: Admin Route Protection

*For any* admin panel route (`/admin/*`), an HTTP request made without a valid authenticated session must receive a redirect to the login page (or HTTP 401/403); no admin content or action should be accessible without authentication.

**Validates: Requirements 1.4**

---

### Property 16: Login/Logout Session Round-Trip

*For any* admin user, successfully logging in creates an active session that grants access to admin routes; logging out destroys that session such that subsequent requests to admin routes are rejected as unauthenticated.

**Validates: Requirements 1.1, 1.5**

---

### Property 17: Gallery Image Deletion Removes Reference

*For any* project with one or more gallery images, deleting a specific image from the gallery must result in that image's reference being absent from the project's `gallery` array when the project is subsequently fetched via the API.

**Validates: Requirements 16.5**

---

### Property 18: API Response JSON Format

*For any* request to any Payload REST API endpoint (`/api/*`), the response must have `Content-Type: application/json` and the body must be valid, parseable JSON.

**Validates: Requirements 17.2**

---

## Error Handling

### Validation Errors (422)

Payload validation errors menggunakan format:

```json
{
  "errors": [
    { "message": "Field 'title' is required", "field": "title" },
    { "message": "Slug must be unique", "field": "slug" }
  ]
}
```

Payload Admin UI menampilkan validation errors inline pada form fields.

### Not Found (404)

- Project dengan slug tidak ada atau draft → empty `docs` array dari Payload Local API
- Next.js menangkap empty result dan merender `not-found.tsx` dengan status code 404
- Semua URL yang tidak cocok dengan route Next.js → `not-found.tsx` catch-all → 404

### Image Upload Errors

- File type tidak didukung → error message: "Format gambar tidak didukung. Gunakan JPEG, PNG, atau WebP."
- File size > 5MB → error message: "Ukuran file melebihi batas maksimal 5MB."
- Storage failure → log error server-side, tampilkan generic error ke admin

### Contact Form Errors

- Client-side: validasi sebelum submit, error per field
- Server-side 422: tampilkan error dari API response per field
- Server-side 500: tampilkan generic error "Terjadi kesalahan. Silakan coba lagi."
- Email notification failure: log error, jangan gagalkan response ke visitor (fire-and-forget)

### Authentication Errors

- Invalid credentials → Payload menampilkan "Email atau password salah."
- Session expired → redirect ke `/admin/login` dengan flash message
- Unauthorized route access → redirect ke `/admin/login`

### API Unavailable (Frontend)

- Payload Local API error → render halaman dengan empty state yang graceful
- Critical data missing (site settings) → fallback ke default values yang di-hardcode sebagai last resort

---

## Testing Strategy

### Dual Testing Approach

Sistem ini menggunakan dua lapisan testing yang saling melengkapi:

1. **Unit/Integration Tests** — menguji contoh spesifik, edge cases, dan error conditions
2. **Property-Based Tests** — menguji properti universal di atas banyak input yang di-generate secara acak

### Backend Testing (Payload + Vitest)

**Property-Based Testing Library**: [fast-check](https://github.com/dubzzz/fast-check)

Untuk property-based testing di Payload/Next.js, gunakan **Vitest** dengan **fast-check**:

```typescript
// tests/properties/publish-status-filtering.test.ts
import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { getPayload } from 'payload'
import config from '@payload-config'

describe('Property 2: Publish Status Filtering', () => {
  it('only returns published projects in list', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.record({ /* project fields */ }), { minLength: 1, maxLength: 20 }),
        async (projectsData) => {
          const payload = await getPayload({ config })
          
          // Create mix of published and draft projects
          const published = projectsData.slice(0, Math.floor(projectsData.length / 2))
          const drafts = projectsData.slice(Math.floor(projectsData.length / 2))
          
          await Promise.all([
            ...published.map(p => payload.create({ collection: 'projects', data: { ...p, _status: 'published' } })),
            ...drafts.map(p => payload.create({ collection: 'projects', data: { ...p, _status: 'draft' } })),
          ])
          
          const result = await payload.find({
            collection: 'projects',
            where: { _status: { equals: 'published' } },
          })
          
          // Property: every item in response is published
          result.docs.forEach(doc => {
            expect(doc._status).toBe('published')
          })
          
          // Property: no draft appears
          const returnedSlugs = result.docs.map(d => d.slug)
          drafts.forEach(draft => {
            expect(returnedSlugs).not.toContain(draft.slug)
          })
        }
      ),
      { numRuns: 100 }
    )
  })
  // Tag: Feature: portfolio-hidayat-cms, Property 2: Publish status filtering
})
```

**Unit Tests** (fokus pada):
- Specific examples untuk setiap Collection CRUD
- Edge cases: empty gallery, null SEO fields, single navigation item
- Integration: email notification pada contact form submission
- Sitemap generation dengan berbagai kombinasi published/draft projects

**Integration Tests** (fokus pada):
- Payload Local API responses (data structure, filtering)
- Authentication flow (login, logout, protected routes)
- Image upload validation (file type, file size)
- Contact form submission (valid, invalid, 422 response)

### Frontend Testing (Next.js + Vitest + React Testing Library)

**Property-Based Testing Library**: [fast-check](https://github.com/dubzzz/fast-check)

```typescript
// tests/components/AppNav.test.tsx
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import fc from 'fast-check'
import AppNav from '@/components/layout/AppNav'

describe('Property 3: Order Sorting Ascending', () => {
  it('navigation items always rendered in ascending order_sorting', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.string(),
            label: fc.string(),
            url: fc.string(),
            order_sorting: fc.integer(),
          }),
          { minLength: 1, maxLength: 20 }
        ),
        (items) => {
          const { container } = render(<AppNav items={items} />)
          const renderedLabels = Array.from(container.querySelectorAll('a')).map(a => a.textContent)
          const sortedLabels = [...items]
            .sort((a, b) => a.order_sorting - b.order_sorting)
            .map(i => i.label)
          expect(renderedLabels).toEqual(sortedLabels)
        }
      ),
      { numRuns: 100 }
    )
  })
  // Tag: Feature: portfolio-hidayat-cms, Property 3: Order sorting ascending invariant
})
```

**Unit Tests** (fokus pada):
- ContactForm validation logic (per field)
- SEO metadata generation dengan berbagai kombinasi meta + fallback
- ProjectCard rendering dengan berbagai data shapes
- 404 page rendering

**Integration Tests** (fokus pada):
- Homepage data fetching dan section rendering
- Project detail page dengan prev/next navigation
- Contact form submission flow (success + error states)

### Property Test Configuration

- Minimum **100 iterations** per property test (`numRuns: 100`)
- Setiap property test harus memiliki comment tag:
  `// Tag: Feature: portfolio-hidayat-cms, Property {N}: {property_text}`
- Setiap correctness property di design document diimplementasikan oleh **tepat satu** property-based test

### Test Coverage Targets

| Layer | Target |
|---|---|
| Payload Collections (validation, hooks) | 90% |
| Next.js API Routes | 90% |
| Frontend Components (logic) | 80% |
| Frontend Utilities | 85% |

### Running Tests

```bash
# All tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

---

## Performance Considerations

### Server-Side Rendering

- Next.js RSC (React Server Components) untuk data fetching tanpa client-side overhead
- Payload Local API di-call in-process (tanpa HTTP round-trip) → latency minimal
- Streaming SSR untuk progressive rendering

### Image Optimization

- Next.js `<Image>` component untuk automatic optimization (WebP, lazy loading, responsive sizes)
- Payload Media collection menyimpan width/height untuk aspect ratio preservation

### Caching Strategy

- Next.js App Router caching: `fetch` requests di-cache otomatis di server
- Revalidation: `revalidatePath('/projects')` setelah project update di Payload hooks
- Static generation untuk halaman yang jarang berubah (homepage sections)

### Database Optimization

- Indexes pada `slug` fields untuk fast lookup
- Payload query optimization: select only needed fields dengan `select` parameter
- Connection pooling di PostgreSQL adapter

---

## Deployment

### Environment Variables

```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
PAYLOAD_SECRET=random-secret-key
NEXT_PUBLIC_SERVER_URL=https://portfolio.hidayat.dev
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=re_xxx
ADMIN_EMAIL=admin@hidayat.dev
```

### Build & Deploy

```bash
# Build
npm run build

# Start production server
npm run start
```

### Hosting Recommendations

- **Vercel** — optimal untuk Next.js, automatic deployments, edge functions
- **Railway** / **Render** — PostgreSQL + Node.js hosting
- **Supabase** — managed PostgreSQL dengan connection pooling

### File Storage

- Development: local filesystem (`/media`)
- Production: S3-compatible storage (AWS S3, Cloudflare R2, DigitalOcean Spaces)
- Payload Upload plugin dikonfigurasi dengan adapter sesuai environment

---

## Migration from Laravel Stack

### Data Migration

1. Export data dari Laravel database (PostgreSQL dump atau JSON export)
2. Transform data ke format Payload Collections:
   - Map Laravel model fields → Payload collection fields
   - Convert Laravel `publish_status` enum → Payload `_status`
   - Convert Laravel relationship IDs → Payload relationship format
3. Import data via Payload Local API atau seed script

### URL Structure Compatibility

- Laravel: `/projects/{slug}` → Next.js: `/projects/{slug}` ✅ (sama)
- Laravel: `/api/v1/projects` → Payload: `/api/projects` (update frontend jika perlu)

### Admin Panel Migration

- Filament Resources → Payload Collections (manual rewrite, struktur mirip)
- Filament form fields → Payload field types (mapping straightforward)
- Filament auth → Payload Users collection (built-in)

### Testing Migration

- PestPHP tests → Vitest tests (syntax mirip, porting mudah)
- Laravel Factories → Payload seed data generators
- Property tests tetap sama (logic tidak berubah, hanya API calls yang berbeda)
