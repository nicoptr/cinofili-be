import * as z from "zod"
import { RoleName } from "@prisma/client"
import { CompleteRole, RelatedRoleModel, CompleteUser, RelatedUserModel } from "./index"

export const RoleToUserModel = z.object({
  id: z.number().int(),
  roleName: z.nativeEnum(RoleName),
  userId: z.number().int(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteRoleToUser extends z.infer<typeof RoleToUserModel> {
  role: CompleteRole
  user: CompleteUser
}

/**
 * RelatedRoleToUserModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedRoleToUserModel: z.ZodSchema<CompleteRoleToUser> = z.lazy(() => RoleToUserModel.extend({
  role: RelatedRoleModel,
  user: RelatedUserModel,
}))
