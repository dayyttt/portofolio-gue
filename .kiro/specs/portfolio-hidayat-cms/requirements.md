# Requirements Document

## Introduction

Portfolio personal modern dan profesional untuk Hidayat Syahidin Ambo — seorang Full Stack Developer / Software Engineer yang berspesialisasi dalam Business Systems, SaaS, dan Custom Enterprise Solutions. Sistem ini terdiri dari empat komponen utama: Frontend Portfolio (website publik), Admin Panel / CMS (pengelolaan konten), Database Schema (struktur data), dan API Layer (komunikasi frontend ↔ backend). Seluruh konten bersifat data-driven dan dikelola melalui CMS tanpa hardcoded content.

---

## Glossary

- **Portfolio_Site**: Website publik yang menampilkan konten portfolio secara dinamis kepada pengunjung.
- **CMS**: Content Management System — Admin Panel untuk mengelola semua konten dari database.
- **API**: Application Programming Interface — layer endpoint yang menghubungkan Frontend dengan Backend.
- **Admin**: Pengguna terautentikasi yang memiliki akses penuh ke CMS.
- **Visitor**: Pengguna publik yang mengakses Portfolio_Site tanpa autentikasi.
- **Content_Model**: Struktur data yang merepresentasikan satu jenis konten (misalnya Project, Testimonial).
- **Slug**: URL-friendly identifier unik untuk setiap halaman atau entitas konten.
- **SEO_Meta**: Kumpulan metadata untuk optimasi mesin pencari: meta title, meta description, og:image, canonical URL.
- **Project**: Entitas konten yang merepresentasikan satu proyek dalam portfolio.
- **Testimonial**: Entitas konten yang merepresentasikan satu ulasan dari klien atau kolega.
- **Section**: Blok konten yang dapat ditampilkan atau disembunyikan di halaman Homepage.
- **Featured_Project**: Project yang ditandai untuk ditampilkan di Homepage pada Featured Projects Section.
- **Publish_Status**: Status konten: `draft` (tidak tampil publik) atau `published` (tampil publik).
- **Image_Upload**: Proses mengunggah file gambar ke server dan menyimpan referensi URL-nya.
- **Schema_Markup**: Structured data (JSON-LD) untuk meningkatkan pemahaman mesin pencari terhadap konten.

---

## Requirements

### Requirement 1: Autentikasi Admin

**User Story:** As an Admin, I want to log in securely to the CMS, so that I can manage portfolio content without unauthorized access.

#### Acceptance Criteria

1. WHEN Admin mengirimkan kredensial yang valid, THE CMS SHALL mengautentikasi Admin dan membuat sesi yang terenkripsi.
2. WHEN Admin mengirimkan kredensial yang tidak valid, THE CMS SHALL menolak akses dan menampilkan pesan error yang deskriptif.
3. WHEN sesi Admin telah kedaluwarsa, THE CMS SHALL mengarahkan Admin ke halaman login.
4. THE CMS SHALL melindungi semua route Admin Panel dari akses tanpa autentikasi.
5. WHEN Admin memilih logout, THE CMS SHALL menghapus sesi dan mengarahkan ke halaman login.

---

### Requirement 2: Manajemen Site Settings

**User Story:** As an Admin, I want to manage global site settings, so that I can control branding and general configuration of the portfolio.

#### Acceptance Criteria

1. THE CMS SHALL menyediakan form untuk mengedit Site Settings yang mencakup: site name, tagline, favicon, og:image default, dan Google Analytics ID.
2. WHEN Admin menyimpan Site Settings, THE CMS SHALL memvalidasi semua field yang wajib diisi sebelum menyimpan ke database.
3. WHEN Admin menyimpan Site Settings, THE API SHALL memperbarui data Site Settings di database.
4. THE Portfolio_Site SHALL merender site name dan tagline dari data Site Settings, bukan dari nilai hardcoded.

---

### Requirement 3: Manajemen Navigation Menu

**User Story:** As an Admin, I want to manage navigation menu items, so that I can control the links displayed in the site header and footer.

#### Acceptance Criteria

1. THE CMS SHALL menyediakan CRUD untuk Navigation Menu items yang mencakup: label, URL, target (`_self` / `_blank`), dan order_sorting.
2. WHEN Admin mengubah urutan Navigation Menu item, THE CMS SHALL menyimpan nilai order_sorting yang baru.
3. THE Portfolio_Site SHALL merender Navigation Menu berdasarkan data dari API, diurutkan berdasarkan order_sorting secara ascending.

