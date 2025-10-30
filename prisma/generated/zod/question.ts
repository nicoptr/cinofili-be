import * as z from "zod"
import { CompleteAward, RelatedAwardModel, CompleteAnswer, RelatedAnswerModel } from "./index"

export const QuestionModel = z.object({
  id: z.number().int(),
  ordinal: z.number().int(),
  text: z.string(),
  awardId: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteQuestion extends z.infer<typeof QuestionModel> {
  award: CompleteAward
  answers: CompleteAnswer[]
}

/**
 * RelatedQuestionModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedQuestionModel: z.ZodSchema<CompleteQuestion> = z.lazy(() => QuestionModel.extend({
  award: RelatedAwardModel,
  answers: RelatedAnswerModel.array(),
}))
