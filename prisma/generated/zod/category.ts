import * as z from "zod"
import { CompleteSubscription, RelatedSubscriptionModel, CompleteEvent, RelatedEventModel } from "./index"

export const CategoryModel = z.object({
  id: z.number().int(),
  name: z.string(),
  description: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteCategory extends z.infer<typeof CategoryModel> {
  subscription: CompleteSubscription[]
  events: CompleteEvent[]
}

/**
 * RelatedCategoryModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedCategoryModel: z.ZodSchema<CompleteCategory> = z.lazy(() => CategoryModel.extend({
  subscription: RelatedSubscriptionModel.array(),
  events: RelatedEventModel.array(),
}))
