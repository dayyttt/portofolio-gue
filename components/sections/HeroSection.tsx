import Link from 'next/link'
import BaseButton from '../ui/BaseButton'
import BaseImage from '../ui/BaseImage'
import SectionWrapper from '../ui/SectionWrapper'

interface ProfileImage {
  url?: string | null
  alt?: string | null
}

interface HeroSectionProps {
  headline: string
  subheadline?: string | null
  cta_primary_text?: string | null
  cta_primary_url?: string | null
  cta_secondary_text?: string | null
  cta_secondary_url?: string | null
  profile_image?: ProfileImage | null
}

export default function HeroSection({
  headline,
  subheadline,
  cta_primary_text,
  cta_primary_url,
  cta_secondary_text,
  cta_secondary_url,
  profile_image,
}: HeroSectionProps) {
  return (
    <SectionWrapper className="bg-navy-900 min-h-[80vh] flex items-center">
      <div className="flex flex-col-reverse items-center gap-10 md:flex-row md:justify-between">
        {/* Text content */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
            {headline}
          </h1>

          {subheadline && (
            <p className="mt-4 text-lg text-gray-300 md:text-xl">{subheadline}</p>
          )}

          {(cta_primary_text || cta_secondary_text) && (
            <div className="mt-8 flex flex-wrap justify-center gap-4 md:justify-start">
              {cta_primary_text && cta_primary_url && (
                <Link href={cta_primary_url}>
                  <BaseButton
                    variant="primary"
                    className="transition-transform duration-200 hover:scale-105"
                  >
                    {cta_primary_text}
                  </BaseButton>
                </Link>
              )}

              {cta_secondary_text && cta_secondary_url && (
                <Link href={cta_secondary_url}>
                  <BaseButton
                    variant="secondary"
                    className="transition-transform duration-200 hover:scale-105"
                  >
                    {cta_secondary_text}
                  </BaseButton>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Profile image */}
        {profile_image?.url && (
          <div className="flex-shrink-0">
            <div className="relative h-56 w-56 overflow-hidden rounded-full ring-4 ring-blue-500/30 md:h-72 md:w-72 lg:h-80 lg:w-80">
              <BaseImage
                src={profile_image.url}
                alt={profile_image.alt ?? headline}
                fill
                className="object-cover"
                priority
                loading="eager"
              />
            </div>
          </div>
        )}
      </div>
    </SectionWrapper>
  )
}
