'use client'

import { useState } from 'react'

type NavItem = {
  id: string
  label: string
  url: string
  target?: string | null
}

type MobileMenuProps = {
  items: NavItem[]
}

export default function MobileMenu({ items }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden">
      {/* Hamburger button */}
      <button
        type="button"
        aria-label={isOpen ? 'Tutup menu' : 'Buka menu'}
        aria-expanded={isOpen}
        aria-controls="mobile-nav"
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-2 text-white hover:text-blue-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
      >
        {isOpen ? (
          // X icon
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          // Hamburger icon
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile nav dropdown */}
      {isOpen && (
        <nav id="mobile-nav" aria-label="Mobile navigation">
          <ul className="absolute left-0 right-0 top-full bg-[#0f172a] border-t border-slate-700 px-4 py-3 flex flex-col gap-1 shadow-lg z-50">
            {items.map((item) => (
              <li key={item.id}>
                <a
                  href={item.url}
                  target={item.target ?? '_self'}
                  rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
                  onClick={() => setIsOpen(false)}
                  className="block py-2 px-3 text-white hover:text-blue-400 hover:bg-slate-800 rounded transition-colors duration-150"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  )
}
