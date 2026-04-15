// Project Detail Page — Server Component
// Full implementation in task 13.2
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{ slug: string }>
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params

  // TODO: fetch project from Payload Local API by slug (task 13.2)
  if (!slug) notFound()

  return (
    <main>
      <h1>Project: {slug}</h1>
    </main>
  )
}
