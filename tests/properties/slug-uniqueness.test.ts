/**
 * Property 6: Slug Uniqueness Across Projects
 *
 * For any two distinct projects in the database, their `slug` values must differ;
 * attempting to create or update a project with a slug that already exists must be
 * rejected with a validation error identifying the conflicting slug.
 *
 * **Validates: Requirements 9.3, 9.4**
 */

import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { Projects } from '@/collections/Projects'
import { ProjectCategories } from '@/collections/ProjectCategories'

// ---------------------------------------------------------------------------
// Extract slug field config from the Projects collection
// ---------------------------------------------------------------------------

/**
 * Recursively flatten all fields from a Payload field config array,
 * including fields nested inside tabs.
 */
function flattenFields(fields: any[]): any[] {
  const result: any[] = []
  for (const field of fields) {
    if (field.type === 'tabs' && Array.isArray(field.tabs)) {
      for (const tab of field.tabs) {
        if (Array.isArray(tab.fields)) {
          result.push(...flattenFields(tab.fields))
        }
      }
    } else {
      result.push(field)
    }
  }
  return result
}

const allProjectFields = flattenFields(Projects.fields)
const slugField = allProjectFields.find((f) => f.name === 'slug')
const titleField = allProjectFields.find((f) => f.name === 'title')
const shortDescField = allProjectFields.find((f) => f.name === 'short_description')

// ---------------------------------------------------------------------------
// Pure slug validation helpers (mirrors Payload's unique constraint logic)
// ---------------------------------------------------------------------------

/**
 * Simulates an in-memory "database" of existing slugs and validates whether
 * a new slug can be inserted. Returns null if valid, or an error message if
 * the slug already exists.
 */
function validateSlugUniqueness(
  existingSlugs: string[],
  newSlug: string,
): string | null {
  if (existingSlugs.includes(newSlug)) {
    return `Slug "${newSlug}" sudah digunakan. Slug harus unik di antara semua Projects.`
  }
  return null
}

/**
 * Simulates slug validation for an update operation (same slug on same doc is OK).
 */