---

### Requirement 4: Manajemen Hero Section

**User Story:** As an Admin, I want to manage the Hero Section content, so that I can update the headline, subheadline, CTA buttons, and profile image displayed on the homepage.

#### Acceptance Criteria

1. THE CMS SHALL menyediakan form untuk mengedit Hero Section yang mencakup: headline, subheadline, CTA primary text, CTA primary URL, CTA secondary text, CTA secondary URL, profile image, dan background image.
2. WHEN Admin mengunggah gambar pada Hero Section, THE CMS SHALL memvalidasi bahwa file bertipe JPEG, PNG, atau WebP dengan ukuran maksimal 5MB.
3. IF Admin mengunggah file gambar dengan format yang tidak didukung, THEN THE CMS SHALL menampilkan pesan error yang menyebutkan format yang diterima.
4. THE Portfolio_Site SHALL merender Hero Section menggunakan data dari API.

---

### Requirement 5: Manajemen About Section

**User Story:** As an Admin, I want to manage the About Section content, so that I can update the bio, photo, and highlights displayed on the homepage.

#### Acceptance Criteria

1. THE CMS SHALL menyediakan form untuk mengedit About Section yang mencakup: heading, bio text (rich text), photo, years of experience, projects completed count, dan clients served count.
2. WHEN Admin menyimpan About Section, THE API SHALL memperbarui data About Section di database.
3. THE Portfolio_Site SHALL merender About Section menggunakan data dari API.

---

### Requirement 6: Manajemen Core Expertise Items

**User Story:** As an Admin, I want to manage Core Expertise items, so that I can showcase the key service areas I offer to potential clients.

#### Acceptance Criteria

1. THE CMS SHALL menyediakan CRUD untuk Expertise Items yang mencakup: title, description, icon, order_sorting, dan publish_status.
2. WHEN Admin membuat Expertise Item baru, THE CMS SHALL memvalidasi bahwa field title dan description tidak kosong.
3. THE Portfolio_Site SHALL merender Core Expertise Section hanya dengan Expertise Items yang memiliki publish_status `published`, diurutkan berdasarkan order_sorting secara ascending.
4. WHEN Admin mengubah publish_status Expertise Item menjadi `draft`, THE Portfolio_Site SHALL tidak menampilkan item tersebut.

---

### Requirement 7: Manajemen Tech Stack Items

**User Story:** As an Admin, I want to manage Tech Stack items, so that I can display the technologies I work with on the homepage.

#### Acceptance Criteria

1. THE CMS SHALL menyediakan CRUD untuk Tech Stack Items yang mencakup: name, logo image, category (Frontend / Backend / Database / DevOps / Mobile / Other), order_sorting, dan publish_status.
2. WHEN Admin membuat Tech Stack Item baru, THE CMS SHALL memvalidasi bahwa field name tidak kosong dan logo image telah diunggah.
3. THE Portfolio_Site SHALL merender Tech Stack Section hanya dengan Tech Stack Items yang memiliki publish_status `published`, dikelompokkan berdasarkan category.

---

### Requirement 8: Manajemen Project Categories

**User Story:** As an Admin, I want to manage Project Categories, so that I can organize projects into meaningful groups for filtering.

#### Acceptance Criteria

1. THE CMS SHALL menyediakan CRUD untuk Project Categories yang mencakup: name, slug, dan description.
2. WHEN Admin membuat Project Category baru, THE CMS SHALL memvalidasi bahwa field name tidak kosong dan slug bersifat unik.
3. IF Admin mencoba membuat Project Category dengan slug yang sudah ada, THEN THE CMS SHALL menampilkan pesan error yang menyebutkan slug tersebut sudah digunakan.

---

### Requirement 9: Manajemen Projects

**User Story:** As an Admin, I want to manage Projects with complete metadata, so that I can showcase my work with detailed case studies to potential clients.

#### Acceptance Criteria

