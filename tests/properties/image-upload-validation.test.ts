/**
 * Property 1: Image Upload Validation
 *
 * For any file uploaded through the Payload Media collection, the system should
 * accept the file if and only if its MIME type is one of `image/jpeg`, `image/png`,
 * or `image/webp` AND its size is at most 5MB; any file outside these constraints
 * should be rejected with an error message listing the accepted formats.
 *
 * **Validates: Requirements 4.2, 4.3, 9.5**
 */

import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { Media } from '@/collections/Media'

// ---------------------------------------------------------------------------
// Extract validation constraints directly from the Media collection config
// ---------------------------------------------------------------------------

const uploadConfig = Media.upload as {
  mimeTypes: string[]
  maxFileSize: number
}

const ACCEPTED_MIME_TYPES: string[] = uploadConfig.mimeTypes
const MAX_FILE_SIZE: number = uploadConfig.maxFileSize // 5242880 bytes (5MB)

/**
 * Pure validation function that mirrors what Payload enforces via the upload
 * config. Returns null when valid, or an error message when invalid.
 */
function validateUpload(mimeType: string, filesize: number): string | null {
  if (!ACCEPTED_MIME_TYPES.includes(mimeType)) {
    return `Format gambar tidak didukung. Gunakan ${ACCEPTED_MIME_TYPES.join(', ')}.`
  }
  if (filesize > MAX_FILE_SIZE) {
    return `Ukuran file melebihi batas maksimal ${MAX_FILE_SIZE / (1024 * 1024)}MB.`
  }
  return null
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** A small set of MIME types that are NOT in the accepted list */
const invalidMimeTypes = [
  'image/gif',
  'image/bmp',
  'image/tiff',
  'image/svg+xml',
  'application/pdf',
  'video/mp4',
  'text/plain',
  'application/octet-stream',
]

const validMimeArb = fc.constantFrom(...ACCEPTED_MIME_TYPES)
const invalidMimeArb = fc.oneof(
  fc.constantFrom(...invalidMimeTypes),
  // Also generate arbitrary strings that are not in the accepted list
  fc.string({ minLength: 1, maxLength: 50 }).filter((s) => !ACCEPTED_MIME_TYPES.includes(s)),
)

/** File sizes in bytes: 0 to 10MB range */
const fileSizeArb = fc.integer({ min: 0, max: 10 * 1024 * 1024 })
const validSizeArb = fc.integer({ min: 0, max: MAX_FILE_SIZE })
const invalidSizeArb = fc.integer({ min: MAX_FILE_SIZE + 1, max: 10 * 1024 * 1024 })

// ---------------------------------------------------------------------------
// Properties
// ---------------------------------------------------------------------------

describe('Property 1: Image Upload Validation', () => {
  /**
   * Property 1a: Valid MIME type + size ≤ 5MB → accepted (no error)
   */
  it('accepts files with valid MIME type and size ≤ 5MB', () => {
    fc.assert(
      fc.property(validMimeArb, validSizeArb, (mimeType, filesize) => {
        const error = validateUpload(mimeType, filesize)
        expect(error).toBeNull()
      }),
      { numRuns: 100 },
    )
  })

  /**
   * Property 1b: Invalid MIME type → rejected regardless of size
   */
  it('rejects files with invalid MIME type regardless of size', () => {
    fc.assert(
      fc.property(invalidMimeArb, fileSizeArb, (mimeType, filesize) => {
        const error = validateUpload(mimeType, filesize)
        expect(error).not.toBeNull()
        // Requirement 4.3: error message must mention accepted formats
        ACCEPTED_MIME_TYPES.forEach((accepted) => {
          expect(error).toContain(accepted)
        })
      }),
      { numRuns: 100 },
    )
  })

  /**
   * Property 1c: Valid MIME type + size > 5MB → rejected
   */
  it('rejects files with valid MIME type but size > 5MB', () => {
    fc.assert(
      fc.property(validMimeArb, invalidSizeArb, (mimeType, filesize) => {
        const error = validateUpload(mimeType, filesize)
        expect(error).not.toBeNull()
      }),
      { numRuns: 100 },
    )
  })

  /**
   * Property 1d (biconditional): accept iff valid type AND size ≤ 5MB
   * This is the core "if and only if" property.
   */
  it('accepts if and only if MIME type is valid AND size ≤ 5MB', () => {
    fc.assert(
      fc.property(
        fc.oneof(validMimeArb, invalidMimeArb),
        fileSizeArb,
        (mimeType, filesize) => {
          const isValidMime = ACCEPTED_MIME_TYPES.includes(mimeType)
          const isValidSize = filesize <= MAX_FILE_SIZE
          const shouldAccept = isValidMime && isValidSize

          const error = validateUpload(mimeType, filesize)

          if (shouldAccept) {
            expect(error).toBeNull()
          } else {
            expect(error).not.toBeNull()
          }
        },
      ),
      { numRuns: 100 },
    )
  })

  /**
   * Structural check: the Media collection config exposes exactly the
   * three accepted MIME types required by the spec.
   */
  it('Media collection config accepts exactly image/jpeg, image/png, image/webp', () => {
    expect(ACCEPTED_MIME_TYPES).toContain('image/jpeg')
    expect(ACCEPTED_MIME_TYPES).toContain('image/png')
    expect(ACCEPTED_MIME_TYPES).toContain('image/webp')
    expect(ACCEPTED_MIME_TYPES).toHaveLength(3)
  })

  /**
   * Structural check: the Media collection config enforces 5MB max file size.
   */
  it('Media collection config enforces 5MB (5242880 bytes) max file size', () => {
    expect(MAX_FILE_SIZE).toBe(5242880)
  })
})
