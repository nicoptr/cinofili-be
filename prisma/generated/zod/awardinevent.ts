import * as z from "zod"
import { CompleteAward, RelatedAwardModel, CompleteEvent, RelatedEventModel, CompleteUser, RelatedUserModel } from "./index"

export const AwardInEventModel = z.object({
  id: z.number().int(),
  awardId: z.number().int(),
  eventId: z.number().int(),
  winnerId: z.number().int().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteAwardInEvent extends z.infer<typeof AwardInEventModel> {
  award: CompleteAward
  event: CompleteEvent
  winner?: CompleteUser | null
}

/**
 * RelatedAwardInEventModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedAwardInEventModel: z.ZodSchema<CompleteAwardInEvent> = z.lazy(() => AwardInEventModel.extend({
  award: RelatedAwardModel,
  event: RelatedEventModel,
  winner: RelatedUserModel.nullish(),
}))