1. THE CMS SHALL menyediakan CRUD untuk Projects yang mencakup field: title, slug, thumbnail, gallery (multiple images), short_description, full_description (rich text), category, tech_stack (multiple select), role, responsibilities (list), key_features (list), result_impact, project_year, duration, featured_status (boolean), order_sorting, publish_status, dan SEO_Meta (meta title, meta description, og:image, canonical URL).
2. WHEN Admin membuat Project baru, THE CMS SHALL memvalidasi bahwa field title, slug, short_description, thumbnail, dan category tidak kosong.
3. WHEN Admin membuat Project baru, THE CMS SHALL memvalidasi bahwa slug bersifat unik di antara semua Projects.
4. IF Admin mencoba menyimpan Project dengan slug yang sudah ada, THEN THE CMS SHALL menampilkan pesan error yang menyebutkan slug tersebut sudah digunakan.
5. WHEN Admin mengunggah thumbnail atau gallery image, THE CMS SHALL memvalidasi bahwa setiap file bertipe JPEG, PNG, atau WebP dengan ukuran maksimal 5MB.
6. WHEN Admin mengubah publish_status Project menjadi `published`, THE Portfolio_Site SHALL menampilkan Project tersebut pada halaman yang sesuai.
7. WHEN Admin mengubah publish_status Project menjadi `draft`, THE Portfolio_Site SHALL tidak menampilkan Project tersebut.
8. THE Portfolio_Site SHALL merender Featured Projects Section hanya dengan Projects yang memiliki featured_status `true` dan publish_status `published`, diurutkan berdasarkan order_sorting secara ascending.
9. THE Portfolio_Site SHALL menyediakan halaman Project Detail untuk setiap Project yang memiliki publish_status `published`, dapat diakses melalui URL `/projects/{slug}`.
10. WHEN Visitor mengakses URL `/projects/{slug}` untuk Project yang tidak ada atau berstatus `draft`, THE Portfolio_Site SHALL menampilkan halaman 404.

---

### Requirement 10: Manajemen Testimonials

**User Story:** As an Admin, I want to manage Testimonials, so that I can display social proof from clients and colleagues on the homepage.

#### Acceptance Criteria

1. THE CMS SHALL menyediakan CRUD untuk Testimonials yang mencakup: name, position, company, quote, photo, order_sorting, dan publish_status.
2. WHEN Admin membuat Testimonial baru, THE CMS SHALL memvalidasi bahwa field name, position, company, dan quote tidak kosong.
3. THE Portfolio_Site SHALL merender Testimonial Section hanya dengan Testimonials yang memiliki publish_status `published`, diurutkan berdasarkan order_sorting secara ascending.

---

### Requirement 11: Manajemen Contact Info & Social Links

**User Story:** As an Admin, I want to manage contact information and social links, so that potential clients can reach me through the correct channels.

#### Acceptance Criteria

1. THE CMS SHALL menyediakan form untuk mengedit Contact Info yang mencakup: WhatsApp number, email, LinkedIn URL, GitHub URL, CTA text, dan CTA subtitle.
2. WHEN Admin menyimpan Contact Info, THE CMS SHALL memvalidasi bahwa field email menggunakan format yang valid.
3. THE CMS SHALL menyediakan CRUD untuk Social Links yang mencakup: platform name, URL, icon, order_sorting, dan publish_status.
4. THE Portfolio_Site SHALL merender Contact Section dan Footer menggunakan data Contact Info dan Social Links dari API.

---

### Requirement 12: Manajemen Footer Settings

**User Story:** As an Admin, I want to manage footer content, so that I can control the copyright text and footer links displayed at the bottom of every page.

#### Acceptance Criteria

1. THE CMS SHALL menyediakan form untuk mengedit Footer Settings yang mencakup: copyright text, footer tagline, dan show_social_links (boolean).
2. THE Portfolio_Site SHALL merender Footer menggunakan data Footer Settings dari API.

---

### Requirement 13: Manajemen Section Visibility & Order

**User Story:** As an Admin, I want to show, hide, and reorder homepage sections, so that I can control the layout and content priority of the homepage.

#### Acceptance Criteria

1. THE CMS SHALL menyediakan antarmuka untuk mengatur visibility (show/hide) dan order_sorting untuk setiap Section pada Homepage.
2. WHEN Admin mengubah visibility Section menjadi hidden, THE Portfolio_Site SHALL tidak merender Section tersebut pada Homepage.
3. WHEN Admin mengubah order_sorting Section, THE Portfolio_Site SHALL merender Section pada Homepage sesuai urutan order_sorting secara ascending.
4. THE CMS SHALL mendukung pengaturan visibility dan order untuk Section berikut: Hero, About, Core Expertise, Tech Stack, Featured Projects, Why Work With Me, Work Process, Testimonials, Contact CTA.

---

### Requirement 14: Manajemen Why Work With Me & Work Process Sections

**User Story:** As an Admin, I want to manage the "Why Work With Me" and "Work Process" section content, so that I can communicate my value proposition and workflow to potential clients.

