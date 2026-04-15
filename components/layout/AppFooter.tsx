import { getPayload } from 'payload'
import config from '@payload-config'

export default async function AppFooter() {
  const payload = await getPayload({ config })

  const [footerSettings, socialLinksResult] = await Promise.all([
    payload.findGlobal({ slug: 'footer-settings' }),
    payload.find({
      collection: 'social-links',
      where: { _status: { equals: 'published' } },
      sort: 'order_sorting',
      limit: 100,
    }),
  ])

  const socialLinks = footerSettings.show_social_links ? socialLinksResult.docs : []

  return (
    <footer className="bg-[#0f172a] border-t border-slate-700/50 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          {/* Copyright */}
          <p className="text-sm text-slate-400">
            {footerSettings.copyright_text ?? `© ${new Date().getFullYear()} Hidayat Syahidin Ambo`}
          </p>

          {/* Footer tagline */}
          {footerSettings.footer_tagline && (
            <p className="text-sm text-slate-500 italic">{footerSettings.footer_tagline}</p>
          )}

          {/* Social links */}
          {socialLinks.length > 0 && (
            <ul className="flex items-center gap-4" aria-label="Social links">
              {socialLinks.map((link) => (
                <li key={String(link.id)}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-slate-400 hover:text-blue-400 transition-colors duration-200"
                    aria-label={link.platform_name}
                  >
                    {link.icon ? (
                      <span className={link.icon} aria-hidden="true" />
                    ) : null}
                    <span className={link.icon ? 'sr-only' : undefined}>
                      {link.platform_name}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  )
}
