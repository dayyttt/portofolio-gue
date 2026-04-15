import AppNav from './AppNav'

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#0f172a] border-b border-slate-700/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 relative">
          {/* Logo / Site name */}
          <a
            href="/"
            className="text-white font-bold text-lg hover:text-blue-400 transition-colors duration-200"
            aria-label="Kembali ke halaman utama"
          >
            Hidayat<span className="text-blue-400">.</span>
          </a>

          {/* Navigation */}
          <AppNav />
        </div>
      </div>
    </header>
  )
}
