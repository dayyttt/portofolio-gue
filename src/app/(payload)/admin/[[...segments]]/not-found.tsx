import { NotFoundPage } from '@payloadcms/next/views'
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

const NotFound = ({ params, searchParams }: Args) =>
  NotFoundPage({ config: import('@payload-config') as unknown as Promise<SanitizedConfig>, params, searchParams, importMap })

export default NotFound
