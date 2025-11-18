import * as z from "zod"
import { CompleteRoleToUser, RelatedRoleToUserModel, CompleteSubscription, RelatedSubscriptionModel, CompleteEvent, RelatedEventModel, CompleteAnswer, RelatedAnswerModel, CompleteAwardInEvent, RelatedAwardInEventModel } from "./index"

// Helper schema for JSON fields
type Literal = boolean | number | string | null
type Json = Literal | { [key: string]: Json } | Json[]
const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()])
const jsonSchema: z.ZodSchema<Json> = z.lazy(() => z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]))

export const UserModel = z.object({
  id: z.number().int(),
  username: z.string(),
  email: z.string(),
  password: z.string(),
  avatarUrl: z.string().nullish(),
  note: z.string().nullish(),
  eventSpecification: jsonSchema,
  deleted: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteUser extends z.infer<typeof UserModel> {
  roles: CompleteRoleToUser[]
  subscription: CompleteSubscription[]
  events: CompleteEvent[]
  answers: CompleteAnswer[]
  wind: CompleteAwardInEvent[]
}

/**
 * RelatedUserModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedUserModel: z.ZodSchema<CompleteUser> = z.lazy(() => UserModel.extend({
  roles: RelatedRoleToUserModel.array(),
  subscription: RelatedSubscriptionModel.array(),
  events: RelatedEventModel.array(),
  answers: RelatedAnswerModel.array(),
  wind: RelatedAwardInEventModel.array(),
}))
