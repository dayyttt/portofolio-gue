import { getPayload } from 'payload'
import config from '@payload-config'
import MobileMenu from './MobileMenu'

export default async function AppNav() {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'navigation-menus',
    where: {
      is_active: { equals: true },
    },
    sort: 'order_sorting',
    limit: 100,
  })

  const items = result.docs.map((doc) => ({
    id: String(doc.id),
    label: doc.label,
    url: doc.url,
    target: doc.target ?? '_self',
  }))

  return (
    <nav aria-label="Main navigation" className="flex items-center gap-1 relative">
      {/* Desktop nav links */}
      <ul className="hidden md:flex items-center gap-1">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={item.url}
              target={item.target}
              rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
              className="px-4 py-2 text-sm font-medium text-white hover:text-blue-400 transition-colors duration-200 rounded hover:bg-slate-800"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>

      {/* Mobile hamburger menu (Client Component) */}
      <MobileMenu items={items} />
    </nav>
  )
}
