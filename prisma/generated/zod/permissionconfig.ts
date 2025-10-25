import * as z from "zod"
import { RoleName } from "@prisma/client"
import { CompleteRole, RelatedRoleModel } from "./index"

export const PermissionConfigModel = z.object({
  id: z.number().int(),
  roleName: z.nativeEnum(RoleName),
  action: z.string(),
  entity: z.string(),
  scope: z.string(),
})

export interface CompletePermissionConfig extends z.infer<typeof PermissionConfigModel> {
  role: CompleteRole
}

/**
 * RelatedPermissionConfigModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedPermissionConfigModel: z.ZodSchema<CompletePermissionConfig> = z.lazy(() => PermissionConfigModel.extend({
  role: RelatedRoleModel,
}))
