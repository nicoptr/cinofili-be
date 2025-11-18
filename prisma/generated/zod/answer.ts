import * as z from "zod"
import { CompleteQuestion, RelatedQuestionModel, CompleteUser, RelatedUserModel, CompleteSubscription, RelatedSubscriptionModel } from "./index"

export const AnswerModel = z.object({
  id: z.number().int(),
  value: z.number().int(),
  text: z.string().nullish(),
  questionId: z.number().int(),
  userId: z.number().int().nullish(),
  subscriptionId: z.number().int().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteAnswer extends z.infer<typeof AnswerModel> {
  question: CompleteQuestion
  user?: CompleteUser | null
  subscription?: CompleteSubscription | null
}

/**
 * RelatedAnswerModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedAnswerModel: z.ZodSchema<CompleteAnswer> = z.lazy(() => AnswerModel.extend({
  question: RelatedQuestionModel,
  user: RelatedUserModel.nullish(),
  subscription: RelatedSubscriptionModel.nullish(),
}))
