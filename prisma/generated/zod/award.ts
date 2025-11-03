import * as z from "zod"
import { CompleteQuestion, RelatedQuestionModel, CompleteEvent, RelatedEventModel, CompleteUser, RelatedUserModel } from "./index"

export const AwardModel = z.object({
  id: z.number().int(),
  name: z.string(),
  description: z.string(),
  questionId: z.number().int().nullish(),
  winnerId: z.number().int().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteAward extends z.infer<typeof AwardModel> {
  question?: CompleteQuestion | null
  events: CompleteEvent[]
  winner?: CompleteUser | null
}

/**
 * RelatedAwardModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedAwardModel: z.ZodSchema<CompleteAward> = z.lazy(() => AwardModel.extend({
  question: RelatedQuestionModel.nullish(),
  events: RelatedEventModel.array(),
  winner: RelatedUserModel.nullish(),
}))
