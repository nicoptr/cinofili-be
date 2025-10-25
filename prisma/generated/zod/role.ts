import * as z from "zod"
import { RoleName } from "@prisma/client"
import { CompleteRoleToUser, RelatedRoleToUserModel, CompletePermissionConfig, RelatedPermissionConfigModel, CompleteHiddenComponentConfig, RelatedHiddenComponentConfigModel } from "./index"

export const RoleModel = z.object({
  name: z.nativeEnum(RoleName),
  label: z.string().nullish(),
  rank: z.number(),
  isActive: z.boolean().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteRole extends z.infer<typeof RoleModel> {
  users: CompleteRoleToUser[]
  permissionConfigs: CompletePermissionConfig[]
  hiddenComponentConfigs: CompleteHiddenComponentConfig[]
}

/**
 * RelatedRoleModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedRoleModel: z.ZodSchema<CompleteRole> = z.lazy(() => RoleModel.extend({
  users: RelatedRoleToUserModel.array(),
  permissionConfigs: RelatedPermissionConfigModel.array(),
  hiddenComponentConfigs: RelatedHiddenComponentConfigModel.array(),
}))
