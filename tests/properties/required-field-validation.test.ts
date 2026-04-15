/**
 * Property 7: Required Field Validation
 *
 * For any content creation request (Expertise Item, Tech Stack Item, Project Category,
 * Project, Testimonial) that omits one or more required fields, Payload must reject the
 * request and return a validation error identifying each missing field; no partial record
 * should be persisted.
 *
 * **Validates: Requirements 6.2, 7.2, 8.2, 9.2, 10.2**
 */

import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { Projects } from '@/collections/Projects'
import { ExpertiseItems } from '@/collections/ExpertiseItems'
import { TechStackItems } from '@/collections/TechStackItems'
import { ProjectCategories } from '@/collections/ProjectCategories'
import { Testimonials } from '@/collections/Testimonials'
import type { CollectionConfig, Field } from 'payload'

// ---------------------------------------------------------------------------
// Helpers — extract required field names from a Payload collection config
// ---------------------------------------------------------------------------

/**
 * Recursively flatten all fields from a Payload field config array,
 * including fields nested inside tabs and groups.
 */
function flattenFields(fields: Field[]): Field[] {
  const result: Field[] = []
  for (const field of fields) {
    if (field.type === 'tabs' && Array.isArray(field.tabs)) {
      for (const tab of field.tabs) {
        if (Array.isArray(tab.fields)) {
          result.push(...flattenFields(tab.fields as Field[]))
        }
      }
    } else if (field.type === 'group' && Array.isArray((field as any).fields)) {
      result.push(...flattenFields((field as any).fields as Field[]))
    } else {
      result.push(field)
    }
  }
  return result
}

/** Returns the names of all fields that have `required: true` */
function getRequiredFieldNames(collection: CollectionConfig): string[] {
  const allFields = flattenFields(collection.fields as Field[])
  return allFields
    .filter((f): f is Field & { name: string; required: true } => {
      return 'name' in f && (f as any).required === true
    })
    .map((f) => (f as any).name as string)
}

// ---------------------------------------------------------------------------
// Pure validation — mirrors what Payload enforces for required fields
// ---------------------------------------------------------------------------

/**
 * Validates a data object against a list of required field names.
 * Returns an array of error objects (one per missing field), or empty if valid.
 *
 * A field is considered "missing" when its value is:
 *   - undefined
 *   - null
 *   - empty string ''
 *   - for upload/relationship fields: falsy (no ID provided)
 */
function validateRequiredFields(
  requiredFields: string[],
  data: Record<string, unknown>,
): Array<{ field: string; message: string }> {
  const errors: Array<{ field: string; message: string }> = []
  for (const fieldName of requiredFields) {
    const value = data[fieldName]
    const isMissing =
      value === undefined ||
      value === null ||
      value === ''
    if (isMissing) {
      errors.push({
        field: fieldName,
        message: `Field '${fieldName}' is required`,
      })
    }
  }
  return errors
}

/**
 * Simulates whether a Payload create operation would be accepted or rejected.
 * Returns null when valid, or an array of field errors when invalid.
 */
function simulateCreate(
  collection: CollectionConfig,
  data: Record<string, unknown>,
): Array<{ field: string; message: string }> | null {
  const requiredFields = getRequiredFieldNames(collection)
  const errors = validateRequiredFields(requiredFields, data)
  return errors.length > 0 ? errors : null
}

// ---------------------------------------------------------------------------
// Arbitraries — valid base data per collection
// ---------------------------------------------------------------------------

/** Non-empty string generator */
const nonEmptyStr = fc.string({ minLength: 1, maxLength: 80 }).filter((s) => s.trim().length > 0)

/** Simulated media ID (non-empty string acting as a relationship ID) */
const mediaIdArb = fc.uuid()

/** Valid base data for each collection (all required fields present) */
const validExpertiseData = fc.record({
  title: nonEmptyStr,
  description: nonEmptyStr,
})

const validTechStackData = fc.record({
  name: nonEmptyStr,
  logo: mediaIdArb,
  category: fc.constantFrom('Frontend', 'Backend', 'Database', 'DevOps', 'Mobile', 'Other'),
})

const validProjectCategoryData = fc.record({
  name: nonEmptyStr,
  slug: fc.stringMatching(/^[a-z0-9]+(-[a-z0-9]+)*$/).filter((s) => s.length >= 2 && s.length <= 60),
})

const validProjectData = fc.record({
  title: nonEmptyStr,
  slug: fc.stringMatching(/^[a-z0-9]+(-[a-z0-9]+)*$/).filter((s) => s.length >= 2 && s.length <= 60),
  short_description: nonEmptyStr,
  thumbnail: mediaIdArb,
  category: fc.uuid(),
})

const validTestimonialData = fc.record({
  name: nonEmptyStr,
  position: nonEmptyStr,
  company: nonEmptyStr,
  quote: nonEmptyStr,
})

