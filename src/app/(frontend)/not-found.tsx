import Link from 'next/link'

export default function NotFound() {
  return (
    <main>
      <h1>404 — Halaman Tidak Ditemukan</h1>
      <p>Halaman yang Anda cari tidak tersedia atau telah dipindahkan.</p>
      <Link href="/">Kembali ke Homepage</Link>
    </main>
  )
}
