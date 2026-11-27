import { createContext, useContext } from 'react'
import { type LearningTopicScope } from '@/services/api'

export const LearningTopicScopeContext = createContext<LearningTopicScope | null>(null)

export const useLearningTopicScope = () => useContext(LearningTopicScopeContext)