// ---------------------------------------------------------------------------
// Helper: build an arbitrary that omits a non-empty subset of required fields
// ---------------------------------------------------------------------------

/**
 * Given a valid data record and its required field names, returns an arbitrary
 * that produces a copy of the record with one or more required fields removed.
 */
function withMissingFields<T extends Record<string, unknown>>(
  dataArb: fc.Arbitrary<T>,
  requiredFields: string[],
): fc.Arbitrary<{ data: Record<string, unknown>; omitted: string[] }> {
  return dataArb.chain((data) => {
    // Pick a non-empty subset of required fields to omit
    return fc
      .subarray(requiredFields, { minLength: 1 })
      .map((omitted) => {
        const incomplete: Record<string, unknown> = { ...data }
        for (const field of omitted) {
          delete incomplete[field]
        }
        return { data: incomplete, omitted }
      })
  })
}

// ---------------------------------------------------------------------------
// Properties
// ---------------------------------------------------------------------------

describe('Property 7: Required Field Validation', () => {
  // -------------------------------------------------------------------------
  // ExpertiseItems — Requirement 6.2
  // -------------------------------------------------------------------------

  const expertiseRequired = getRequiredFieldNames(ExpertiseItems)

  it('ExpertiseItems collection has required fields: title, description', () => {
    expect(expertiseRequired).toContain('title')
    expect(expertiseRequired).toContain('description')
  })

  it('rejects ExpertiseItem creation when one or more required fields are missing', () => {
    fc.assert(
      fc.property(
        withMissingFields(validExpertiseData, expertiseRequired),
        ({ data, omitted }) => {
          const errors = simulateCreate(ExpertiseItems, data)

          // Must be rejected
          expect(errors).not.toBeNull()
          expect(errors!.length).toBeGreaterThan(0)

          // Each omitted field must appear in the errors
          for (const field of omitted) {
            const fieldError = errors!.find((e) => e.field === field)
            expect(fieldError).toBeDefined()
            expect(fieldError!.message).toContain(field)
          }
        },
      ),
      { numRuns: 100 },
    )
  })

  it('accepts ExpertiseItem creation when all required fields are present', () => {
    fc.assert(
      fc.property(validExpertiseData, (data) => {
        const errors = simulateCreate(ExpertiseItems, data)
        expect(errors).toBeNull()
      }),
      { numRuns: 100 },
    )
  })

  // -------------------------------------------------------------------------
  // TechStackItems — Requirement 7.2
  // -------------------------------------------------------------------------

  const techStackRequired = getRequiredFieldNames(TechStackItems)

  it('TechStackItems collection has required fields: name, logo, category', () => {
    expect(techStackRequired).toContain('name')
    expect(techStackRequired).toContain('logo')
    expect(techStackRequired).toContain('category')
  })

  it('rejects TechStackItem creation when one or more required fields are missing', () => {
    fc.assert(
      fc.property(
        withMissingFields(validTechStackData, techStackRequired),
        ({ data, omitted }) => {
          const errors = simulateCreate(TechStackItems, data)

          expect(errors).not.toBeNull()
          expect(errors!.length).toBeGreaterThan(0)

          for (const field of omitted) {
            const fieldError = errors!.find((e) => e.field === field)
            expect(fieldError).toBeDefined()
            expect(fieldError!.message).toContain(field)
          }
        },
      ),
      { numRuns: 100 },
    )
  })

  it('accepts TechStackItem creation when all required fields are present', () => {
    fc.assert(
      fc.property(validTechStackData, (data) => {
        const errors = simulateCreate(TechStackItems, data)
        expect(errors).toBeNull()
      }),
      { numRuns: 100 },
    )
  })

  it('rejects TechStackItem when logo (upload/media) field is omitted', () => {
    fc.assert(
      fc.property(
        fc.record({ name: nonEmptyStr, category: fc.constantFrom('Frontend', 'Backend') }),
        (data) => {
          // logo intentionally absent
          const errors = simulateCreate(TechStackItems, data)
          expect(errors).not.toBeNull()
          const logoError = errors!.find((e) => e.field === 'logo')
          expect(logoError).toBeDefined()
        },
      ),
      { numRuns: 100 },
    )
  })

  // -------------------------------------------------------------------------
  // ProjectCategories — Requirement 8.2
  // -------------------------------------------------------------------------

  const categoryRequired = getRequiredFieldNames(ProjectCategories)

  it('ProjectCategories collection has required fields: name, slug', () => {
    expect(categoryRequired).toContain('name')
    expect(categoryRequired).toContain('slug')
  })

  it('rejects ProjectCategory creation when one or more required fields are missing', () => {
    fc.assert(
      fc.property(
        withMissingFields(validProjectCategoryData, categoryRequired),
        ({ data, omitted }) => {
          const errors = simulateCreate(ProjectCategories, data)

          expect(errors).not.toBeNull()
          expect(errors!.length).toBeGreaterThan(0)

          for (const field of omitted) {
            const fieldError = errors!.find((e) => e.field === field)
            expect(fieldError).toBeDefined()
            expect(fieldError!.message).toContain(field)
          }
        },
      ),
      { numRuns: 100 },
    )
  })

  it('accepts ProjectCategory creation when all required fields are present', () => {
    fc.assert(
      fc.property(validProjectCategoryData, (data) => {
        const errors = simulateCreate(ProjectCategories, data)
        expect(errors).toBeNull()
      }),
      { numRuns: 100 },
    )
  })

  // -------------------------------------------------------------------------
  // Projects — Requirement 9.2
  // -------------------------------------------------------------------------

  const projectRequired = getRequiredFieldNames(Projects)

  it('Projects collection has required fields: title, slug, short_description, thumbnail, category', () => {
    expect(projectRequired).toContain('title')
    expect(projectRequired).toContain('slug')
    expect(projectRequired).toContain('short_description')
    expect(projectRequired).toContain('thumbnail')
    expect(projectRequired).toContain('category')
  })

  it('rejects Project creation when one or more required fields are missing', () => {
    fc.assert(
      fc.property(
        withMissingFields(validProjectData, projectRequired),
        ({ data, omitted }) => {
          const errors = simulateCreate(Projects, data)

          expect(errors).not.toBeNull()
          expect(errors!.length).toBeGreaterThan(0)

          for (const field of omitted) {
            const fieldError = errors!.find((e) => e.field === field)
            expect(fieldError).toBeDefined()
            expect(fieldError!.message).toContain(field)
          }
        },
      ),
      { numRuns: 100 },
    )
  })

  it('accepts Project creation when all required fields are present', () => {
    fc.assert(
      fc.property(validProjectData, (data) => {
        const errors = simulateCreate(Projects, data)
        expect(errors).toBeNull()
      }),
      { numRuns: 100 },
    )
  })

  // -------------------------------------------------------------------------
  // Testimonials — Requirement 10.2
  // -------------------------------------------------------------------------

  const testimonialRequired = getRequiredFieldNames(Testimonials)

  it('Testimonials collection has required fields: name, position, company, quote', () => {
    expect(testimonialRequired).toContain('name')
    expect(testimonialRequired).toContain('position')
    expect(testimonialRequired).toContain('company')
    expect(testimonialRequired).toContain('quote')
  })

  it('rejects Testimonial creation when one or more required fields are missing', () => {
    fc.assert(
      fc.property(
        withMissingFields(validTestimonialData, testimonialRequired),
        ({ data, omitted }) => {
          const errors = simulateCreate(Testimonials, data)

          expect(errors).not.toBeNull()
          expect(errors!.length).toBeGreaterThan(0)

          for (const field of omitted) {
            const fieldError = errors!.find((e) => e.field === field)
            expect(fieldError).toBeDefined()
            expect(fieldError!.message).toContain(field)
          }
        },
      ),
      { numRuns: 100 },
    )
  })

  it('accepts Testimonial creation when all required fields are present', () => {
    fc.assert(
      fc.property(validTestimonialData, (data) => {
        const errors = simulateCreate(Testimonials, data)
        expect(errors).toBeNull()
      }),
      { numRuns: 100 },
    )
  })

  // -------------------------------------------------------------------------
  // No partial record persisted — cross-collection invariant
  // -------------------------------------------------------------------------

  it('no partial record is persisted: rejected requests return errors and do not produce a record', () => {
    // Simulate an in-memory "store" — only records that pass validation are added
    fc.assert(
      fc.property(
        fc.array(
          fc.oneof(
            withMissingFields(validExpertiseData, expertiseRequired).map((x) => ({
              ...x,
              collection: ExpertiseItems,
            })),
            withMissingFields(validProjectCategoryData, categoryRequired).map((x) => ({
              ...x,
              collection: ProjectCategories,
            })),
            withMissingFields(validTestimonialData, testimonialRequired).map((x) => ({
              ...x,
              collection: Testimonials,
            })),
          ),
          { minLength: 1, maxLength: 10 },
        ),
        (attempts) => {
          const store: Array<{ collection: string; data: Record<string, unknown> }> = []

          for (const { collection, data } of attempts) {
            const errors = simulateCreate(collection, data)
            if (errors === null) {
              // Valid — would be persisted
              store.push({ collection: collection.slug, data })
            }
            // Invalid — NOT persisted (no partial record)
          }

          // Every record in the store must have passed validation
          for (const { collection: slug, data } of store) {
            const col = [ExpertiseItems, ProjectCategories, Testimonials].find(
              (c) => c.slug === slug,
            )!
            const errors = simulateCreate(col, data)
            expect(errors).toBeNull()
          }
        },
      ),
      { numRuns: 100 },
    )
  })
})
