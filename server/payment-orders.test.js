import { enrollmentOrderVerificationKey, parseEnrollmentOrderItems } from './payment-orders.js'

describe('payment order helpers', () => {
  it('accepts a mixed course and class order', () => {
    expect(parseEnrollmentOrderItems([{ courseId: 3 }, { classId: '8' }])).toEqual([
      { courseId: 3, classId: null },
      { courseId: null, classId: 8 },
    ])
  })

  it('rejects empty, oversized, ambiguous, invalid, and duplicate orders', () => {
    expect(parseEnrollmentOrderItems([])).toBeNull()
    expect(parseEnrollmentOrderItems(Array.from({ length: 11 }, (_, index) => ({ courseId: index + 1 })))).toBeNull()
    expect(parseEnrollmentOrderItems([{ courseId: 1, classId: 2 }])).toBeNull()
    expect(parseEnrollmentOrderItems([{ courseId: 0 }])).toBeNull()
    expect(parseEnrollmentOrderItems([{ courseId: 1 }, { courseId: 1 }])).toBeNull()
  })

  it('binds email verification to the cart targets independent of ordering', () => {
    const first = parseEnrollmentOrderItems([{ courseId: 4 }, { classId: 9 }])
    const reordered = parseEnrollmentOrderItems([{ classId: 9 }, { courseId: 4 }])
    const changed = parseEnrollmentOrderItems([{ courseId: 4 }, { classId: 10 }])
    expect(enrollmentOrderVerificationKey(first)).toBe(enrollmentOrderVerificationKey(reordered))
    expect(enrollmentOrderVerificationKey(first)).not.toBe(enrollmentOrderVerificationKey(changed))
  })
})
