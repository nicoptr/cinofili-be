import * as z from "zod"
import { CompleteUser, RelatedUserModel, CompleteCategory, RelatedCategoryModel, CompleteEvent, RelatedEventModel, CompleteAnswer, RelatedAnswerModel } from "./index"

export const SubscriptionModel = z.object({
  id: z.number().int(),
  ownerId: z.number().int(),
  movieName: z.string(),
  isValid: z.boolean().nullish(),
  categoryId: z.number().int(),
  eventId: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteSubscription extends z.infer<typeof SubscriptionModel> {
  owner: CompleteUser
  category?: CompleteCategory | null
  event: CompleteEvent
  scorecard: CompleteAnswer[]
}

/**
 * RelatedSubscriptionModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedSubscriptionModel: z.ZodSchema<CompleteSubscription> = z.lazy(() => SubscriptionModel.extend({
  owner: RelatedUserModel,
  category: RelatedCategoryModel.nullish(),
  event: RelatedEventModel,
  scorecard: RelatedAnswerModel.array(),
}))
