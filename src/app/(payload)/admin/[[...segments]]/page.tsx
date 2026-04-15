import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import { importMap } from '../importMap'
import type { SanitizedConfig } from 'payload'

type Args = {
  params: Promise<{
    segments: string[]
  }>
  searchParams: Promise<{
    [key: string]: string | string[]
  }>
}

export const generateMetadata = ({ params, searchParams }: Args) =>
  generatePageMetadata({ config: import('@payload-config') as unknown as Promise<SanitizedConfig>, params, searchParams })

const Page = ({ params, searchParams }: Args) =>
  RootPage({ config: import('@payload-config') as unknown as Promise<SanitizedConfig>, params, searchParams, importMap })

export default Page
