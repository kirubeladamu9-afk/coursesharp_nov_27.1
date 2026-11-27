export const DIAGNOSTIC_LEVELS = ['strong', 'needs_practice', 'not_proven']

export const DIAGNOSTIC_THRESHOLDS = {
  minAnswered: 3,
  needsPracticeIncorrect: 2,
  strongAccuracyPercent: 80,
  misunderstoodMinLearners: 2,
  misunderstoodSharePercent: 50,
}

const OUTCOMES = ['correct', 'incorrect', 'skipped']

const groupKey = (...parts) => JSON.stringify(parts)
const emptyOutcomeCounts = () => ({ correct: 0, incorrect: 0, skipped: 0 })
const emptyLevelCounts = () => Object.fromEntries(DIAGNOSTIC_LEVELS.map((level) => [level, 0]))

export const classifyEvidence = ({ correct = 0, incorrect = 0 }) => {
  const answered = correct + incorrect
  if (answered < DIAGNOSTIC_THRESHOLDS.minAnswered) return 'not_proven'
  if (incorrect >= DIAGNOSTIC_THRESHOLDS.needsPracticeIncorrect) return 'needs_practice'
  if (correct * 100 >= answered * DIAGNOSTIC_THRESHOLDS.strongAccuracyPercent) return 'strong'
  return 'not_proven'
}

const isMisunderstood = (levelCounts) => {
  const classified = levelCounts.strong + levelCounts.needs_practice
  return classified >= DIAGNOSTIC_THRESHOLDS.misunderstoodMinLearners
    && levelCounts.needs_practice * 100 >= classified * DIAGNOSTIC_THRESHOLDS.misunderstoodSharePercent
}

const addOutcome = (groups, key, outcome) => {
  const counts = groups.get(key) ?? emptyOutcomeCounts()
  counts[outcome] += 1
  groups.set(key, counts)
}

const summarizeLearnerCounts = (counts) => ({
  ...(counts ?? emptyOutcomeCounts()),
  answered: (counts?.correct ?? 0) + (counts?.incorrect ?? 0),
  level: classifyEvidence(counts ?? {}),
})

export const resolveCheckpointSubtopic = ({ subtopicId, customSubtopic }, registeredTitles) => {
  if (Number.isInteger(subtopicId)) {
    const title = registeredTitles.get(subtopicId)
    return title ? { key: `subtopic:${subtopicId}`, title } : null
  }
  const label = typeof customSubtopic === 'string' ? customSubtopic.trim().replace(/\s+/g, ' ') : ''
  return label ? { key: `custom:${label.toLowerCase()}`, title: label } : null
}

const summarizeClass = (enrollmentIds, groups, scopeParts) => {
  const levels = emptyLevelCounts()
  const totals = emptyOutcomeCounts()
  for (const enrollmentId of enrollmentIds) {
    const counts = groups.get(groupKey(enrollmentId, ...scopeParts))
    levels[classifyEvidence(counts ?? {})] += 1
    if (!counts) continue
    for (const outcome of OUTCOMES) totals[outcome] += counts[outcome]
  }
  return { levels, totals, misunderstood: isMisunderstood(levels) }
}

export const buildDiagnosticReport = ({ topics, records, enrollmentIds }) => {
  const seenEvents = new Set()
  const topicGroups = new Map()
  const subtopicGroups = new Map()

  for (const record of records) {
    if (!OUTCOMES.includes(record.outcome)) continue
    const eventKey = groupKey(record.enrollmentId, record.evidenceKey)
    if (seenEvents.has(eventKey)) continue
    seenEvents.add(eventKey)
    addOutcome(topicGroups, groupKey(record.enrollmentId, record.topicId), record.outcome)
    if (record.subtopicKey) addOutcome(subtopicGroups, groupKey(record.enrollmentId, record.topicId, record.subtopicKey), record.outcome)
  }

  const reportTopics = topics.map((topic) => {
    const topicSummary = summarizeClass(enrollmentIds, topicGroups, [topic.id])
    return {
      id: topic.id,
      title: topic.title,
      levels: topicSummary.levels,
      totals: topicSummary.totals,
      misunderstood: topicSummary.misunderstood,
      subtopics: topic.subtopics.map((subtopic) => {
        const subtopicSummary = summarizeClass(enrollmentIds, subtopicGroups, [topic.id, subtopic.key])
        return { key: subtopic.key, title: subtopic.title, levels: subtopicSummary.levels, totals: subtopicSummary.totals, misunderstood: subtopicSummary.misunderstood }
      }),
    }
  })

  const students = enrollmentIds.map((enrollmentId) => {
    const studentTopics = topics.flatMap((topic) => {
      const counts = topicGroups.get(groupKey(enrollmentId, topic.id))
      if (!counts) return []
      const subtopics = topic.subtopics.flatMap((subtopic) => {
        const subtopicCounts = subtopicGroups.get(groupKey(enrollmentId, topic.id, subtopic.key))
        return subtopicCounts ? [{ key: subtopic.key, title: subtopic.title, ...summarizeLearnerCounts(subtopicCounts) }] : []
      })
      return [{ topicId: topic.id, title: topic.title, ...summarizeLearnerCounts(counts), subtopics }]
    })
    return {
      enrollmentId,
      needsSupport: studentTopics.some((topic) => topic.level === 'needs_practice'),
      topics: studentTopics,
    }
  })

  return {
    topics: reportTopics,
    students,
    studentsNeedingSupport: students.filter((student) => student.needsSupport).length,
  }
}
