import * as z from "zod"
import { CompleteRoleToUser, RelatedRoleToUserModel } from "./index"

export const UserModel = z.object({
  id: z.number().int(),
  username: z.string(),
  email: z.string(),
  password: z.string(),
  avatarUrl: z.string().nullish(),
  note: z.string().nullish(),
  deleted: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteUser extends z.infer<typeof UserModel> {
  roles: CompleteRoleToUser[]
}

/**
 * RelatedUserModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedUserModel: z.ZodSchema<CompleteUser> = z.lazy(() => UserModel.extend({
  roles: RelatedRoleToUserModel.array(),
}))