#### Acceptance Criteria

1. THE CMS SHALL menyediakan CRUD untuk Why Work With Me items yang mencakup: title, description, icon, dan order_sorting.
2. THE CMS SHALL menyediakan CRUD untuk Work Process steps yang mencakup: step_number, title, description, icon, dan order_sorting.
3. THE Portfolio_Site SHALL merender Why Work With Me Section dan Work Process Section menggunakan data dari API, diurutkan berdasarkan order_sorting secara ascending.

---

### Requirement 15: SEO Management

**User Story:** As an Admin, I want to manage SEO metadata per page, so that the portfolio ranks well in search engines and displays correctly when shared on social media.

#### Acceptance Criteria

1. THE CMS SHALL menyediakan form SEO Settings global yang mencakup: default meta title, default meta description, default og:image, dan Google Search Console verification code.
2. THE CMS SHALL menyediakan form SEO_Meta per halaman (Homepage, Contact, setiap Project) yang mencakup: meta title, meta description, og:image, dan canonical URL.
3. THE Portfolio_Site SHALL merender tag `<title>`, `<meta name="description">`, `<meta property="og:*">`, dan `<link rel="canonical">` pada setiap halaman menggunakan data SEO_Meta dari API.
4. WHEN SEO_Meta halaman tidak diisi, THE Portfolio_Site SHALL menggunakan SEO Settings global sebagai fallback.
5. THE Portfolio_Site SHALL merender Schema Markup (JSON-LD) bertipe `Person` pada Homepage dan bertipe `CreativeWork` pada setiap halaman Project Detail.
6. THE Portfolio_Site SHALL menghasilkan sitemap.xml yang mencakup semua halaman publik dengan publish_status `published`.
7. THE Portfolio_Site SHALL menghasilkan robots.txt yang mengizinkan crawling pada semua halaman publik.

---

### Requirement 16: Image Upload & Management

**User Story:** As an Admin, I want to upload and preview images within the CMS, so that I can manage visual assets for all content models efficiently.

#### Acceptance Criteria

1. THE CMS SHALL menyediakan komponen Image_Upload yang dapat digunakan pada semua Content_Model yang membutuhkan gambar.
2. WHEN Admin mengunggah gambar, THE CMS SHALL menampilkan preview gambar sebelum disimpan.
3. WHEN Admin mengunggah gambar, THE API SHALL menyimpan file ke storage dan mengembalikan URL gambar yang dapat diakses publik.
4. THE CMS SHALL mendukung pengunggahan multiple images untuk field gallery pada Project.
5. WHEN Admin menghapus gambar dari gallery, THE CMS SHALL menghapus referensi gambar tersebut dari data Project.

---

### Requirement 17: API Layer

**User Story:** As a developer, I want a well-structured API layer, so that the Frontend Portfolio can fetch all content dynamically from the backend.

#### Acceptance Criteria

1. THE API SHALL menyediakan endpoint GET untuk setiap Content_Model yang dibutuhkan oleh Portfolio_Site: Site Settings, Navigation Menu, semua Sections, Projects (list dan detail), Testimonials, Contact Info, Social Links, dan Footer Settings.
2. THE API SHALL mengembalikan response dalam format JSON.
3. WHEN API menerima request untuk Project list, THE API SHALL hanya mengembalikan Projects dengan publish_status `published`.
4. WHEN API menerima request untuk Project detail dengan slug tertentu, THE API SHALL mengembalikan data lengkap Project tersebut jika publish_status `published`.
5. IF API menerima request untuk Project detail dengan slug yang tidak ada atau publish_status `draft`, THEN THE API SHALL mengembalikan HTTP status 404.
6. THE API SHALL menyediakan endpoint POST untuk form Contact yang menerima: name, email, subject, dan message.
7. WHEN API menerima submission Contact form yang valid, THE API SHALL mengirimkan notifikasi email ke alamat email Admin yang terdaftar.
8. IF API menerima submission Contact form dengan field yang tidak valid, THEN THE API SHALL mengembalikan HTTP status 422 beserta daftar field yang tidak valid.

---

### Requirement 18: Frontend Portfolio — Halaman Homepage

**User Story:** As a Visitor, I want to see a complete and professional homepage, so that I can quickly understand who Hidayat is and what services he offers.

#### Acceptance Criteria

