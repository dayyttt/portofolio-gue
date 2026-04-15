# Implementation Plan: Portfolio Hidayat CMS

## Overview

Implementasi sistem portfolio personal + CMS untuk Hidayat Syahidin Ambo menggunakan **Payload CMS v3** (terintegrasi dalam Next.js App Router) sebagai backend + admin panel, dan **Next.js 15 (App Router, SSR)** sebagai frontend portfolio publik. Database: PostgreSQL. Language: TypeScript. Testing: Vitest + fast-check.

## Tasks

- [x] 1. Setup Project Structure
  - [x] 1.1 Inisialisasi Next.js + Payload CMS v3 project
    - Buat project dengan `npx create-payload-app@latest` — pilih template `website` atau `blank`
    - Pilih Next.js App Router, PostgreSQL adapter, TypeScript
    - Konfigurasi `.env`: `DATABASE_URL`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL`
    - Install dependencies: `@payloadcms/db-postgres`, `@payloadcms/richtext-lexical`, `@payloadcms/next`
    - _Requirements: 1.1, 16.3_

  - [x] 1.2 Konfigurasi Tailwind CSS dan TypeScript
    - Install Tailwind CSS v4, konfigurasi `tailwind.config.ts` dengan custom colors (dark navy, charcoal, soft blue, neutral gray)
    - Konfigurasi `tsconfig.json` dengan path aliases (`@/` → `src/`)
    - Buat `src/app/globals.css` dengan base styles dan CSS custom properties untuk color tokens
    - _Requirements: 22.1, 22.4_

  - [x] 1.3 Setup Vitest + fast-check + React Testing Library
    - Install: `vitest`, `@vitest/coverage-v8`, `fast-check`, `@testing-library/react`, `@testing-library/user-event`
    - Konfigurasi `vitest.config.ts` dengan jsdom environment dan path aliases
    - Buat `tests/` directory structure: `tests/unit/`, `tests/integration/`, `tests/properties/`
    - _Requirements: (testing infrastructure)_

- [x] 2. Payload Collections — Media & Users
  - [x] 2.1 Buat `Users` collection (auth)
    - `src/collections/Users.ts`: auth: true, fields: email, role
    - Konfigurasi sebagai admin user collection di `payload.config.ts`
    - _Requirements: 1.1, 1.2, 1.4, 1.5_

  - [x] 2.2 Buat `Media` collection (image uploads)
    - `src/collections/Media.ts`: upload: true, fields: alt (required)
    - Konfigurasi validasi: mimeTypes `['image/jpeg','image/png','image/webp']`, maxFileSize: 5MB (5242880 bytes)
    - _Requirements: 4.2, 4.3, 9.5, 16.1, 16.2, 16.3_

  - [x] 2.3 Tulis property test untuk Property 1: Image Upload Validation
    - **Property 1: Image Upload Validation**
    - Generate files dengan berbagai MIME type dan ukuran, assert accept iff valid type + size ≤ 5MB
    - Minimum 100 runs dengan fast-check
    - **Validates: Requirements 4.2, 4.3, 9.5**

- [x] 3. Payload Collections — Content Items
  - [x] 3.1 Buat `NavigationMenus` collection
    - Fields: label (required), url (required), target (select: `_self`/`_blank`, default `_self`), order_sorting (number, default 0), is_active (checkbox, default true)
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 3.2 Buat `ExpertiseItems` collection
    - Fields: title (required), description (required), icon, order_sorting (default 0), _status (draft/published)
    - Enable Payload versions/drafts untuk publish_status
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 3.3 Buat `TechStackItems` collection
    - Fields: name (required), logo (upload → Media, required), category (select enum, required), order_sorting (default 0), _status
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 3.4 Buat `WhyWorkWithMeItems` dan `WorkProcessSteps` collections
    - WhyWorkWithMeItems: title (required), description (required), icon, order_sorting
    - WorkProcessSteps: step_number (required), title (required), description (required), icon, order_sorting
    - _Requirements: 14.1, 14.2, 14.3_

  - [x] 3.5 Buat `Testimonials` collection
    - Fields: name (required), position (required), company (required), quote (required), photo (upload → Media), order_sorting (default 0), _status
    - _Requirements: 10.1, 10.2, 10.3_

  - [x] 3.6 Buat `SocialLinks` collection
    - Fields: platform_name (required), url (required), icon, order_sorting (default 0), _status
    - _Requirements: 11.3, 11.4_

- [x] 4. Payload Collections — Projects & Categories
  - [x] 4.1 Buat `ProjectCategories` collection
    - Fields: name (required), slug (required, unique), description
    - Hook: auto-generate slug dari name jika kosong
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 4.2 Buat `Projects` collection (paling kompleks)
    - Fields: title (required), slug (required, unique, indexed), thumbnail (upload → Media, required), gallery (array of upload → Media), short_description (required), full_description (richText lexical), category (relationship → ProjectCategories, required), tech_stack (array of text), role, responsibilities (array of text), key_features (array of text), result_impact, project_year (number), duration, featured_status (checkbox, default false), order_sorting (default 0), _status
    - Tab SEO: meta.title, meta.description, meta.image (upload → Media), meta.canonical_url
    - Enable versions/drafts untuk _status
    - Indexes: slug, _status, featured_status
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 9.10_

  - [x] 4.3 Tulis property test untuk Property 6: Slug Uniqueness Across Projects
    - **Property 6: Slug Uniqueness Across Projects**
    - Generate projects dengan slug duplikat, assert Payload menolak dengan validation error menyebutkan slug konflik
    - **Validates: Requirements 9.3, 9.4**

  - [x] 4.4 Tulis property test untuk Property 7: Required Field Validation
    - **Property 7: Required Field Validation**
    - Generate requests dengan berbagai kombinasi missing required fields untuk Projects, ExpertiseItems, TechStackItems, ProjectCategories, Testimonials
    - Assert Payload menolak dan mengembalikan error per field; tidak ada partial record tersimpan
    - **Validates: Requirements 6.2, 7.2, 8.2, 9.2, 10.2**

- [x] 5. Payload Globals
  - [x] 5.1 Buat `SiteSettings` global
    - Fields: site_name (required), tagline, favicon (upload → Media), og_image (upload → Media), ga_id
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 5.2 Buat `HeroSection` global
    - Fields: headline (required), subheadline, cta_primary_text, cta_primary_url, cta_secondary_text, cta_secondary_url, profile_image (upload → Media), background_image (upload → Media)
    - _Requirements: 4.1, 4.2, 4.4_

  - [x] 5.3 Buat `AboutSection` global
    - Fields: heading (required), bio_text (richText lexical), photo (upload → Media), years_of_experience (number), projects_completed (number), clients_served (number)
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 5.4 Buat `ContactInfo` global
    - Fields: whatsapp, email (email type, required), linkedin_url, github_url, cta_text, cta_subtitle
    - _Requirements: 11.1, 11.2, 11.4_

  - [x] 5.5 Buat `FooterSettings` global
    - Fields: copyright_text, footer_tagline, show_social_links (checkbox, default true)
    - _Requirements: 12.1, 12.2_

  - [x] 5.6 Buat `SeoSettings` global
    - Fields: default_meta_title, default_meta_description, default_og_image (upload → Media), gsc_verification_code
    - _Requirements: 15.1_

  - [x] 5.7 Buat `SectionSettings` global
    - Fields: sections (array of: section_key (select), label, is_visible (checkbox, default true), order_sorting (number, default 0))
    - Seed default 9 sections: hero, about, expertise, tech_stack, featured_projects, why_work_with_me, work_process, testimonials, contact_cta
    - _Requirements: 13.1, 13.2, 13.3, 13.4_

- [x] 6. Payload Config & Database Setup
  - [x] 6.1 Konfigurasi `src/payload.config.ts`
    - Register semua collections dan globals
    - Konfigurasi `postgresAdapter`, `lexicalEditor`, admin user collection
    - Konfigurasi upload storage (local dev: `/public/media`, prod: S3 adapter)
    - _Requirements: 1.1, 16.3_

  - [x] 6.2 Checkpoint — Jalankan Payload dan verifikasi admin UI
    - Jalankan `npm run dev`, akses `/admin`, pastikan semua collections dan globals muncul tanpa error
    - Buat admin user pertama, test login/logout

- [x] 7. Custom API Route — Contact Form
  - [x] 7.1 Buat `src/app/api/contact/route.ts`
    - POST handler: validasi fields (name required, email format, subject required, message required)
    - Kirim email notifikasi ke admin via Nodemailer/Resend (fire-and-forget)
    - Return 200 success atau 422 dengan errors array per field
    - _Requirements: 17.6, 17.7, 17.8, 20.2_

  - [ ]* 7.2 Tulis property test untuk Property 14: Contact Form API Returns 422
    - **Property 14: Contact Form API Returns 422 with Field Errors**
    - Generate berbagai kombinasi invalid fields (empty name, invalid email, empty message)
    - Assert HTTP 422 + JSON body dengan errors array yang menyebutkan setiap field invalid
    - **Validates: Requirements 17.8**

- [ ] 8. Property Tests — Publish Status & Round-Trip
  - [ ]* 8.1 Tulis property test untuk Property 2: Publish Status Filtering
    - **Property 2: Publish Status Filtering**
    - Generate random mix published + draft items (projects, expertise, testimonials)
    - Query Payload Local API dengan filter `_status: published`, assert semua hasil published, tidak ada draft
    - Minimum 100 runs
    - **Validates: Requirements 6.3, 9.8, 10.3, 17.3**

  - [ ]* 8.2 Tulis property test untuk Property 4: Project Round-Trip Data Integrity
    - **Property 4: Project Round-Trip Data Integrity**
    - Generate valid Project objects, simpan via Payload Local API, fetch kembali by slug
    - Assert semua fields ekuivalen (title, slug, short_description, tech_stack array, dll.)
    - Minimum 100 runs
    - **Validates: Requirements 23.1, 23.2, 17.4**

  - [ ]* 8.3 Tulis property test untuk Property 5: Testimonial Round-Trip Data Integrity
    - **Property 5: Testimonial Round-Trip Data Integrity**
    - Generate valid Testimonial objects, simpan via Payload Local API, fetch list
    - Assert testimonial yang disimpan ada di list dengan fields ekuivalen
    - **Validates: Requirements 23.3**

  - [ ]* 8.4 Tulis property test untuk Property 8: Project Detail 404 for Draft or Missing Slug
    - **Property 8: Project Detail 404 for Draft or Missing Slug**
    - Generate random non-existent slugs dan draft projects
    - Assert Payload Local API query mengembalikan empty docs array
    - **Validates: Requirements 9.10, 17.5**

  - [ ]* 8.5 Tulis property test untuk Property 18: API Response JSON Format
    - **Property 18: API Response JSON Format**
    - Request ke semua Payload REST API endpoints (`/api/projects`, `/api/globals/site-settings`, dll.)
    - Assert Content-Type: application/json dan body parseable JSON
    - **Validates: Requirements 17.2**

- [-] 9. Checkpoint — Semua backend/API tests pass
  - Jalankan `npm run test`, pastikan semua tests pass.

- [x] 10. Frontend Layout Components
  - [x] 10.1 Buat `AppHeader.tsx` dan `AppNav.tsx`
    - Server Component: fetch navigation dari Payload Local API, render `<nav>` dengan `<a>` tags
    - Mobile hamburger menu (Client Component untuk interaktivitas)
    - Gunakan semantic HTML5 `<header>` dan `<nav>`
    - _Requirements: 3.3, 22.3_

  - [x] 10.2 Buat `AppFooter.tsx`
    - Server Component: fetch footer settings + social links dari Payload Local API
    - Render copyright text dan social icons
    - Gunakan semantic HTML5 `<footer>`
    - _Requirements: 11.4, 12.2, 22.3_

- [x] 11. Frontend UI Base Components
  - [x] 11.1 Buat base UI components
    - `BaseButton.tsx`: variants (primary, secondary), CSS transition 150–300ms
    - `BaseImage.tsx`: wrapper `next/image` dengan lazy loading, alt text required
    - `SectionWrapper.tsx`: consistent padding/margin wrapper
    - `LoadingSpinner.tsx`: accessible loading indicator dengan aria-label
    - _Requirements: 22.2, 22.3_

- [ ] 12. Frontend Homepage Sections
  - [x] 12.1 Buat `HeroSection.tsx`
    - Render headline, subheadline, CTA buttons, profile image dari props
    - Micro-interaction pada CTA buttons (hover transition 150–300ms)
    - _Requirements: 4.4, 22.2_

  - [-] 12.2 Buat `AboutSection.tsx`
    - Render heading, bio (dari Lexical rich text → HTML), photo, stats (years, projects, clients)
    - _Requirements: 5.3_

  - [ ] 12.3 Buat `ExpertiseSection.tsx` dan `TechStackSection.tsx`
    - ExpertiseSection: render expertise items sebagai cards
    - TechStackSection: render tech stack items dikelompokkan berdasarkan category
    - _Requirements: 6.3, 7.3_

  - [ ] 12.4 Buat `FeaturedProjectsSection.tsx` dan `ProjectCard.tsx`
    - FeaturedProjectsSection: render featured published projects
    - ProjectCard: thumbnail (next/image), title, short_description, category, link ke detail
    - Micro-interaction pada card hover
    - _Requirements: 9.8, 22.2_

  - [ ] 12.5 Buat `WhyWorkWithMeSection.tsx` dan `WorkProcessSection.tsx`
    - Render items dari Payload Local API, sorted by order_sorting
    - _Requirements: 14.3_

  - [ ] 12.6 Buat `TestimonialsSection.tsx`
    - Render published testimonials, sorted by order_sorting
    - _Requirements: 10.3_

  - [ ] 12.7 Buat `ContactCtaSection.tsx`
    - Render contact info dan social links sebagai CTA section
    - _Requirements: 11.4_

- [ ] 13. Frontend Pages
  - [ ] 13.1 Buat `app/(frontend)/page.tsx` (Homepage)
    - Server Component: fetch semua section data via Payload Local API dengan `Promise.all`
    - Filter sections berdasarkan `is_visible`, sort by `order_sorting`, render section components dinamis
    - Gunakan semantic HTML5 `<main>` dan `<section>`
    - _Requirements: 13.2, 13.3, 18.1, 18.2, 22.3_

  - [ ] 13.2 Buat `app/(frontend)/projects/[slug]/page.tsx` (Project Detail)
    - Server Component: query Payload Local API by slug + `_status: published`
    - Jika empty docs → `notFound()` (Next.js 404)
    - Render: title, thumbnail, gallery, full_description (Lexical → HTML), tech_stack, role, responsibilities, key_features, result_impact, project_year, duration
    - `generateStaticParams` untuk static generation semua published projects
    - _Requirements: 9.9, 9.10, 19.1, 19.2_

  - [ ] 13.3 Buat `ProjectGallery.tsx` dan `ProjectNavigation.tsx`
    - ProjectGallery: render gallery images dengan next/image, lightbox optional
    - ProjectNavigation: query prev/next project by order_sorting, render navigation links
    - _Requirements: 19.4_

  - [ ] 13.4 Buat `app/(frontend)/contact/page.tsx` (Contact Page)
    - Server Component: fetch contact info + social links dari Payload Local API
    - Render Contact Info, Social Links, dan `ContactForm` (Client Component)
    - _Requirements: 20.1_

  - [ ] 13.5 Buat `app/(frontend)/not-found.tsx` (404)
    - Render halaman 404 dengan HTTP status 404, pesan informatif, link ke Homepage
    - _Requirements: 21.1, 21.2_

- [ ] 14. Contact Form Client Component
  - [ ] 14.1 Buat `ContactForm.tsx` (Client Component)
    - Form state: name, email, subject, message
    - Client-side validation per field sebelum submit (non-empty, email format)
    - Submit ke `POST /api/contact`, handle loading state (disable button), success message, 422 field errors
    - _Requirements: 20.1, 20.2, 20.3, 20.4_

  - [ ]* 14.2 Tulis property test untuk Property 13: Contact Form Client-Side Validation
    - **Property 13: Contact Form Client-Side Validation**
    - Gunakan fast-check generate berbagai kombinasi invalid inputs (empty name, invalid email, empty message)
    - Assert error per field ditampilkan dan `fetch` tidak dipanggil
    - **Validates: Requirements 20.3**

- [ ] 15. SEO Implementation
  - [ ] 15.1 Implementasi `generateMetadata` di semua pages
    - Homepage: fetch SEO meta dari Payload, render title, description, og:*, canonical
    - Project Detail: render SEO meta spesifik project dengan fallback ke global SEO settings
    - Contact: render SEO meta contact page
    - _Requirements: 15.2, 15.3, 15.4, 19.3_

  - [ ] 15.2 Implementasi JSON-LD Schema Markup
    - Homepage: JSON-LD type `Person` dengan data dari site settings + about section
    - Project Detail: JSON-LD type `CreativeWork` dengan data project
    - Inject via `<script type="application/ld+json">` di page component
    - _Requirements: 15.5_

  - [ ] 15.3 Buat `app/sitemap.ts` dan `app/robots.ts`
    - `sitemap.ts`: fetch published projects dari Payload Local API, generate sitemap entries dengan canonical URLs
    - `robots.ts`: allow all public pages, disallow `/admin`
    - _Requirements: 15.6, 15.7_

- [ ] 16. Property Tests — Frontend
  - [ ]* 16.1 Tulis property test untuk Property 3: Order Sorting Ascending Invariant (frontend)
    - **Property 3: Order Sorting Ascending Invariant**
    - Gunakan fast-check generate items dengan random order_sorting, render `AppNav`, assert rendered order ascending
    - Minimum 100 runs
    - **Validates: Requirements 3.3, 13.3, 14.3**

  - [ ]* 16.2 Tulis property test untuk Property 9: Section Visibility Filtering
    - **Property 9: Section Visibility Filtering**
    - Generate sections dengan random `is_visible` values, render Homepage, assert hanya visible sections yang dirender
    - **Validates: Requirements 13.2, 18.1**

  - [ ]* 16.3 Tulis property test untuk Property 10: SEO Meta Rendering with Global Fallback
    - **Property 10: SEO Meta Rendering with Global Fallback**
    - Generate kombinasi page-specific meta (kosong/isi) + global fallback
    - Assert `generateMetadata` selalu mengembalikan title, description, og:image yang non-empty
    - **Validates: Requirements 15.3, 15.4, 19.3**

  - [ ]* 16.4 Tulis property test untuk Property 11: JSON-LD Schema Markup Type Correctness
    - **Property 11: JSON-LD Schema Markup Type Correctness**
    - Assert Homepage JSON-LD `@type` = `Person`, Project Detail JSON-LD `@type` = `CreativeWork`
    - **Validates: Requirements 15.5**

- [ ] 17. Property Tests — Auth & Admin
  - [ ]* 17.1 Tulis property test untuk Property 15: Admin Route Protection
    - **Property 15: Admin Route Protection**
    - Generate requests ke berbagai `/admin/*` routes tanpa session cookie
    - Assert redirect ke `/admin/login` atau HTTP 401/403
    - **Validates: Requirements 1.4**

  - [ ]* 17.2 Tulis property test untuk Property 16: Login/Logout Session Round-Trip
    - **Property 16: Login/Logout Session Round-Trip**
    - Login dengan valid credentials → assert akses `/admin` granted
    - Logout → assert akses `/admin` denied (redirect ke login)
    - **Validates: Requirements 1.1, 1.5**

  - [ ]* 17.3 Tulis property test untuk Property 12: Sitemap Completeness
    - **Property 12: Sitemap Completeness for Published Projects**
    - Generate random set published + draft projects, generate sitemap
    - Assert semua published project slugs ada di sitemap, draft tidak ada
    - **Validates: Requirements 15.6**

  - [ ]* 17.4 Tulis property test untuk Property 17: Gallery Image Deletion Removes Reference
    - **Property 17: Gallery Image Deletion Removes Reference**
    - Generate project dengan gallery images, hapus satu image dari array
    - Fetch project via Payload Local API, assert deleted image URL tidak ada di gallery
    - **Validates: Requirements 16.5**

- [ ] 18. Checkpoint — Semua tests pass
  - Jalankan `npm run test`, pastikan semua unit, integration, dan property tests pass.

- [ ] 19. Deployment Configuration
  - [ ] 19.1 Konfigurasi environment variables untuk production
    - Buat `.env.example` dengan semua required vars: `DATABASE_URL`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL`, `SMTP_*`, `ADMIN_EMAIL`
    - Konfigurasi S3 storage adapter untuk production (env: `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`)
    - _Requirements: 17.1_

  - [ ] 19.2 Konfigurasi Next.js untuk production build
    - Verifikasi `next.config.ts`: image domains, headers (CORS jika perlu)
    - Test production build: `npm run build && npm run start`
    - _Requirements: 18.3_

- [ ] 20. Final Checkpoint — Semua tests pass
  - Jalankan `npm run test` dan `npm run build`, pastikan semua tests pass dan build sukses.

## Notes

- Tasks bertanda `*` bersifat opsional dan dapat dilewati untuk MVP yang lebih cepat
- Setiap task mereferensikan requirements spesifik untuk traceability
- Property tests menggunakan **Vitest + fast-check** dengan minimum 100 iterasi (`numRuns: 100`)
- Payload Local API digunakan di Server Components (in-process, tanpa HTTP overhead)
- Payload REST API tersedia otomatis di `/api/{collection}` untuk kebutuhan client-side jika diperlukan
- Payload versions/drafts digunakan untuk `_status` (draft/published) pada collections yang relevan
- `generateStaticParams` di Project Detail page untuk static generation semua published projects
