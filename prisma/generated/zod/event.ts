import * as z from "zod"
import { CompleteSubscription, RelatedSubscriptionModel } from "./index"

export const EventModel = z.object({
  id: z.number().int(),
  name: z.string(),
  description: z.string().nullish(),
  isActive: z.boolean().nullish(),
  expiresAt: z.date().nullish(),
  subscriptionExpiresAt: z.date(),
  numberOfParticipants: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteEvent extends z.infer<typeof EventModel> {
  subscriptions: CompleteSubscription[]
}

/**
 * RelatedEventModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedEventModel: z.ZodSchema<CompleteEvent> = z.lazy(() => EventModel.extend({
  subscriptions: RelatedSubscriptionModel.array(),
}))
