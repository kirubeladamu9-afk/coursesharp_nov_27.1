import { describe, expect, it } from 'vitest'
import { buildDiagnosticReport, classifyEvidence, resolveCheckpointSubtopic } from './checkpoint-diagnostics.js'

describe('resolveCheckpointSubtopic', () => {
  const registered = new Map([[5, 'Equivalent fractions']])

  it('uses the registered subtopic title for a managed subtopic', () => {
    expect(resolveCheckpointSubtopic({ subtopicId: 5, customSubtopic: '' }, registered)).toEqual({ key: 'subtopic:5', title: 'Equivalent fractions' })
  })

  it('treats a deleted managed subtopic as no subtopic', () => {
    expect(resolveCheckpointSubtopic({ subtopicId: 9 }, registered)).toBeNull()
  })

  it('normalises custom subtopic labels so the same label groups together', () => {
    expect(resolveCheckpointSubtopic({ customSubtopic: '  Word   Problems ' }, registered)).toEqual({ key: 'custom:word problems', title: 'Word Problems' })
    expect(resolveCheckpointSubtopic({ customSubtopic: 'word problems' }, registered).key).toBe('custom:word problems')
  })

  it('returns no subtopic when none is set', () => {
    expect(resolveCheckpointSubtopic({ customSubtopic: '   ' }, registered)).toBeNull()
  })
})

const record = (enrollmentId, checkpointId, outcome, topicId = 1, subtopicKey = null) => ({
  enrollmentId,
  evidenceKey: `checkpoint:10:${checkpointId}`,
  topicId,
  subtopicKey,
  outcome,
})

describe('classifyEvidence', () => {
  it('does not classify a learner with fewer than three answered checkpoints', () => {
    expect(classifyEvidence({ correct: 0, incorrect: 0 })).toBe('not_proven')
    expect(classifyEvidence({ correct: 0, incorrect: 2 })).toBe('not_proven')
  })

  it('does not treat a single incorrect answer as weak evidence', () => {
    expect(classifyEvidence({ correct: 1, incorrect: 1 })).toBe('not_proven')
    expect(classifyEvidence({ correct: 2, incorrect: 1 })).toBe('not_proven')
  })

  it('classifies three answers with two incorrect as needing practice', () => {
    expect(classifyEvidence({ correct: 1, incorrect: 2 })).toBe('needs_practice')
  })

  it('classifies 80 percent accuracy with three or more answers as strong', () => {
    expect(classifyEvidence({ correct: 3, incorrect: 0 })).toBe('strong')
    expect(classifyEvidence({ correct: 4, incorrect: 1 })).toBe('strong')
  })

  it('gives needs practice precedence when two misses appear even at 80 percent accuracy', () => {
    expect(classifyEvidence({ correct: 8, incorrect: 2 })).toBe('needs_practice')
  })

  it('keeps a single miss at high accuracy as strong', () => {
    expect(classifyEvidence({ correct: 9, incorrect: 1 })).toBe('strong')
  })
})

describe('buildDiagnosticReport', () => {
  const topics = [{ id: 1, title: 'Fractions', subtopics: [{ key: 'subtopic:5', title: 'Equivalent fractions' }] }]

  it('keeps skipped checkpoints out of the answered count and the incorrect count', () => {
    const records = [record(1, 1, 'correct'), record(1, 2, 'skipped'), record(1, 3, 'skipped'), record(1, 4, 'skipped')]
    const report = buildDiagnosticReport({ topics, records, enrollmentIds: [1] })

    expect(report.topics[0].totals).toEqual({ correct: 1, incorrect: 0, skipped: 3 })
    expect(report.students[0].topics[0]).toMatchObject({ answered: 1, incorrect: 0, skipped: 3, level: 'not_proven' })
    expect(report.students[0].needsSupport).toBe(false)
  })

  it('does not count unanswered checkpoints, which have no records', () => {
    const report = buildDiagnosticReport({ topics, records: [], enrollmentIds: [1, 2] })

    expect(report.topics[0].levels).toEqual({ strong: 0, needs_practice: 0, not_proven: 2 })
    expect(report.students.every((student) => student.topics.length === 0)).toBe(true)
  })

  it('flags students who need practice and nobody else', () => {
    const records = [
      record(1, 1, 'incorrect'), record(1, 2, 'incorrect'), record(1, 3, 'correct'),
      record(2, 1, 'correct'), record(2, 2, 'correct'), record(2, 3, 'correct'),
    ]
    const report = buildDiagnosticReport({ topics, records, enrollmentIds: [1, 2] })

    expect(report.students.find((student) => student.enrollmentId === 1)).toMatchObject({ needsSupport: true })
    expect(report.students.find((student) => student.enrollmentId === 2)).toMatchObject({ needsSupport: false })
    expect(report.studentsNeedingSupport).toBe(1)
  })

  it('marks a topic as commonly misunderstood only when enough classified learners need practice', () => {
    const records = [
      record(1, 1, 'incorrect'), record(1, 2, 'incorrect'), record(1, 3, 'incorrect'),
      record(2, 1, 'incorrect'), record(2, 2, 'incorrect'), record(2, 3, 'correct'),
      record(3, 1, 'correct'), record(3, 2, 'correct'), record(3, 3, 'correct'),
    ]
    const report = buildDiagnosticReport({ topics, records, enrollmentIds: [1, 2, 3] })

    expect(report.topics[0].levels).toEqual({ strong: 1, needs_practice: 2, not_proven: 0 })
    expect(report.topics[0].misunderstood).toBe(true)
  })

  it('does not mark a topic as misunderstood from a single classified learner', () => {
    const records = [record(1, 1, 'incorrect'), record(1, 2, 'incorrect'), record(1, 3, 'incorrect')]
    const report = buildDiagnosticReport({ topics, records, enrollmentIds: [1, 2, 3] })

    expect(report.topics[0].misunderstood).toBe(false)
  })

  it('aggregates subtopic evidence separately from the parent topic', () => {
    const records = [
      record(1, 1, 'incorrect', 1, 'subtopic:5'),
      record(1, 2, 'incorrect', 1, 'subtopic:5'),
      record(1, 3, 'correct', 1, null),
    ]
    const report = buildDiagnosticReport({ topics, records, enrollmentIds: [1] })

    expect(report.topics[0].subtopics[0].levels).toEqual({ strong: 0, needs_practice: 0, not_proven: 1 })
    expect(report.topics[0].subtopics[0].totals).toEqual({ correct: 0, incorrect: 2, skipped: 0 })
    expect(report.students[0].topics[0].subtopics[0]).toMatchObject({ key: 'subtopic:5', incorrect: 2, answered: 2 })
    expect(report.students[0].topics[0]).toMatchObject({ answered: 3, incorrect: 2 })
  })

  it('counts the same evidence once even when it appears twice', () => {
    const records = [record(1, 1, 'incorrect'), record(1, 1, 'incorrect'), record(1, 2, 'incorrect')]
    const report = buildDiagnosticReport({ topics, records, enrollmentIds: [1] })

    expect(report.students[0].topics[0]).toMatchObject({ answered: 2, incorrect: 2, level: 'not_proven' })
  })

  it('keeps evidence from different sources as separate records', () => {
    const records = [
      record(1, 1, 'incorrect'),
      record(1, 2, 'incorrect'),
      { ...record(1, 3, 'correct'), evidenceKey: 'quiz:7:question:3' },
    ]
    const report = buildDiagnosticReport({ topics, records, enrollmentIds: [1] })

    expect(report.students[0].topics[0]).toMatchObject({ answered: 3, correct: 1, incorrect: 2, level: 'needs_practice' })
  })
})
