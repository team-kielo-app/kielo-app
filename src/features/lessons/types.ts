// src/features/lessons/types.ts
import type { ApiStatusType } from '@lib/api.d'

// KLearn Exercise Option (for MCQ type exercises - still relevant if other types use it)
export interface KLearnExerciseOption {
  id: string
  text: string
  is_correct?: boolean
}

// Base for KLearn exercises
export interface KLearnExerciseBase {
  exercise_type: string
  prompt?: string // Make prompt optional as not all exercises might have a top-level one
  item_id_fk: string // Now appears to be non-optional for trackable exercises
  item_type_fk: 'word' | 'grammar' | string // Now appears to be non-optional
}

// --- Specific KLearn Exercise Types (Aligning with payload) ---

export interface KLearnGrammarRuleExplanationExercise
  extends KLearnExerciseBase {
  exercise_type: 'grammar_rule_explanation'
  prompt: string // Contains the formatted explanation text (Markdown)
  // item_id_fk and item_type_fk are from KLearnExerciseBase
}

export interface KLearnFillInTheBlankExercise extends KLearnExerciseBase {
  exercise_type: 'fill_in_the_blank'
  prompt: string // e.g., "Apply grammar: 'adessiivi'"
  sentence_with_blank: string
  correct_answer: string
  options: string[] | null // Explicitly allow null
  explanation?: string
  // item_id_fk and item_type_fk are from KLearnExerciseBase
}

// --- Types for exercises NOT in the provided live payload, but defined earlier ---
// We'll keep their definitions but ensure they also extend KLearnExerciseBase
// and expect item_id_fk and item_type_fk if they are to be reported.

export interface KLearnFlashcardExercise extends KLearnExerciseBase {
  exercise_type: 'flashcard'
  prompt: string
  answer_text: string
}

export interface KLearnMCTranslationExercise extends KLearnExerciseBase {
  exercise_type: 'multiple_choice_translation'
  prompt: string
  source_phrase: string
  source_language?: string
  target_language?: string
  correct_translation: string
  distractor_translations: string[]
  explanation?: string
}

export interface WordScrambleItem {
  text: string
  is_correct_target_word?: boolean
}

export interface KLearnSentenceConstructionExercise extends KLearnExerciseBase {
  exercise_type: 'sentence_construction'
  prompt: string
  scrambled_words: WordScrambleItem[]
  correct_sentence: string
  translation_prompt_en?: string
  explanation?: string
}

export interface KLearnIdentifyTheConceptExercise extends KLearnExerciseBase {
  exercise_type: 'identify_the_concept'
  prompt: string
  sentence_fi: string
  options: KLearnExerciseOption[]
  correct_concept_id: string
  explanation?: string
}

// Union type for all KLearn exercises within a lesson
export type LessonExercise =
  | KLearnGrammarRuleExplanationExercise // From live payload
  | KLearnFillInTheBlankExercise // From live payload
  | KLearnFlashcardExercise // Previously defined
  | KLearnMCTranslationExercise // Previously defined
  | KLearnSentenceConstructionExercise // Previously defined
  | KLearnIdentifyTheConceptExercise // Previously defined

// Full Lesson Data structure (as per the "suggested_lessons" items in the live payload)
export interface LessonData {
  lesson_id: string
  user_id: string // Added from live payload
  lesson_title: string
  description: string // Was optional, now seems present
  exercises: LessonExercise[]
  estimated_duration_minutes: number // Was optional, now seems present
  related_concept_id: string // Was optional, now seems present
  related_concept_type: string // Was optional, now seems present
}

// State for lessonsSlice (remains the same structure, uses updated LessonData)
export interface LessonsState {
  suggestedLessons: LessonData[] // Array of full LessonData objects
  suggestedLessonsStatus: ApiStatusType
  suggestedLessonsError: string | null
}

// --- For API Response from Kielo Backend for /me/lessons/targeted ---
// This matches the top-level structure of the live payload.
export interface KieloSuggestedLessonsApiResponse {
  user_id: string
  suggested_lessons: LessonData[] // Array of LessonData
}