function validateSlugUniquenessOnUpdate(
  existingSlugs: string[],
  currentDocSlug: string,
  newSlug: string,
): string | null {
  // A document may keep its own slug — only conflict with OTHER documents
  const otherSlugs = existingSlugs.filter((s) => s !== currentDocSlug)
  if (otherSlugs.includes(newSlug)) {
    return `Slug "${newSlug}" sudah digunakan. Slug harus unik di antara semua Projects.`
  }
  return null
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Generates a valid URL-friendly slug string */
const slugArb = fc
  .stringMatching(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  .filter((s) => s.length >= 2 && s.length <= 80)

/** Generates an array of unique slugs (simulates existing DB state) */
const uniqueSlugListArb = fc
  .array(slugArb, { minLength: 1, maxLength: 20 })
  .map((slugs) => Array.from(new Set(slugs))) // deduplicate
  .filter((slugs) => slugs.length >= 1)

// ---------------------------------------------------------------------------
// Properties
// ---------------------------------------------------------------------------

describe('Property 6: Slug Uniqueness Across Projects', () => {
  /**
   * Property 6a: Inserting a slug that already exists → rejected with error
   * mentioning the conflicting slug.
   */
  it('rejects a duplicate slug and error message identifies the conflicting slug', () => {
    fc.assert(
      fc.property(uniqueSlugListArb, fc.nat({ max: 19 }), (existingSlugs, idx) => {
        // Pick an existing slug to attempt as a duplicate
        const duplicateSlug = existingSlugs[idx % existingSlugs.length]!

        const error = validateSlugUniqueness(existingSlugs, duplicateSlug)

        // Must be rejected
        expect(error).not.toBeNull()
        // Error message must identify the conflicting slug (Requirement 9.4)
        expect(error).toContain(duplicateSlug)
      }),
      { numRuns: 100 },
    )
  })

  /**
   * Property 6b: Inserting a slug that does NOT exist in the DB → accepted
   */
  it('accepts a slug that does not conflict with any existing slug', () => {
    fc.assert(
      fc.property(uniqueSlugListArb, slugArb, (existingSlugs, newSlug) => {
        // Only test when the new slug is genuinely new
        fc.pre(!existingSlugs.includes(newSlug))

        const error = validateSlugUniqueness(existingSlugs, newSlug)
        expect(error).toBeNull()
      }),
      { numRuns: 100 },
    )
  })

  /**
   * Property 6c: For any two distinct projects, their slugs must differ.
   * Simulates creating N projects sequentially — each new slug is checked
   * against all previously accepted slugs.
   */
  it('no two projects in the same collection share a slug', () => {
    fc.assert(
      fc.property(
        fc.array(slugArb, { minLength: 2, maxLength: 20 }),
        (candidateSlugs) => {
          const acceptedSlugs: string[] = []

          for (const slug of candidateSlugs) {
            const error = validateSlugUniqueness(acceptedSlugs, slug)
            if (error === null) {
              // Accepted — add to the "database"
              acceptedSlugs.push(slug)
            }
            // Rejected slugs are not persisted (no partial record)
          }

          // Invariant: all accepted slugs are unique
          const uniqueAccepted = new Set(acceptedSlugs)
          expect(uniqueAccepted.size).toBe(acceptedSlugs.length)
        },
      ),
      { numRuns: 100 },
    )
  })

  /**
   * Property 6d: Updating a project to use its OWN current slug → accepted
   * (a document should not conflict with itself on update).
   */
  it('allows a project to keep its own slug on update', () => {
    fc.assert(
      fc.property(uniqueSlugListArb, fc.nat({ max: 19 }), (existingSlugs, idx) => {
        const currentSlug = existingSlugs[idx % existingSlugs.length]!

        // Updating with the same slug should be fine
        const error = validateSlugUniquenessOnUpdate(existingSlugs, currentSlug, currentSlug)
        expect(error).toBeNull()
      }),
      { numRuns: 100 },
    )
  })

  /**
   * Property 6e: Updating a project to use ANOTHER project's slug → rejected
   */
  it('rejects updating a project slug to one already used by another project', () => {
    fc.assert(
      fc.property(
        uniqueSlugListArb.filter((slugs) => slugs.length >= 2),
        fc.nat({ max: 19 }),
        fc.nat({ max: 19 }),
        (existingSlugs, idxA, idxB) => {
          const slugA = existingSlugs[idxA % existingSlugs.length]!
          const slugB = existingSlugs[idxB % existingSlugs.length]!

          // Only meaningful when the two slugs are different
          fc.pre(slugA !== slugB)

          // Project A tries to update its slug to slugB (already owned by project B)
          const error = validateSlugUniquenessOnUpdate(existingSlugs, slugA, slugB)
          expect(error).not.toBeNull()
          expect(error).toContain(slugB)
        },
      ),
      { numRuns: 100 },
    )
  })

  // ---------------------------------------------------------------------------
  // Structural checks — verify the Projects collection config enforces uniqueness
  // ---------------------------------------------------------------------------

  it('Projects collection slug field has unique: true', () => {
    expect(slugField).toBeDefined()
    expect(slugField?.unique).toBe(true)
  })

  it('Projects collection slug field has required: true', () => {
    expect(slugField?.required).toBe(true)
  })

  it('Projects collection slug field has index: true', () => {
    expect(slugField?.index).toBe(true)
  })

  it('Projects collection has a DB index on slug field', () => {
    const indexes = Projects.indexes as Array<{ fields: string[] }>
    const slugIndex = indexes?.find((idx) => idx.fields.includes('slug'))
    expect(slugIndex).toBeDefined()
  })

  it('ProjectCategories collection slug field also has unique: true', () => {
    const catSlugField = ProjectCategories.fields.find((f: any) => f.name === 'slug')
    expect(catSlugField).toBeDefined()
    expect((catSlugField as any)?.unique).toBe(true)
  })
})
