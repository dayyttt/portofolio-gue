import { HTMLAttributes } from 'react'

interface SectionWrapperProps extends HTMLAttributes<HTMLElement> {
  children: React.ReactNode
}

export default function SectionWrapper({
  children,
  className = '',
  ...props
}: SectionWrapperProps) {
  return (
    <section className={`py-16 px-4 ${className}`} {...props}>
      <div className="max-w-7xl mx-auto">{children}</div>
    </section>
  )
}