1. THE Portfolio_Site SHALL merender Homepage yang memuat semua Section yang memiliki visibility `show`, diurutkan berdasarkan order_sorting.
2. THE Portfolio_Site SHALL merender Homepage menggunakan data dari API, bukan dari nilai hardcoded.
3. THE Portfolio_Site SHALL menampilkan Homepage dengan waktu First Contentful Paint di bawah 2.5 detik pada koneksi 4G standar.
4. THE Portfolio_Site SHALL merender Homepage secara responsif pada viewport mobile (320px–767px), tablet (768px–1023px), dan desktop (1024px ke atas).

---

### Requirement 19: Frontend Portfolio — Halaman Project Detail

**User Story:** As a Visitor, I want to view a detailed case study for each project, so that I can evaluate the quality and scope of Hidayat's work.

#### Acceptance Criteria

1. THE Portfolio_Site SHALL merender halaman Project Detail yang menampilkan: title, thumbnail, gallery, full_description, tech_stack, role, responsibilities, key_features, result_impact, project_year, dan duration.
2. THE Portfolio_Site SHALL merender halaman Project Detail menggunakan data dari API berdasarkan slug pada URL.
3. WHEN Visitor mengakses halaman Project Detail, THE Portfolio_Site SHALL merender SEO_Meta spesifik Project tersebut pada tag `<head>`.
4. THE Portfolio_Site SHALL menampilkan navigasi ke Project sebelumnya dan berikutnya pada halaman Project Detail.

---

### Requirement 20: Frontend Portfolio — Halaman Contact

**User Story:** As a Visitor, I want to send a message through a contact form, so that I can reach out to Hidayat for potential collaboration or hiring.

#### Acceptance Criteria

1. THE Portfolio_Site SHALL merender halaman Contact yang menampilkan: Contact Info, Social Links, dan form kontak dengan field name, email, subject, dan message.
2. WHEN Visitor mengirimkan Contact form dengan semua field valid, THE Portfolio_Site SHALL mengirimkan data ke API dan menampilkan pesan sukses.
3. IF Visitor mengirimkan Contact form dengan field yang tidak valid, THEN THE Portfolio_Site SHALL menampilkan pesan validasi per field tanpa melakukan submit ke API.
4. WHILE Contact form sedang diproses oleh API, THE Portfolio_Site SHALL menampilkan indikator loading dan menonaktifkan tombol submit.

---

### Requirement 21: Frontend Portfolio — Halaman 404

**User Story:** As a Visitor, I want to see a helpful 404 page when I access a non-existent URL, so that I can navigate back to the correct page.

#### Acceptance Criteria

1. WHEN Visitor mengakses URL yang tidak ada pada Portfolio_Site, THE Portfolio_Site SHALL menampilkan halaman 404 dengan HTTP status code 404.
2. THE Portfolio_Site SHALL merender halaman 404 yang menampilkan pesan yang informatif dan tautan untuk kembali ke Homepage.

---

### Requirement 22: Design System & UI

**User Story:** As a Visitor, I want to experience a premium and modern visual design, so that I perceive Hidayat as a professional and credible developer.

#### Acceptance Criteria

1. THE Portfolio_Site SHALL menggunakan palet warna yang konsisten: dark navy sebagai warna utama background, charcoal sebagai warna sekunder, white sebagai warna teks utama, soft blue sebagai warna aksen, dan neutral gray sebagai warna pendukung.
2. THE Portfolio_Site SHALL menerapkan micro-interaction pada elemen interaktif (tombol, link, card) berupa transisi CSS dengan durasi antara 150ms hingga 300ms.
3. THE Portfolio_Site SHALL menggunakan semantic HTML5 elements (`<header>`, `<main>`, `<section>`, `<article>`, `<footer>`, `<nav>`) pada seluruh halaman.
4. THE Portfolio_Site SHALL merender semua halaman dengan layout mobile-first menggunakan breakpoint yang konsisten.

---

### Requirement 23: Round-Trip Data Integrity (Parser/Serializer)

**User Story:** As a developer, I want content data to survive serialization and deserialization without loss, so that the CMS and API always serve accurate content to the frontend.

#### Acceptance Criteria

1. THE API SHALL mengembalikan data JSON yang dapat di-parse ulang menjadi struktur yang ekuivalen dengan data yang disimpan di database (round-trip property).
2. FOR ALL valid Project objects, menyimpan ke database kemudian mengambil melalui API SHALL menghasilkan objek yang ekuivalen dengan objek yang disimpan.
3. FOR ALL valid Testimonial objects, menyimpan ke database kemudian mengambil melalui API SHALL menghasilkan objek yang ekuivalen dengan objek yang disimpan.
