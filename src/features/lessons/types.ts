import type { ApiStatusType } from '@lib/api.d'

export interface KLearnExerciseOption {
  id: string
  text: string
  is_correct?: boolean
}

export interface KLearnExerciseBase {
  exercise_type: string
  prompt?: string
  item_id_fk: string
  item_type_fk: 'word' | 'grammar' | string
}

export interface KLearnGrammarRuleExplanationExercise
  extends KLearnExerciseBase {
  exercise_type: 'grammar_rule_explanation'
  prompt: string
}

export interface KLearnFillInTheBlankExercise extends KLearnExerciseBase {
  exercise_type: 'fill_in_the_blank'
  prompt: string
  sentence_with_blank: string
  correct_answer: string
  options: string[] | null
  explanation?: string
}

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

export type LessonExercise =
  | KLearnGrammarRuleExplanationExercise
  | KLearnFillInTheBlankExercise
  | KLearnFlashcardExercise
  | KLearnMCTranslationExercise
  | KLearnSentenceConstructionExercise
  | KLearnIdentifyTheConceptExercise

export interface LessonData {
  lesson_id: string
  user_id: string
  lesson_title: string
  description: string
  exercises: LessonExercise[]
  estimated_duration_minutes: number
  related_concept_id: string
  related_concept_type: string
}

export interface LessonsState {
  suggestedLessons: LessonData[]
  suggestedLessonsStatus: ApiStatusType
  suggestedLessonsError: string | null
}

export interface KieloSuggestedLessonsApiResponse {
  user_id: string
  suggested_lessons: LessonData[]
}
