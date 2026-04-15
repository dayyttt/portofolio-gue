import { describe, it, expect } from 'vitest'
import fc from 'fast-check'

describe('Test setup', () => {
  it('vitest works', () => {
    expect(true).toBe(true)
  })

  it('fast-check works', () => {
    fc.assert(
      fc.property(fc.integer(), (n) => {
        return typeof n === 'number'
      })
    )
  })
})
