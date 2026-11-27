import { createHash } from 'node:crypto'

const parseTargetId = (value) => {
  if (typeof value !== 'number' && typeof value !== 'string') return null
  const text = String(value)
  if (!/^\d+$/.test(text)) return null
  const id = Number(text)
  return Number.isSafeInteger(id) && id > 0 ? id : null
}

export const parseEnrollmentOrderItems = (input) => {
  if (!Array.isArray(input) || input.length < 1 || input.length > 10) return null
  const items = []
  const seen = new Set()
  for (const entry of input) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return null
    const hasCourse = entry.courseId !== undefined && entry.courseId !== null
    const hasClass = entry.classId !== undefined && entry.classId !== null
    if (hasCourse === hasClass) return null
    const id = parseTargetId(hasCourse ? entry.courseId : entry.classId)
    if (id === null) return null
    const key = `${hasCourse ? 'course' : 'class'}:${id}`
    if (seen.has(key)) return null
    seen.add(key)
    items.push(hasCourse ? { courseId: id, classId: null } : { courseId: null, classId: id })
  }
  return items
}

export const enrollmentOrderVerificationKey = (items) => {
  const targets = items.map(({ courseId, classId }) => courseId === null ? `class:${classId}` : `course:${courseId}`).sort()
  return `order:${createHash('sha256').update(JSON.stringify(targets)).digest('hex')}`
}
